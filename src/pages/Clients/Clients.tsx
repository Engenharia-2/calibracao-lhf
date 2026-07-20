import { useState } from 'react';
import './Clients.css';
import { ClientModal } from '../../components/Client/ClientModal/ClientModal';
import { ClientTable } from '../../components/Client/ClientTable/ClientTable';
import { useClients } from '../../hooks/useClients';
import { Button } from '../../components/ui/Button/Button';

export function Clients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { clients, isLoading, refresh } = useClients();

  const handleSuccess = () => {
    setIsModalOpen(false);
    refresh(); // Atualizar a lista após criar
  };

  return (
    <div className="clients-page">
      <div className="page-header" >
        <div>
          <h2>Gerenciamento de Clientes</h2>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Cliente
        </Button>
      </div>
      
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
