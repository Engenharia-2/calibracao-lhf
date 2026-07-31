import { useState } from 'react';
import './Clients.css';
import { ClientModal } from '../../components/Client/ClientModal/ClientModal';
import { ClientTable } from '../../components/Client/ClientTable/ClientTable';
import { useClients } from '../../hooks/useClients';
import { Button } from '../../components/ui/Button/Button';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';

export function Clients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { clients, isLoading, refresh } = useClients();

  const handleSuccess = () => {
    setIsModalOpen(false);
    refresh(); // Atualizar a lista após criar
  };

  return (
    <div className="clients-page">
      <PageHeader 
        title="Gerenciamento de Clientes" 
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
        ) : (
          <ClientTable clients={clients} />
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
