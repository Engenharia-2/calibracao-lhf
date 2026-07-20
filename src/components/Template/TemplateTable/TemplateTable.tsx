import { ICalibrationTemplate } from '../../../services/templates/ApiTemplatesRepository';
import './TemplateTable.css';

interface TemplateTableProps {
  templates: ICalibrationTemplate[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TemplateTable({ templates, onEdit, onDelete }: TemplateTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID (Formulário)</th>
            <th>Nome do Equipamento</th>
            <th>Tipo</th>
            <th>Tolerância (MPE)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((tpl) => (
            <tr key={tpl.id}>
              <td><strong>{tpl.id}</strong></td>
              <td>{tpl.name}</td>
              <td>
                <span className={`badge-type ${tpl.equipment_type.toLowerCase()}`}>
                  {tpl.equipment_type}
                </span>
              </td>
              <td>±{tpl.tolerance}%</td>
              <td>
                <div className="action-buttons">
                  <button className="btn-action edit" onClick={() => onEdit(tpl.id)}>
                    Editar
                  </button>
                  <button className="btn-action delete" onClick={() => onDelete(tpl.id)}>
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
