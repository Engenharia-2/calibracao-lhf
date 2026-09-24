import { useState, useEffect, useRef } from 'react';
import { IEquipment } from '../services/equipments/ApiEquipmentsRepository';
import { ICalibrationTemplate, ITemplateSection } from '../services/templates/ApiTemplatesRepository';
import { IReferenceStandard } from '../services/standards/ApiStandardsRepository';
import { IClient } from '../services/clients/ApiClientsRepository';
import { UserData } from '../App';
import { pdf } from '@react-pdf/renderer';
import { CalibrationPDFDocument } from '../components/Calibration/CalibrationPDFDocument/CalibrationPDFDocument';
import { createCalibrationStandardSnapshot } from '../domain/calibration/calibrationStandardSnapshot';
import { useCalibrationGrid } from './useCalibrationGrid';
import { calculatePointMetrology, parseNumber, round, matchStandardPoint } from '../core/domain/metrology';
import { IStandardPoint } from '../services/standards/ApiStandardsRepository';

export type { GridState } from './useCalibrationGrid';

interface UseCalibrationWorkspaceProps {
  currentUser?: UserData | null;
  equipment: IEquipment;
  onSuccess?: () => void;
}

export function useCalibrationWorkspace({ currentUser, equipment, onSuccess }: UseCalibrationWorkspaceProps) {
  const [templates, setTemplates] = useState<ICalibrationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateDetail, setTemplateDetail] = useState<ICalibrationTemplate | null>(null);
  
  // Padrões de referência
  const [standards, setStandards] = useState<IReferenceStandard[]>([]);

  // Dados ambientais usando refs
  const locationRef = useRef<HTMLInputElement>(null);
  const temperatureRef = useRef<HTMLInputElement>(null);
  const humidityRef = useRef<HTMLInputElement>(null);
  const mainsVoltageRef = useRef<HTMLInputElement>(null);
  const observationsRef = useRef<HTMLTextAreaElement>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Clientes
  const [clients, setClients] = useState<IClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | string>('');
  const [sectionCorrections, setSectionCorrections] = useState<Record<number, boolean>>({});
  const [sectionScaleModes, setSectionScaleModes] = useState<Record<number, { mode: 'point' | 'scale', scaleValue?: number }>>({});
  
  const updateSectionScaleMode = (sectionIndex: number, mode: 'point' | 'scale', scaleValue?: number) => {
    setSectionScaleModes(prev => ({ ...prev, [sectionIndex]: { mode, scaleValue } }));
  };

  const toggleSectionCorrection = (sectionIndex: number, value: boolean) => {
    setSectionCorrections(prev => ({ ...prev, [sectionIndex]: value }));
  };

  const { gridState, setGridState, updateCell, generateAutoFilledGrid } = useCalibrationGrid();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza o operador se o usuário estiver disponível
  useEffect(() => {
    if (locationRef.current) {
      console.log('locationRef value mudou:', locationRef.current.value);
    }
  }, [locationRef]);

  // Buscar os modelos de formulário e os padrões de referência
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (typeof window.electron?.getTemplates === 'function') {
          const list = await window.electron.getTemplates();
          setTemplates(list);
        }
        if (typeof window.electron?.getStandards === 'function') {
          const stdList = await window.electron.getStandards();
          setStandards(stdList);
        }
        if (typeof window.electron?.getClients === 'function') {
          const clientList = await window.electron.getClients();
          setClients(clientList);
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError('Erro ao carregar os modelos, padrões ou clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);



  // Quando o modelo de formulário selecionado mudar
  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateDetail(null);
      setGridState({});
      setStartedAt(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        if (typeof window.electron?.getTemplateById === 'function') {
          const detail: ICalibrationTemplate = await window.electron.getTemplateById(selectedTemplateId);
          setTemplateDetail(detail);
          setStartedAt(new Date().toISOString());

          const autoFilled = generateAutoFilledGrid(detail, standards);
          setGridState(autoFilled);
        }
      } catch (err) {
        console.error('Erro ao buscar formulário:', err);
        setError('Erro ao carregar detalhes do formulário selecionado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [selectedTemplateId]);

  // Escuta atualizações de padrões em tempo real e re-sincroniza a tela de calibração
  useEffect(() => {
    if (typeof window.electron?.onStandardsUpdated !== 'function') return;

    const cleanup = window.electron.onStandardsUpdated(async () => {
      console.log('[useCalibrationWorkspace] Sinal de atualização de padrões recebido! Sincronizando...');
      try {
        const stdList = await window.electron.getStandards();
        setStandards(stdList);

        if (templateDetail) {
          setGridState(prev => generateAutoFilledGrid(templateDetail, stdList, prev));
        }
      } catch (err) {
        console.error('Erro ao sincronizar padrões:', err);
      }
    });

    return () => cleanup();
  }, [templateDetail]);

  const getPointCalculationsWrapper = (sectionIndex: number, pointIndex: number) => {
    if (!templateDetail) return null;
    const sectionData = gridState[sectionIndex]?.[pointIndex];
    const struct = typeof templateDetail.structure === 'string'
      ? JSON.parse(templateDetail.structure)
      : templateDetail.structure;
    const sec = struct[sectionIndex];
    const sectionStandard = standards.find(s => s.id === sec.standard_id) || null;
    const scaleConfig = sectionScaleModes[sectionIndex];
      return calculatePointMetrology(templateDetail, sectionStandard, sectionIndex, pointIndex, sectionData, sectionCorrections[sectionIndex] || false, scaleConfig);
  };

  // Submeter a calibração finalizada
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const location = locationRef.current?.value || 'Laboratório de Calibração LHF';
    const operator = currentUser?.name || 'Técnico Desconhecido';
    const temperature = temperatureRef.current?.value || '';
    const humidity = humidityRef.current?.value || '';
    const mainsVoltage = mainsVoltageRef.current?.value || '';
    const observations = observationsRef.current?.value || '';

    if (!selectedTemplateId || !temperature || !humidity) {
      setError('Por favor, preencha as Condições Ambientais.');
      return;
    }

    setIsLoading(true);

    try {
      const struct = typeof templateDetail!.structure === 'string'
        ? JSON.parse(templateDetail!.structure)
        : templateDetail!.structure;

      let overallStatus = 'Aprovado';
      const resultsBySection = (struct || []).map((section: ITemplateSection, sIdx: number) => {
        const sectionStandard = standards.find(s => s.id === section.standard_id) || null;
        const pointsResults = section.points.map((point, pIdx) => {
          const calcs = getPointCalculationsWrapper(sIdx, pIdx);
          if (calcs && calcs.status === 'Reprovado') {
            overallStatus = 'Reprovado';
          }
          
          const cyclesData = [];
          for (let c = 0; c < section.cyclesCount; c++) {
            const rawRow = gridState[sIdx]?.[pIdx]?.[c] || {};
            const row = { ...rawRow };
            if (sectionCorrections[sIdx] && sectionStandard) {
              let parsedPoints: IStandardPoint[] = [];
              if (typeof sectionStandard.points === 'string') {
                try { parsedPoints = JSON.parse(sectionStandard.points); } catch(e) {}
              } else if (Array.isArray(sectionStandard.points)) {
                parsedPoints = sectionStandard.points;
              }
              const rbcPoint = matchStandardPoint(parsedPoints, point, section.defaultUnit);
              if (rbcPoint && row['standard'] !== undefined) {
                const stdVal = parseNumber(row['standard']);
                if (!isNaN(stdVal)) {
                  const correction = rbcPoint.nominalValue - rbcPoint.referenceValue;
                  row['standard'] = String(round(stdVal + correction, 6)).replace('.', ',');
                }
              }
            }
            cyclesData.push(row);
          }

          return {
            group: point.group,
            targetValue: point.targetValue,
            unit: point.unit || section.defaultUnit,
            resolution: point.resolution,
            cycles: cyclesData,
            ...calcs
          };
        });

        return {
          sectionName: section.name,
          standard: sectionStandard ? createCalibrationStandardSnapshot(sectionStandard) : null,
          applyCorrection: sectionCorrections[sIdx] || false,
            scaleMode: sectionScaleModes[sIdx]?.mode || 'point',
            scaleValue: sectionScaleModes[sIdx]?.scaleValue || null,
            points: pointsResults
        };
      });

      const calibrationRecord = {
        equipmentId: equipment.id,
        clientId: selectedClientId ? Number(selectedClientId) : null,
        templateId: selectedTemplateId,
        operator,
        location,
        temperature: parseNumber(temperature),
        humidity: parseNumber(humidity),
        mainsVoltage: mainsVoltage ? parseNumber(mainsVoltage) : null,
        observations,
        readings: resultsBySection,
        overallStatus,
        startedAt: startedAt || new Date().toISOString(),
        applyStandardCorrection: false,
        operator_signature_url: currentUser?.signatureUrl || null
      };

      if (typeof (window as any).electron?.saveCalibration === 'function') {
        const savedResult = await (window as any).electron.saveCalibration(calibrationRecord);
        
        const clientDetail = clients.find(c => c.id === Number(selectedClientId));
        
        const fullRecordForPdf = {
          ...calibrationRecord,
          id: savedResult?.id || Date.now(),
          created_at: savedResult?.created_at || new Date().toISOString(),
          template_name: templateDetail?.name || '',
          template_procedure: templateDetail?.procedure_text || null,
          client_company: clientDetail?.company || null,
          client_cnpj: clientDetail?.cnpj || null,
          client_email: clientDetail?.email || null,
          client_adress: clientDetail?.adress || null,
          client_city: clientDetail?.city || null,
          observations,
          standard_code: null,
          standard_name: null,
          standard_certificate: null,
          standard_certificate_url: null,
          operator_signature_url: currentUser?.signatureUrl || null
        };

        try {
          console.log('[useCalibrationWorkspace.ts] Iniciando geração programática do PDF...');
          const doc = (
            <CalibrationPDFDocument
              record={fullRecordForPdf as any}
              equipmentName={equipment.name}
              equipmentNs={equipment.ns}
              equipmentOp={equipment.op}
              equipmentType={equipment.equipment_type || '-'}
              equipmentRange={equipment.measurement_range || '-'}
            />
          );

          const blob = await pdf(doc).toBlob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          const [day, month, year] = new Date(fullRecordForPdf.created_at).toLocaleDateString('pt-BR').split('/');
          const yearYY = year.slice(-2);
          link.download = `Certificado-${yearYY}${month}${day}${equipment.op}.pdf`;
          
          link.click();
          URL.revokeObjectURL(url);
          console.log('[useCalibrationWorkspace.ts] PDF gerado e download disparado com sucesso!');
        } catch (pdfErr) {
          console.error('Erro ao gerar/baixar o PDF na finalização:', pdfErr);
        }

        if (onSuccess) onSuccess();
      } else {
        throw new Error('Electron saveCalibration function not available');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao salvar o registro de calibração.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    standards,
    templateDetail,
    locationRef,
    temperatureRef,
    humidityRef,
    mainsVoltageRef,
    observationsRef,
    gridState,
    updateCell,
    getPointCalculations: getPointCalculationsWrapper,
    handleSave,
    isLoading,
    error,
    clients,
    selectedClientId,
    setSelectedClientId,
    sectionCorrections,
    toggleSectionCorrection,
    sectionScaleModes,
    updateSectionScaleMode
  };
}
