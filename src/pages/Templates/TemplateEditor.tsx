import { useTemplateForm } from '../../hooks/useTemplateForm';
import { SectionBuilder } from '../../components/Template/SectionBuilder/SectionBuilder';
import { Button } from '../../components/ui/Button/Button';
import './TemplateEditor.css';

interface TemplateEditorProps {
  id?: string;
  onBack: () => void;
}

export function TemplateEditor({ id, onBack }: TemplateEditorProps) {
  const {
    templateId,
    setTemplateId,
    name,
    setName,
    equipmentType,
    setEquipmentType,
    tolerance,
    setTolerance,
    defaultStandardId,
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
  } = useTemplateForm({ id, onSuccess: onBack });

  return (
    <div className="template-editor-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>{isEditMode ? `Editar Formulário: ${id}` : 'Novo Formulário Dinâmico'}</h2>
          <p>Preencha as configurações básicas e monte as seções de calibração abaixo.</p>
        </div>
        <Button type="button" variant="secondary" onClick={onBack}>
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="template-editor-form">
        <div className="editor-card basic-info">
          <h3>Informações Básicas</h3>
          
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="templateId">Código do Formulário (ID)</label>
              <input
                id="templateId"
                type="text"
                className="form-input"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="Ex: FC-001, FC-007"
                disabled={isEditMode || isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Nome do Equipamento (Modelo)</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Surge Test 4kV LHF"
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="equipmentType">Tipo do Equipamento</label>
              <select
                id="equipmentType"
                className="form-input"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                disabled={isLoading}
                required
              >
                <option value="MEGOMETRO">Megômetro</option>
                <option value="SURGE">Surge Test</option>
                <option value="HIPOT">Hipot</option>
                <option value="MILIOHMIMETRO">Miliohmímetro</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tolerance">Tolerância Máxima Permitida (MPE %)</label>
              <input
                id="tolerance"
                type="number"
                step="0.01"
                className="form-input"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                placeholder="Ex: 5"
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="defaultStandard">Padrão de Referência RBC Padrão</label>
              <select
                id="defaultStandard"
                className="form-input"
                value={defaultStandardId}
                onChange={(e) => handleStandardSelect(e.target.value)}
                disabled={isLoading}
              >
                <option value="">-- Nenhum Padrão Vinculado --</option>
                {standards.map(std => (
                  <option key={std.id} value={std.id}>
                    [{std.code}] {std.name} ({std.certificate_number})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="sections-container">
          <div className="sections-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3>Estrutura das Seções de Teste</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {defaultStandardId && (
                <Button type="button" variant="outline" onClick={reloadSectionsFromStandard} disabled={isLoading}>
                  Recarregar Seções do Padrão
                </Button>
              )}
              <Button type="button" variant="primary" onClick={addSection} disabled={isLoading}>
                + Adicionar Seção
              </Button>
            </div>
          </div>

          {sections.map((section, sIdx) => (
            <SectionBuilder
              key={sIdx}
              section={section}
              sectionIndex={sIdx}
              onUpdate={(fields) => updateSection(sIdx, fields)}
              onRemove={() => removeSection(sIdx)}
              onAddPoint={() => addPointToSection(sIdx)}
              onRemovePoint={(pIdx) => removePointFromSection(sIdx, pIdx)}
              onUpdatePoint={(pIdx, fields) => updatePointInSection(sIdx, pIdx, fields)}
            />
          ))}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="editor-actions">
          <Button type="button" variant="secondary" onClick={onBack} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Salvando formulário...' : 'Salvar Formulário'}
          </Button>
        </div>
      </form>
    </div>
  );
}
