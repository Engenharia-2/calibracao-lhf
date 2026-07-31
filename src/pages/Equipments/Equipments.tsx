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
  const [activeHistoryEquipment, setActiveHistoryEquipment] = useState<IEquipment | null>(null);
  const { equipments, isLoading, refresh } = useEquipments();

  const handleSuccess = () => {
    setIsModalOpen(false);
    refresh(); // Atualizar a lista após criar
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
        title="Gerenciamento de Equipamentos" 
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
        ) : (
          <EquipmentTable 
            equipments={equipments} 
            onCalibrate={onCalibrate} 
            onViewHistory={(eq) => setActiveHistoryEquipment(eq)}
          />
        )}
      </div>

      <EquipmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
