import { useState, useEffect } from 'react';
import { IEquipment } from '../services/equipments/ApiEquipmentsRepository';
import { ICalibrationTemplate, ITemplateSection } from '../services/templates/ApiTemplatesRepository';
import { IReferenceStandard, IStandardPoint } from '../services/standards/ApiStandardsRepository';
import { IClient } from '../services/clients/ApiClientsRepository';
import { UserData } from '../App';

interface UseCalibrationWorkspaceProps {
  currentUser?: UserData | null;
  equipment: IEquipment;
  onSuccess?: () => void;
}

const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === '') return NaN;
  const normalized = String(val).replace(',', '.');
  return parseFloat(normalized);
};

export interface GridState {
  [sectionIndex: number]: {
    [pointIndex: number]: {
      [cycleIndex: number]: {
        [columnKey: string]: string | number;
      }
    }
  }
}

export function useCalibrationWorkspace({ currentUser, equipment, onSuccess }: UseCalibrationWorkspaceProps) {
  const [templates, setTemplates] = useState<ICalibrationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateDetail, setTemplateDetail] = useState<ICalibrationTemplate | null>(null);
  
  // Padrões de referência
  const [standards, setStandards] = useState<IReferenceStandard[]>([]);
  const [selectedStandardId, setSelectedStandardId] = useState<number | string>('');
  const [selectedStandard, setSelectedStandard] = useState<IReferenceStandard | null>(null);

  // Dados ambientais: pré-preenche o operador com o nome do usuário logado
  const [operator, setOperator] = useState(currentUser?.name || '');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [mainsVoltage, setMainsVoltage] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Clientes
  const [clients, setClients] = useState<IClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | string>('');

  // Sincroniza o operador se o usuário estiver disponível
  useEffect(() => {
    if (currentUser?.name && !operator) {
      setOperator(currentUser.name);
    }
  }, [currentUser]);

  const [gridState, setGridState] = useState<GridState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          if (stdList.length > 0) {
            setSelectedStandardId(stdList[0].id!);
            setSelectedStandard(stdList[0]);
          }
        }
        if (typeof window.electron?.getClients === 'function') {
          const clientList = await window.electron.getClients();
          setClients(clientList);
          if (clientList.length > 0) {
            // Pode selecionar o primeiro por padrão se desejado, ou deixar vazio
            // setSelectedClientId(clientList[0].id!);
          }
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

  // Função auxiliar para gerar gridState com auto-preenchimento dos valores do Padrão RBC (VR)
  const generateAutoFilledGrid = (template: ICalibrationTemplate, std: IReferenceStandard | null, existingGrid: GridState = {}) => {
    if (!template) return {};

    const struct = typeof template.structure === 'string'
      ? JSON.parse(template.structure)
      : template.structure;

    if (!Array.isArray(struct)) return {};

    let parsedPoints: IStandardPoint[] = [];
    if (std) {
      if (typeof std.points === 'string') {
        try { parsedPoints = JSON.parse(std.points); } catch(e) {}
      } else if (Array.isArray(std.points)) {
        parsedPoints = std.points;
      }
    }

    const nextGrid: GridState = { ...existingGrid };

    struct.forEach((section: ITemplateSection, sIdx: number) => {
      if (!nextGrid[sIdx]) nextGrid[sIdx] = {};
      const hasStandardCol = section.columns.some((col: any) => col.key === 'standard');

      section.points.forEach((point, pIdx) => {
        if (!nextGrid[sIdx][pIdx]) nextGrid[sIdx][pIdx] = {};
        
        const rbcPoint = parsedPoints.find(p => Math.abs(p.nominalValue - point.targetValue) < 0.0001) || null;
        const refVal = rbcPoint ? String(rbcPoint.referenceValue) : String(point.targetValue);

        for (let c = 0; c < section.cyclesCount; c++) {
          if (!nextGrid[sIdx][pIdx][c]) nextGrid[sIdx][pIdx][c] = {};
          if (hasStandardCol) {
            nextGrid[sIdx][pIdx][c] = {
              ...nextGrid[sIdx][pIdx][c],
              standard: refVal
            };
          }
        }
      });
    });

    return nextGrid;
  };

  // Quando o padrão selecionado muda manualmente
  const handleStandardChange = (idStr: string) => {
    const id = Number(idStr);
    setSelectedStandardId(id);
    const found = standards.find(s => s.id === id) || null;
    setSelectedStandard(found);

    if (templateDetail) {
      setGridState(prev => generateAutoFilledGrid(templateDetail, found, prev));
    }
  };

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

          // Se o formulário tiver um padrão vinculado, busca a versão mais recente diretamente do BD
          let activeStd = selectedStandard;
          if (detail.default_standard_id) {
            try {
              const freshStd = await window.electron.getStandardById(detail.default_standard_id);
              if (freshStd) {
                setSelectedStandardId(freshStd.id!);
                setSelectedStandard(freshStd);
                activeStd = freshStd;
              }
            } catch (e) {
              console.error('Erro ao buscar padrão vinculado:', e);
            }
          }

          // Auto-preenche as células da coluna "Padrão" com os valores RBC (VR)
          const autoFilled = generateAutoFilledGrid(detail, activeStd);
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

        if (selectedStandardId) {
          const updatedStd = await window.electron.getStandardById(selectedStandardId);
          if (updatedStd) {
            setSelectedStandard(updatedStd);
            if (templateDetail) {
              setGridState(prev => generateAutoFilledGrid(templateDetail, updatedStd, prev));
            }
          }
        }
      } catch (err) {
        console.error('Erro ao sincronizar padrões:', err);
      }
    });

    return () => cleanup();
  }, [selectedStandardId, templateDetail]);

  // Atualizar célula do grid reativo
  const updateCell = (
    sectionIndex: number,
    pointIndex: number,
    cycleIndex: number,
    columnKey: string,
    value: string
  ) => {
    setGridState(prev => {
      const next = { ...prev };
      if (!next[sectionIndex]) next[sectionIndex] = {};
      if (!next[sectionIndex][pointIndex]) next[sectionIndex][pointIndex] = {};
      if (!next[sectionIndex][pointIndex][cycleIndex]) next[sectionIndex][pointIndex][cycleIndex] = {};
      
      next[sectionIndex][pointIndex][cycleIndex] = {
        ...next[sectionIndex][pointIndex][cycleIndex],
        [columnKey]: value
      };
      
      return next;
    });
  };

  const round = (val: number, dec: number) => {
    const f = Math.pow(10, dec);
    return Math.round((val + Number.EPSILON) * f) / f;
  };

  // Obter cálculos metrológicos de um ponto específico incorporando Incertezas RBC + Bancada (GUM)
  const getPointCalculations = (sectionIndex: number, pointIndex: number) => {
    if (!templateDetail) return null;
    
    const struct = typeof templateDetail!.structure === 'string'
      ? JSON.parse(templateDetail!.structure)
      : templateDetail!.structure;
    const section = struct[sectionIndex];
    const point = section.points[pointIndex];
    const sectionData = gridState[sectionIndex]?.[pointIndex];

    if (!sectionData || !point) {
      return { averageStandard: 0, averageEquipment: 0, deviation: 0, uncertaintyExpanded: 0, tolerance: 0, status: 'Reprovado' as const };
    }

    const stdValues: number[] = [];
    const eqValues: number[] = [];

    for (let c = 0; c < section.cyclesCount; c++) {
      const cycleData = sectionData[c] || {};
      const stdVal = parseNumber(cycleData['standard']);
      if (!isNaN(stdVal)) stdValues.push(stdVal);

      // Procurar valores do equipamento (qualquer coluna que não seja 'standard')
      const eqKeys = section.columns.filter((col: any) => col.key !== 'standard').map((col: any) => col.key);
      
      if (eqKeys.length === 1) {
        const eqVal = parseNumber(cycleData[eqKeys[0]]);
        if (!isNaN(eqVal)) eqValues.push(eqVal);
      } else {
        let foundVal = NaN;
        for (const key of eqKeys) {
          const val = parseNumber(cycleData[key]);
          if (!isNaN(val) && String(cycleData[key]) !== '-') {
            foundVal = val;
            break;
          }
        }
        if (!isNaN(foundVal)) eqValues.push(foundVal);
      }
    }

    // Busca o ponto RBC correspondente no Padrão selecionado
    let rbcPoint: IStandardPoint | null = null;
    if (selectedStandard) {
      let parsedPoints: IStandardPoint[] = [];
      if (typeof selectedStandard.points === 'string') {
        try { parsedPoints = JSON.parse(selectedStandard.points); } catch(e) {}
      } else if (Array.isArray(selectedStandard.points)) {
        parsedPoints = selectedStandard.points;
      }
      rbcPoint = parsedPoints.find(p => Math.abs(p.nominalValue - point.targetValue) < 0.0001) || null;
    }

    const referenceValue = rbcPoint ? rbcPoint.referenceValue : (stdValues.length ? stdValues.reduce((a,b)=>a+b,0)/stdValues.length : point.targetValue);
    const averageStandard = referenceValue;
    const averageEquipment = eqValues.length ? eqValues.reduce((a,b)=>a+b,0)/eqValues.length : 0;
    const deviation = averageEquipment - averageStandard;

    // 1. Incerteza de Repetibilidade (u_rep)
    let u_rep = 0;
    if (eqValues.length > 1) {
      const mean = averageEquipment;
      const variance = eqValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (eqValues.length - 1);
      u_rep = Math.sqrt(variance);
    }

    // 2. Incerteza do Certificado Externa (u_cert = U_ext / k)
    const U_ext = rbcPoint ? rbcPoint.uncertaintyExpanded : 0;
    const k_ext = rbcPoint ? (rbcPoint.kFactor || 2) : 2;
    const u_cert = U_ext / k_ext;

    // 3. Incerteza de Resolução (u_res = Resolução / sqrt(3))
    const resolution = rbcPoint ? (rbcPoint.resolution || 0.01) : 0.01;
    const u_res = resolution / Math.sqrt(3);

    // 4. Incerteza Combinada (u_c) e Expandida (U)
    const u_c = Math.sqrt(Math.pow(u_rep, 2) + Math.pow(u_cert, 2) + Math.pow(u_res, 2));
    const u_expanded = round(u_c * 2, 6);

    // 5. Tolerância Permetida MPE e Aprovação (|Desvio| + U <= MPE)
    const tolerance = round(Math.abs(averageStandard) * (templateDetail.tolerance / 100), 6);
    const status = (Math.abs(deviation) + u_expanded) <= tolerance ? 'Aprovado' : 'Reprovado';

    return {
      averageStandard: round(averageStandard, 6),
      averageEquipment: round(averageEquipment, 6),
      deviation: round(deviation, 6),
      uncertaintyExpanded: u_expanded,
      tolerance,
      status
    };
  };

  // Submeter a calibração finalizada
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTemplateId || !operator || !temperature || !humidity) {
      setError('Por favor, preencha o Operador e as Condições Ambientais.');
      return;
    }

    setIsLoading(true);

    try {
      const struct = typeof templateDetail!.structure === 'string'
        ? JSON.parse(templateDetail!.structure)
        : templateDetail!.structure;

      let overallStatus = 'Aprovado';
      const resultsBySection = (struct || []).map((section: ITemplateSection, sIdx: number) => {
        const pointsResults = section.points.map((point, pIdx) => {
          const calcs = getPointCalculations(sIdx, pIdx);
          if (calcs && calcs.status === 'Reprovado') {
            overallStatus = 'Reprovado';
          }
          
          const cyclesData = [];
          for (let c = 0; c < section.cyclesCount; c++) {
            cyclesData.push(gridState[sIdx]?.[pIdx]?.[c] || {});
          }

          return {
            group: point.group,
            targetValue: point.targetValue,
            unit: point.unit || section.defaultUnit,
            cycles: cyclesData,
            ...calcs
          };
        });

        return {
          sectionName: section.name,
          points: pointsResults
        };
      });

      const calibrationRecord = {
        equipmentId: equipment.id,
        clientId: selectedClientId ? Number(selectedClientId) : null,
        templateId: selectedTemplateId,
        standardId: selectedStandardId || null,
        operator,
        temperature: parseNumber(temperature),
        humidity: parseNumber(humidity),
        mainsVoltage: mainsVoltage ? parseNumber(mainsVoltage) : null,
        readings: resultsBySection,
        overallStatus,
        startedAt: startedAt || new Date().toISOString()
      };

      if (typeof (window as any).electron?.saveCalibration === 'function') {
        await (window as any).electron.saveCalibration(calibrationRecord);
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
    selectedStandardId,
    handleStandardChange,
    selectedStandard,
    templateDetail,
    operator,
    setOperator,
    temperature,
    setTemperature,
    humidity,
    setHumidity,
    mainsVoltage,
    setMainsVoltage,
    gridState,
    updateCell,
    getPointCalculations,
    handleSave,
    isLoading,
    error,
    clients,
    selectedClientId,
    setSelectedClientId
  };
}
