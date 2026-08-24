import { useState } from 'react';
import './Equipments.css';
import { EquipmentModal } from '../../components/Equipment/EquipmentModal/EquipmentModal';
import { EquipmentTable } from '../../components/Equipment/EquipmentTable/EquipmentTable';
import { EquipmentHistory } from '../../components/Equipment/EquipmentHistory/EquipmentHistory';
import { useEquipments } from '../../hooks/useEquipments';
import { IEquipment } from '../../services/equipments/ApiEquipmentsRepository';
import { Button } from '../../components/ui/Button/Button';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';

interface EquipmentsProps {
  onCalibrate: (eq: IEquipment) => void;
}

export function Equipments({ onCalibrate }: EquipmentsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<IEquipment | null>(null);
  const [activeHistoryEquipment, setActiveHistoryEquipment] = useState<IEquipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { equipments, isLoading, refresh } = useEquipments();

  const filteredEquipments = equipments.filter(eq => {
    const term = searchTerm.toLowerCase();
    const typeMatch = eq.equipment_type?.toLowerCase().includes(term) || false;
    const nameMatch = eq.name?.toLowerCase().includes(term) || false;
    const opMatch = eq.op?.toLowerCase().includes(term) || false;
    const nsMatch = eq.ns?.toLowerCase().includes(term) || false;
    return typeMatch || nameMatch || opMatch || nsMatch;
  });

  const handleEdit = (eq: IEquipment) => {
    setSelectedEquipment(eq);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este equipamento?')) {
      try {
        await window.electron.deleteEquipment(id);
        refresh();
      } catch (err: any) {
        alert(err?.message || 'Erro ao excluir o equipamento.');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
    refresh(); // Atualizar a lista após criar/editar
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
  };

  if (activeHistoryEquipment) {
    return (
      <EquipmentHistory 
        equipment={activeHistoryEquipment} 
        onBack={() => setActiveHistoryEquipment(null)} 
      />
    );
  }

  return (
    <div className="equipments-page">
      <PageHeader 
        onSearch={setSearchTerm}
        searchPlaceholder="Pesquisar por tipo, modelo, NS ou OP..."
        action={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Equipamento
          </Button>
        } 
      />
      
      <div className="page-content">
        {isLoading ? (
          <div className="loading-state">Carregando equipamentos...</div>
        ) : equipments.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum equipamento cadastrado</h3>
            <p>Utilize o botão acima para adicionar o seu primeiro equipamento.</p>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum equipamento encontrado</h3>
            <p>Não há nenhum equipamento que corresponda à busca "{searchTerm}".</p>
          </div>
        ) : (
          <EquipmentTable 
            equipments={filteredEquipments} 
            onCalibrate={onCalibrate} 
            onViewHistory={(eq) => setActiveHistoryEquipment(eq)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <EquipmentModal 
        isOpen={isModalOpen} 
        equipment={selectedEquipment}
        onClose={handleClose} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
