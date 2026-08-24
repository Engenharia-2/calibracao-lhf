import { useState } from 'react';
import './Clients.css';
import { ClientModal } from '../../components/Client/ClientModal/ClientModal';
import { ClientTable } from '../../components/Client/ClientTable/ClientTable';
import { useClients } from '../../hooks/useClients';
import { Button } from '../../components/ui/Button/Button';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import { IClient } from '../../services/clients/ApiClientsRepository';

export function Clients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { clients, isLoading, refresh } = useClients();

  const filteredClients = clients.filter(cli => {
    const term = searchTerm.toLowerCase();
    return (
      (cli.company?.toLowerCase() || '').includes(term) ||
      (cli.cnpj?.toLowerCase() || '').includes(term) ||
      (cli.email?.toLowerCase() || '').includes(term)
    );
  });

  const handleEdit = (cli: IClient) => {
    setSelectedClient(cli);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este cliente?')) {
      try {
        await window.electron.deleteClient(id);
        refresh();
      } catch (err: any) {
        alert(err?.message || 'Erro ao excluir o cliente.');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    refresh(); // Atualizar a lista após criar/editar
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="clients-page">
      <PageHeader 
        onSearch={setSearchTerm}
        searchPlaceholder="Buscar por empresa, CNPJ ou E-mail..."
        action={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Cliente
          </Button>
        } 
      />
      
      <div className="page-content">
        {isLoading ? (
          <div className="loading-state">Carregando clientes...</div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum cliente cadastrado</h3>
            <p>Utilize o botão acima para adicionar o seu primeiro cliente.</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum cliente encontrado</h3>
            <p>Não há nenhum cliente que corresponda à busca "{searchTerm}".</p>
          </div>
        ) : (
          <ClientTable clients={filteredClients} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        client={selectedClient}
        onClose={handleClose} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
