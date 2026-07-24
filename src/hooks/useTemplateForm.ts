import { useState, useEffect } from 'react';
import { ICalibrationTemplate, ITemplateSection, ITemplatePoint } from '../services/templates/ApiTemplatesRepository';
import { IReferenceStandard, IStandardPoint } from '../services/standards/ApiStandardsRepository';

interface UseTemplateFormProps {
  id?: string;
  onSuccess?: () => void;
}

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
      targetValue: pt.nominalValue,
      unit: pt.unit || currentSec.defaultUnit
    });
  });

  return Array.from(sectionsMap.values());
}

export function useTemplateForm({ id, onSuccess }: UseTemplateFormProps = {}) {
  const [templateId, setTemplateId] = useState('');
  const [name, setName] = useState('');
  const [equipmentType, setEquipmentType] = useState('SURGE');
  const [tolerance, setTolerance] = useState(5.0);
  const [defaultStandardId, setDefaultStandardId] = useState<number | string>('');
  const [standards, setStandards] = useState<IReferenceStandard[]>([]);
  const [sections, setSections] = useState<ITemplateSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!id;

  // Carrega e escuta atualizações dos padrões disponíveis em tempo real
  useEffect(() => {
    const fetchStandards = async () => {
      try {
        if (typeof (window as any).electron?.getStandards === 'function') {
          const list = await (window as any).electron.getStandards();
          setStandards(list);
        }
      } catch (err) {
        console.error('Erro ao buscar padrões:', err);
      }
    };
    fetchStandards();

    if (typeof (window as any).electron?.onStandardsUpdated === 'function') {
      const cleanup = (window as any).electron.onStandardsUpdated(() => {
        fetchStandards();
      });
      return () => cleanup();
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        if (typeof (window as any).electron?.getTemplateById === 'function') {
          const template: ICalibrationTemplate = await (window as any).electron.getTemplateById(id);
          setTemplateId(template.id);
          setName(template.name);
          setEquipmentType(template.equipment_type);
          setTolerance(Number(template.tolerance));
          setDefaultStandardId(template.default_standard_id || '');
          
          const struct = typeof template.structure === 'string' 
            ? JSON.parse(template.structure) 
            : template.structure;
          setSections(struct || []);
        }
      } catch (err: any) {
        setError('Erro ao carregar dados do formulário.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  // Handler ao trocar a seleção do Padrão de Referência
  const handleStandardSelect = (idVal: string | number) => {
    setDefaultStandardId(idVal);
    if (!idVal) return;

    const selectedStd = standards.find(s => String(s.id) === String(idVal));
    if (!selectedStd) return;

    const generated = generateSectionsFromStandard(selectedStd);
    if (generated.length > 0) {
      if (!isEditMode || sections.length === 0) {
        setSections(generated);
      } else {
        if (confirm('Deseja carregar automaticamente as seções e pontos de teste do Padrão selecionado? Isso substituirá a estrutura de seções atual.')) {
          setSections(generated);
        }
      }
    }
  };

  // Força recarregar seções a partir do padrão selecionado
  const reloadSectionsFromStandard = () => {
    if (!defaultStandardId) return;
    const selectedStd = standards.find(s => String(s.id) === String(defaultStandardId));
    if (!selectedStd) return;
    const generated = generateSectionsFromStandard(selectedStd);
    if (generated.length > 0) {
      setSections(generated);
    }
  };

  const addSection = () => {
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
    setSections(sections.filter((_, index) => index !== sectionIndex));
  };

  const updateSection = (sectionIndex: number, fields: Partial<ITemplateSection>) => {
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        return { ...sec, ...fields };
      }
      return sec;
    }));
  };

  const addPointToSection = (sectionIndex: number) => {
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        const newPoint: ITemplatePoint = {
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

    if (!templateId || !name || !equipmentType || tolerance === undefined) {
      setError('Por favor, preencha as informações básicas do formulário.');
      return;
    }

    if (sections.length === 0) {
      setError('O formulário precisa ter pelo menos uma Seção de medição.');
      return;
    }

    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].name) {
        setError(`A Seção #${i + 1} precisa ter um nome válido.`);
        return;
      }
      if (sections[i].points.length === 0) {
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
        tolerance,
        default_standard_id: defaultStandardId ? Number(defaultStandardId) : null,
        structure: sections
      };

      if (isEditMode) {
        if (typeof (window as any).electron?.updateTemplate === 'function') {
          await (window as any).electron.updateTemplate(id, templateData);
        } else {
          throw new Error('Electron updateTemplate function not available');
        }
      } else {
        if (typeof (window as any).electron?.createTemplate === 'function') {
          await (window as any).electron.createTemplate(templateData);
        } else {
          throw new Error('Electron createTemplate function not available');
        }
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar o formulário.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templateId,
    setTemplateId,
    name,
    setName,
    equipmentType,
    setEquipmentType,
    tolerance,
    setTolerance,
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
    handleSubmit
  };
}
