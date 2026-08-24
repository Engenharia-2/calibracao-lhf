import { IClient } from '../../../services/clients/ApiClientsRepository';
import { Pencil, Trash2 } from 'lucide-react';
import './ClientTable.css';

interface ClientTableProps {
  clients: IClient[];
  onEdit: (client: IClient) => void;
  onDelete: (id: number) => void;
}

export function ClientTable({ clients, onEdit, onDelete }: ClientTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>CNPJ</th>
            <th>E-mail</th>
            <th>Data de Cadastro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((cli) => (
            <tr key={cli.id}>
              <td>{cli.company}</td>
              <td>{cli.cnpj}</td>
              <td>{cli.email}</td>
              <td>{new Date(cli.created_at || '').toLocaleDateString('pt-BR')}</td>
              <td>
                <div className="action-icons-cell">
                  <button className="icon-btn edit-btn" onClick={() => onEdit(cli)} title="Editar Cliente">
                    <Pencil size={18} />
                  </button>
                  <button className="icon-btn delete-btn" onClick={() => onDelete(cli.id!)} title="Excluir Cliente">
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
