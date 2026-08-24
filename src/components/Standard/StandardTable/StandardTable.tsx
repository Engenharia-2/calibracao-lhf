import { IReferenceStandard } from '../../../services/standards/ApiStandardsRepository';
import { Pencil, Trash2 } from 'lucide-react';
import './StandardTable.css';

interface StandardTableProps {
  standards: IReferenceStandard[];
  onEdit: (standard: IReferenceStandard) => void;
  onDelete: (id: number) => void;
}

export function StandardTable({ standards, onEdit, onDelete }: StandardTableProps) {
  const isExpired = (validityDateStr: string) => {
    if (!validityDateStr) return false;
    const val = new Date(validityDateStr);
    const today = new Date();
    return val < today;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Código do Padrão</th>
            <th>Descrição</th>
            <th>Certificado RBC</th>
            <th>Validade</th>
            <th>Pontos Cadastrados</th>
            <th className="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          {standards.map((std) => {
            let pointsCount = 0;
            if (typeof std.points === 'string') {
              try { pointsCount = JSON.parse(std.points).length; } catch(e) {}
            } else if (Array.isArray(std.points)) {
              pointsCount = std.points.length;
            }

            const expired = isExpired(std.validity_date);

            return (
              <tr key={std.id}>
                <td><strong>{std.code}</strong></td>
                <td>{std.name}</td>
                <td>{std.certificate_number}</td>
                <td>
                  <span className={`validity-badge ${expired ? 'expired' : 'valid'}`}>
                    {new Date(std.validity_date).toLocaleDateString('pt-BR')} {expired ? '(Vencido)' : ''}
                  </span>
                </td>
                <td>{pointsCount} pontos</td>
                <td>
                  <div className="action-icons-cell">
                    <button className="icon-btn edit-btn" onClick={() => onEdit(std)} title="Editar Padrão">
                      <Pencil size={18} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => onDelete(std.id!)} title="Excluir Padrão">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
