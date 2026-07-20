import { useState, useEffect } from 'react';
import { ICalibrationTemplate } from '../services/templates/ApiTemplatesRepository';

export function useTemplates() {
  const [templates, setTemplates] = useState<ICalibrationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof (window as any).electron?.getTemplates === 'function') {
        const data = await (window as any).electron.getTemplates();
        setTemplates(data);
      } else {
        throw new Error('Electron getTemplates is not available');
      }
    } catch (err: any) {
      console.error('Erro ao buscar templates:', err);
      setError(err?.message || 'Erro ao buscar templates.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm(`Deseja realmente excluir o formulário ${id}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      if (typeof (window as any).electron?.deleteTemplate === 'function') {
        await (window as any).electron.deleteTemplate(id);
        await fetchTemplates();
      } else {
        throw new Error('Electron deleteTemplate is not available');
      }
    } catch (err: any) {
      console.error('Erro ao excluir template:', err);
      alert(err?.message || 'Erro ao excluir template.');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    refresh: fetchTemplates,
    deleteTemplate
  };
}
