import { useState, useEffect, useRef } from 'react';
import { ICalibrationTemplate } from '../services/templates/ApiTemplatesRepository';
import { useTemplateSections } from './useTemplateSections';
import { useStandardSync } from './useStandardSync';

interface UseTemplateFormProps {
  id?: string;
  onSuccess?: () => void;
}

export { generateSectionsFromStandard } from './useStandardSync';

export function useTemplateForm({ id, onSuccess }: UseTemplateFormProps = {}) {
  const templateIdRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const toleranceRef = useRef<HTMLInputElement>(null);
  const procedureRef = useRef<HTMLTextAreaElement>(null);

  const [equipmentType, setEquipmentType] = useState('SURGE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!id;

  const {
    sections,
    setSections,
    addSection,
    removeSection,
    updateSection,
    addPointToSection,
    removePointFromSection,
    updatePointInSection,
    movePointInSection,
    generateUniqueId
  } = useTemplateSections();

  const {
    standards,
    isImportModalOpen,
    setIsImportModalOpen,
    pendingStandard,
    handleStandardSelect,
    importSelectedPoints,
    syncSectionWithStandard
  } = useStandardSync({ sections, setSections, generateUniqueId });

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        if (typeof (window as any).electron?.getTemplateById === 'function') {
          const template: ICalibrationTemplate = await (window as any).electron.getTemplateById(id);
          if (templateIdRef.current) templateIdRef.current.value = template.id;
          if (nameRef.current) nameRef.current.value = template.name;
          setEquipmentType(template.equipment_type);
          if (toleranceRef.current) toleranceRef.current.value = String(template.tolerance);
          if (procedureRef.current) procedureRef.current.value = template.procedure_text || '';
          
          const struct = typeof template.structure === 'string' 
            ? JSON.parse(template.structure) 
            : template.structure;

          const hydratedStruct = (struct || []).map((sec: any) => ({
            ...sec,
            points: (sec.points || []).map((pt: any) => ({
              ...pt,
              id: pt.id || generateUniqueId()
            }))
          }));
          setSections(hydratedStruct || []);
        }
      } catch (err: any) {
        setError('Erro ao carregar dados do formulário.');
        console.error("[useTemplateForm.ts] Erro em loadTemplate:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, setSections, generateUniqueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const templateId = templateIdRef.current?.value || '';
    const name = nameRef.current?.value || '';
    const procedureText = procedureRef.current?.value || null;
    const toleranceVal = toleranceRef.current?.value ? Number(toleranceRef.current.value) : undefined;

    if (!templateId || !name || !equipmentType || toleranceVal === undefined) {
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
        tolerance: toleranceVal,
        default_standard_id: null,
        procedure_text: procedureText,
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
      console.error("[useTemplateForm.ts] Erro durante a persistência do template:", err);
      setError(err?.message || 'Erro ao salvar o formulário.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templateIdRef,
    nameRef,
    toleranceRef,
    procedureRef,
    equipmentType,
    setEquipmentType,
    handleStandardSelect,
    syncSectionWithStandard,
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
    movePointInSection,
    handleSubmit,
    isImportModalOpen,
    setIsImportModalOpen,
    pendingStandard,
    importSelectedPoints
  };
}
