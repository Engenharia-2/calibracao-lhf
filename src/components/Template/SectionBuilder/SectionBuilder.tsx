import { useEffect, useRef } from 'react';
import { ITemplateSection, ITemplatePoint } from '../../../services/templates/ApiTemplatesRepository';
import { IReferenceStandard } from '../../../services/standards/ApiStandardsRepository';
import { Button } from '../../ui/Button/Button';
import { UnitSelect } from '../../ui/UnitSelect/UnitSelect';
import './SectionBuilder.css';

interface SectionBuilderProps {
  section: ITemplateSection;
  sectionIndex: number;
  standards?: IReferenceStandard[];
  onUpdate: (fields: Partial<ITemplateSection>) => void;
  onRemove: () => void;
  onAddPoint: () => void;
  onRemovePoint: (pointIndex: number) => void;
  onUpdatePoint: (pointIndex: number, fields: Partial<ITemplatePoint>) => void;
  onStandardSelect?: (idVal: string | number) => void;
  onSyncStandard?: () => void;
}

export function SectionBuilder({
  section,
  sectionIndex,
  standards = [],
  onUpdate,
  onRemove,
  onAddPoint,
  onRemovePoint,
  onUpdatePoint,
  onStandardSelect,
  onSyncStandard
}: SectionBuilderProps) {

  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`[SectionBuilder.tsx #${sectionIndex + 1}] RENDER #${renderCount.current} - sectionName: "${section.name}", pointsCount: ${section.points.length}`);

  useEffect(() => {
    console.log(`[SectionBuilder.tsx #${sectionIndex + 1}] COMPONENT MOUNTED`);
    return () => console.log(`[SectionBuilder.tsx #${sectionIndex + 1}] COMPONENT UNMOUNTED`);
  }, []);



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

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Padrão de Referência Utilizado</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="form-input"
              value={section.standard_id || ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate({ standard_id: val ? Number(val) : null });
                if (val && onStandardSelect) onStandardSelect(val);
              }}
              style={{ flex: 1 }}
            >
              <option value="">-- Selecione o Padrão para esta Seção --</option>
              {standards.map(std => (
                <option key={std.id} value={std.id}>
                  [{std.code}] {std.name} ({std.certificate_number})
                </option>
              ))}
            </select>
            {section.standard_id && onSyncStandard && (
              <Button type="button" variant="secondary" onClick={onSyncStandard}>
                Sincronizar
              </Button>
            )}
          </div>
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
                <th>Resolução</th>
                <th>Unidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {section.points.map((point, pIdx) => (
                <tr key={`${point.id || pIdx}-${point.targetValue}-${point.unit}-${point.resolution}`}>
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
                    <input
                      type="number"
                      step="any"
                      className="form-input table-input"
                      defaultValue={point.resolution !== undefined && point.resolution !== null ? point.resolution : ''}
                      onBlur={(e) => {
                        const val = e.target.value;
                        onUpdatePoint(pIdx, { resolution: val !== '' ? Number(val) : undefined });
                      }}
                      placeholder="Ex: 0.01"
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
