import { useEffect, useRef } from 'react';
import { ITemplateSection, ITemplatePoint } from '../../../services/templates/ApiTemplatesRepository';
import { Button } from '../../ui/Button/Button';
import { UnitSelect } from '../../ui/UnitSelect/UnitSelect';
import './SectionBuilder.css';

interface SectionBuilderProps {
  section: ITemplateSection;
  sectionIndex: number;
  onUpdate: (fields: Partial<ITemplateSection>) => void;
  onRemove: () => void;
  onAddPoint: () => void;
  onRemovePoint: (pointIndex: number) => void;
  onUpdatePoint: (pointIndex: number, fields: Partial<ITemplatePoint>) => void;
}

export function SectionBuilder({
  section,
  sectionIndex,
  onUpdate,
  onRemove,
  onAddPoint,
  onRemovePoint,
  onUpdatePoint
}: SectionBuilderProps) {

  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`[SectionBuilder.tsx #${sectionIndex + 1}] RENDER #${renderCount.current} - sectionName: "${section.name}", pointsCount: ${section.points.length}`);

  useEffect(() => {
    console.log(`[SectionBuilder.tsx #${sectionIndex + 1}] COMPONENT MOUNTED`);
    return () => console.log(`[SectionBuilder.tsx #${sectionIndex + 1}] COMPONENT UNMOUNTED`);
  }, []);

  const handleColumnsPresetChange = (preset: string) => {
    if (preset === 'standard_set') {
      onUpdate({
        columns: [
          { key: 'standard', label: 'Padrão' },
          { key: 'equipment', label: 'Conjunto' }
        ]
      });
    } else if (preset === 'standard_panel') {
      onUpdate({
        columns: [
          { key: 'standard', label: 'Padrão' },
          { key: 'panel', label: 'Painel' }
        ]
      });
    } else if (preset === 'megometer_5kv') {
      onUpdate({
        columns: [
          { key: 'standard', label: 'Padrão' },
          { key: 'set_1kv', label: 'Conjunto (1 kV)' },
          { key: 'set_5kv', label: 'Conjunto (5 kV)' }
        ]
      });
    }
  };

  return (
    <div className="section-builder-card">
      <div className="section-builder-header">
        <h3>Seção de Medição #{sectionIndex + 1}</h3>
        <Button type="button" variant="danger" size="sm" onClick={onRemove}>
          Remover Seção
        </Button>
      </div>

      <div className="section-builder-fields">
        <div className="form-group-row">
          <div className="form-group">
            <label>Nome da Seção</label>
            <input
              type="text"
              className="form-input"
              defaultValue={section.name}
              onBlur={(e) => onUpdate({ name: e.target.value })}
              placeholder="Ex: Tensão (VK AC) ou Resistência"
            />
          </div>
          <div className="form-group size-small">
            <label>Unidade Padrão</label>
            <UnitSelect
              value={section.defaultUnit}
              onChangeValue={(val) => onUpdate({ defaultUnit: val })}
            />
          </div>
          <div className="form-group size-small">
            <label>Ciclos (Medições)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              max="10"
              defaultValue={section.cyclesCount}
              onBlur={(e) => onUpdate({ cyclesCount: Math.max(1, Number(e.target.value)) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Predefinição de Colunas de Teste</label>
          <select 
            className="form-input" 
            onChange={(e) => handleColumnsPresetChange(e.target.value)}
            defaultValue="standard_set"
          >
            <option value="standard_set">Padrão + Conjunto (Ex: Surge, LRM, Megômetro 1kV)</option>
            <option value="standard_panel">Padrão + Painel (Ex: Hipot)</option>
            <option value="megometer_5kv">Padrão + Conjunto 1kV + Conjunto 5kV (Ex: Megômetro 5kV)</option>
          </select>
        </div>
      </div>

      <div className="points-builder-wrapper">
        <h4>Pontos de Medição ({section.points.length})</h4>
        
        {section.points.length === 0 ? (
          <div className="no-points-msg">Nenhum ponto de medição adicionado nesta seção.</div>
        ) : (
          <table className="points-builder-table">
            <thead>
              <tr>
                <th>Grupo / Escala (Opcional)</th>
                <th>Valor Alvo (Nominal)</th>
                <th>Unidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {section.points.map((point, pIdx) => (
                <tr key={point.id || pIdx}>
                  <td>
                    <input
                      type="text"
                      className="form-input table-input"
                      defaultValue={point.group || ''}
                      onBlur={(e) => onUpdatePoint(pIdx, { group: e.target.value })}
                      placeholder="Ex: E1, E2"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="any"
                      className="form-input table-input"
                      defaultValue={point.targetValue || ''}
                      onBlur={(e) => onUpdatePoint(pIdx, { targetValue: Number(e.target.value) })}
                      placeholder="Ex: 10.005"
                    />
                  </td>
                  <td>
                    <UnitSelect
                      className="table-input"
                      value={point.unit || section.defaultUnit}
                      onChangeValue={(val) => onUpdatePoint(pIdx, { unit: val })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-remove-point"
                      onClick={() => onRemovePoint(pIdx)}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '12px' }}>
          <Button type="button" variant="outline" size="sm" onClick={onAddPoint}>
            + Adicionar Ponto de Medição
          </Button>
        </div>
      </div>
    </div>
  );
}
