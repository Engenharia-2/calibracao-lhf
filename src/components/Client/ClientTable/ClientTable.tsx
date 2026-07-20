import { IClient } from '../../../services/clients/ApiClientsRepository';
import './ClientTable.css';

interface ClientTableProps {
  clients: IClient[];
}

export function ClientTable({ clients }: ClientTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>CNPJ</th>
            <th>E-mail</th>
            <th>Data de Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((cli) => (
            <tr key={cli.id}>
              <td>{cli.company}</td>
              <td>{cli.cnpj}</td>
              <td>{cli.email}</td>
              <td>{new Date(cli.created_at || '').toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
