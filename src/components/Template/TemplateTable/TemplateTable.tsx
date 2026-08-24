import { Pencil, Trash2 } from 'lucide-react';
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
            <th>Tipo</th>
            <th>Nome do Equipamento</th>
            <th>Tolerância (MPE)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((tpl) => (
            <tr key={tpl.id}>
              <td><strong>{tpl.id}</strong></td>
              <td>
                <span className={`badge-type ${tpl.equipment_type.toLowerCase()}`}>
                  {tpl.equipment_type}
                </span>
              </td>
              <td>{tpl.name}</td>
              <td>±{tpl.tolerance}%</td>
              <td>
                <div className="action-icons-cell">
                  <button className="icon-btn edit-btn" onClick={() => onEdit(tpl.id)} title="Editar Template">
                    <Pencil size={18} />
                  </button>
                  <button className="icon-btn delete-btn" onClick={() => onDelete(tpl.id)} title="Excluir Template">
                    <Trash2 size={18} />
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
