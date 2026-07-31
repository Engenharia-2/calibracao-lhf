import { useState } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { TemplateTable } from '../../components/Template/TemplateTable/TemplateTable';
import { TemplateEditor } from '../../components/Template/TemplateEditor/TemplateEditor';
import { Button } from '../../components/ui/Button/Button';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import './Templates.css';

export function Templates() {
  const { templates, isLoading, deleteTemplate, refresh } = useTemplates();
  const [editorId, setEditorId] = useState<string | null | undefined>(null); // null = lista, undefined = novo, string = editar
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (id: string) => {
    setEditorId(id);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setEditorId(undefined);
    setIsEditing(true);
  };

  const handleEditorBack = () => {
    setIsEditing(false);
    setEditorId(null);
    refresh();
  };

  if (isEditing) {
    return (
      <TemplateEditor 
        id={editorId || undefined} 
        onBack={handleEditorBack} 
      />
    );
  }

  return (
    <div className="templates-page">
      <PageHeader 
        title="Modelos de Formulários de Calibração" 
        subtitle="Configure e gerencie as tabelas, escalas e pontos nominais que guiarão a calibração de cada equipamento."
        action={
          <Button variant="primary" onClick={handleCreateNew}>
            + Novo Formulário
          </Button>
        }
      />

      <div className="page-content">
        {isLoading ? (
          <div className="loading-state">Carregando modelos de calibração...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum formulário cadastrado</h3>
            <p>Clique no botão acima para criar o seu primeiro formulário dinâmico.</p>
          </div>
        ) : (
          <TemplateTable 
            templates={templates} 
            onEdit={handleEdit} 
            onDelete={deleteTemplate} 
          />
        )}
      </div>
    </div>
  );
}
