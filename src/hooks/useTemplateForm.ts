import { useState, useEffect, useRef } from 'react';
import { ICalibrationTemplate, ITemplateSection, ITemplatePoint } from '../services/templates/ApiTemplatesRepository';
import { IReferenceStandard, IStandardPoint } from '../services/standards/ApiStandardsRepository';

interface UseTemplateFormProps {
  id?: string;
  onSuccess?: () => void;
}

const generateUniqueId = () => {
  return 'pt-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
};

export function generateSectionsFromStandard(standard: IReferenceStandard): ITemplateSection[] {
  if (!standard || !standard.points) return [];

  let pointsList: IStandardPoint[] = [];
  if (typeof standard.points === 'string') {
    try { pointsList = JSON.parse(standard.points); } catch (e) {}
  } else if (Array.isArray(standard.points)) {
    pointsList = standard.points;
  }

  if (!pointsList.length) return [];

  const sectionsMap = new Map<string, ITemplateSection>();

  pointsList.forEach((pt) => {
    const secName = pt.sectionName || 'Seção de Teste';
    if (!sectionsMap.has(secName)) {
      sectionsMap.set(secName, {
        name: secName,
        defaultUnit: pt.unit || 'V',
        cyclesCount: 3,
        columns: [
          { key: 'standard', label: 'Padrão' },
          { key: 'equipment', label: 'Equipamento' }
        ],
        points: []
      });
    }

    const currentSec = sectionsMap.get(secName)!;
    currentSec.points.push({
      id: generateUniqueId(),
      targetValue: pt.nominalValue,
      unit: pt.unit || currentSec.defaultUnit
    });
  });

  return Array.from(sectionsMap.values());
}

export function useTemplateForm({ id, onSuccess }: UseTemplateFormProps = {}) {
  const templateIdRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const toleranceRef = useRef<HTMLInputElement>(null);

  const [equipmentType, setEquipmentType] = useState('SURGE');
  const [defaultStandardId, setDefaultStandardId] = useState<number | string>('');
  const [standards, setStandards] = useState<IReferenceStandard[]>([]);
  const [sections, setSections] = useState<ITemplateSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!id;

  // Estados adicionais para o modal de importação seletiva
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingStandard, setPendingStandard] = useState<IReferenceStandard | null>(null);

  // Carrega e escuta atualizações dos padrões disponíveis em tempo real
  useEffect(() => {
    const fetchStandards = async () => {
      console.log("[useTemplateForm.ts] fetchStandards disparado.");
      try {
        if (typeof (window as any).electron?.getStandards === 'function') {
          const list = await (window as any).electron.getStandards();
          console.log("[useTemplateForm.ts] getStandards IPC retornou:", list.length, "padrões");
          setStandards(list);
        }
      } catch (err) {
        console.error('[useTemplateForm.ts] Erro ao buscar padrões:', err);
      }
    };
    fetchStandards();

    if (typeof (window as any).electron?.onStandardsUpdated === 'function') {
      const cleanup = (window as any).electron.onStandardsUpdated(() => {
        console.log("[useTemplateForm.ts] Evento onStandardsUpdated recebido.");
        fetchStandards();
      });
      return () => cleanup();
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      console.log("[useTemplateForm.ts] loadTemplate iniciado para ID:", id);
      setIsLoading(true);
      try {
        if (typeof (window as any).electron?.getTemplateById === 'function') {
          const template: ICalibrationTemplate = await (window as any).electron.getTemplateById(id);
          console.log("[useTemplateForm.ts] getTemplateById IPC retornou dados do template:", template.id);
          if (templateIdRef.current) templateIdRef.current.value = template.id;
          if (nameRef.current) nameRef.current.value = template.name;
          setEquipmentType(template.equipment_type);
          if (toleranceRef.current) toleranceRef.current.value = String(template.tolerance);
          setDefaultStandardId(template.default_standard_id || '');
          
          const struct = typeof template.structure === 'string' 
            ? JSON.parse(template.structure) 
            : template.structure;

          const hydratedStruct = (struct || []).map((sec: ITemplateSection) => ({
            ...sec,
            points: (sec.points || []).map(pt => ({
              ...pt,
              id: pt.id || generateUniqueId()
            }))
          }));
          console.log("[useTemplateForm.ts] Estrutura hidratada com IDs de ponto:", hydratedStruct.length, "seções");
          setSections(hydratedStruct || []);
        }
      } catch (err: any) {
        setError('Erro ao carregar dados do formulário.');
        console.error("[useTemplateForm.ts] Erro em loadTemplate:", err);
      } finally {
        console.log("[useTemplateForm.ts] loadTemplate finalizado.");
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  // Handler ao trocar a seleção do Padrão de Referência
  const handleStandardSelect = (idVal: string | number) => {
    console.log("[useTemplateForm.ts] handleStandardSelect disparado com valor:", idVal);
    setDefaultStandardId(idVal);
    if (!idVal) {
      setPendingStandard(null);
      return;
    }

    const selectedStd = standards.find(s => String(s.id) === String(idVal));
    if (!selectedStd) {
      console.warn("[useTemplateForm.ts] Padrão não encontrado para ID:", idVal);
      return;
    }

    setPendingStandard(selectedStd);
    setIsImportModalOpen(true);
  };

  // Função para integrar pontos selecionados no modal às seções atuais
  const importSelectedPoints = (selectedPoints: IStandardPoint[]) => {
    console.log("[useTemplateForm.ts] importSelectedPoints acionado com pontos:", selectedPoints.length);
    setIsImportModalOpen(false);
    if (!selectedPoints.length) return;

    const updatedSections = [...sections];

    selectedPoints.forEach((stdPt) => {
      const secName = stdPt.sectionName || 'Seção de Teste';
      const stdPtKey = stdPt.id || `${secName}_${stdPt.nominalValue}_${stdPt.unit}`;

      let secIndex = updatedSections.findIndex(s => s.name === secName);
      if (secIndex === -1) {
        const newSec: ITemplateSection = {
          name: secName,
          defaultUnit: stdPt.unit || 'V',
          cyclesCount: 3,
          columns: [
            { key: 'standard', label: 'Padrão' },
            { key: 'equipment', label: 'Equipamento' }
          ],
          points: []
        };
        updatedSections.push(newSec);
        secIndex = updatedSections.length - 1;
      }

      const targetSec = updatedSections[secIndex];

      const pointExists = targetSec.points.some(
        p => p.isLinkedToStandard && p.standardPointKey === stdPtKey
      );

      if (!pointExists) {
        targetSec.points.push({
          id: generateUniqueId(),
          targetValue: stdPt.nominalValue,
          unit: stdPt.unit || targetSec.defaultUnit,
          isLinkedToStandard: true,
          standardPointKey: stdPtKey
        });
      }
    });

    setSections(updatedSections);
    setPendingStandard(null);
  };

  // Sincroniza seletivamente os pontos que possuem vínculo ativo com o padrão
  const reloadSectionsFromStandard = () => {
    console.log("[useTemplateForm.ts] reloadSectionsFromStandard acionado.");
    if (!defaultStandardId) return;
    const selectedStd = standards.find(s => String(s.id) === String(defaultStandardId));
    if (!selectedStd) return;

    let stdPointsList: IStandardPoint[] = [];
    if (typeof selectedStd.points === 'string') {
      try { stdPointsList = JSON.parse(selectedStd.points); } catch (e) {}
    } else if (Array.isArray(selectedStd.points)) {
      stdPointsList = selectedStd.points;
    }

    if (stdPointsList.length === 0) {
      alert('O padrão selecionado não possui pontos configurados.');
      return;
    }

    const stdPointsMap = new Map<string, IStandardPoint>();
    stdPointsList.forEach((pt) => {
      if (pt.id) {
        stdPointsMap.set(pt.id, pt);
      }
      // Garante também o suporte retroativo para chaves compostas antigas
      const secName = pt.sectionName || 'Seção de Teste';
      const oldKey = `${secName}_${pt.nominalValue}_${pt.unit}`;
      stdPointsMap.set(oldKey, pt);
    });

    let syncCount = 0;

    const updatedSections = sections.map((sec) => {
      const updatedPoints = sec.points.map((pt) => {
        if (pt.isLinkedToStandard && pt.standardPointKey) {
          const matchPt = stdPointsMap.get(pt.standardPointKey);
          if (matchPt) {
            syncCount++;
            return {
              ...pt,
              targetValue: matchPt.nominalValue,
              unit: matchPt.unit || pt.unit
            };
          }
        }
        return pt;
      });

      return {
        ...sec,
        points: updatedPoints
      };
    });

    setSections(updatedSections);
    alert(`Sincronização concluída! ${syncCount} pontos vinculados foram atualizados.`);
  };

  const addSection = () => {
    console.log("[useTemplateForm.ts] addSection acionado.");
    const newSection: ITemplateSection = {
      name: 'Nova Seção',
      defaultUnit: 'V',
      cyclesCount: 3,
      columns: [
        { key: 'standard', label: 'Padrão' },
        { key: 'equipment', label: 'Equipamento' }
      ],
      points: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionIndex: number) => {
    console.log("[useTemplateForm.ts] removeSection acionado para o índice:", sectionIndex);
    setSections(sections.filter((_, index) => index !== sectionIndex));
  };

  const updateSection = (sectionIndex: number, fields: Partial<ITemplateSection>) => {
    console.log(`[useTemplateForm.ts] updateSection acionado para o índice ${sectionIndex} com campos:`, fields);
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        return { ...sec, ...fields };
      }
      return sec;
    }));
  };

  const addPointToSection = (sectionIndex: number) => {
    console.log("[useTemplateForm.ts] addPointToSection acionado para a seção:", sectionIndex);
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        const newPoint: ITemplatePoint = {
          id: generateUniqueId(),
          targetValue: 0,
          unit: sec.defaultUnit
        };
        return {
          ...sec,
          points: [...sec.points, newPoint]
        };
      }
      return sec;
    }));
  };

  const removePointFromSection = (sectionIndex: number, pointIndex: number) => {
    console.log(`[useTemplateForm.ts] removePointFromSection acionado para seção ${sectionIndex}, ponto ${pointIndex}`);
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        return {
          ...sec,
          points: sec.points.filter((_, pIdx) => pIdx !== pointIndex)
        };
      }
      return sec;
    }));
  };

  const updatePointInSection = (sectionIndex: number, pointIndex: number, fields: Partial<ITemplatePoint>) => {
    console.log(`[useTemplateForm.ts] updatePointInSection acionado para seção ${sectionIndex}, ponto ${pointIndex} com campos:`, fields);
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        return {
          ...sec,
          points: sec.points.map((pt, pIdx) => {
            if (pIdx === pointIndex) {
              return { ...pt, ...fields };
            }
            return pt;
          })
        };
      }
      return sec;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const templateId = templateIdRef.current?.value || '';
    const name = nameRef.current?.value || '';
    const toleranceVal = toleranceRef.current?.value ? Number(toleranceRef.current.value) : undefined;

    console.log("[useTemplateForm.ts] handleSubmit disparado. Payload básico:", {
      templateId,
      name,
      equipmentType,
      toleranceVal,
      sectionsCount: sections.length
    });

    if (!templateId || !name || !equipmentType || toleranceVal === undefined) {
      console.warn("[useTemplateForm.ts] handleSubmit abortado: campos básicos vazios.");
      setError('Por favor, preencha as informações básicas do formulário.');
      return;
    }

    if (sections.length === 0) {
      console.warn("[useTemplateForm.ts] handleSubmit abortado: sem seções.");
      setError('O formulário precisa ter pelo menos uma Seção de medição.');
      return;
    }

    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].name) {
        console.warn(`[useTemplateForm.ts] handleSubmit abortado: Seção #${i + 1} sem nome.`);
        setError(`A Seção #${i + 1} precisa ter um nome válido.`);
        return;
      }
      if (sections[i].points.length === 0) {
        console.warn(`[useTemplateForm.ts] handleSubmit abortado: Seção "${sections[i].name}" sem pontos.`);
        setError(`A Seção "${sections[i].name}" precisa ter pelo menos um ponto de medição.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const templateData: ICalibrationTemplate = {
        id: templateId.trim().toUpperCase(),
        name,
        equipment_type: equipmentType,
        tolerance: toleranceVal,
        default_standard_id: defaultStandardId ? Number(defaultStandardId) : null,
        structure: sections
      };

      console.log("[useTemplateForm.ts] Enviando templateData via IPC...");
      if (isEditMode) {
        if (typeof (window as any).electron?.updateTemplate === 'function') {
          await (window as any).electron.updateTemplate(id, templateData);
          console.log("[useTemplateForm.ts] Template atualizado com sucesso via IPC.");
        } else {
          throw new Error('Electron updateTemplate function not available');
        }
      } else {
        if (typeof (window as any).electron?.createTemplate === 'function') {
          await (window as any).electron.createTemplate(templateData);
          console.log("[useTemplateForm.ts] Novo template criado com sucesso via IPC.");
        } else {
          throw new Error('Electron createTemplate function not available');
        }
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("[useTemplateForm.ts] Erro durante a persistência do template:", err);
      setError(err?.message || 'Erro ao salvar o formulário.');
    } finally {
      console.log("[useTemplateForm.ts] Finalizando processamento de salvamento.");
      setIsLoading(false);
    }
  };

  return {
    templateIdRef,
    nameRef,
    toleranceRef,
    equipmentType,
    setEquipmentType,
    defaultStandardId,
    setDefaultStandardId,
    handleStandardSelect,
    reloadSectionsFromStandard,
    standards,
    sections,
    isLoading,
    error,
    isEditMode,
    addSection,
    removeSection,
    updateSection,
    addPointToSection,
    removePointFromSection,
    updatePointInSection,
    handleSubmit,
    // Novos retornos para o modal de importação seletiva
    isImportModalOpen,
    setIsImportModalOpen,
    pendingStandard,
    importSelectedPoints
  };
}
