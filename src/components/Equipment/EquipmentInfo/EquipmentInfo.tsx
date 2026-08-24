import { IEquipment } from '../../../services/equipments/ApiEquipmentsRepository';
import './EquipmentInfo.css';

interface EquipmentInfoProps {
  equipment: IEquipment;
}

export function EquipmentInfo({ equipment }: EquipmentInfoProps) {
  return (
    <div className="workspace-card equipment-details-banner">
      <h3>Dados do Equipamento</h3>
      <div className="details-grid">
        <div><strong>Tipo:</strong> {equipment.equipment_type || '-'}</div>
        <div><strong>Modelo:</strong> {equipment.name}</div>
        <div><strong>Número de Série (NS):</strong> {equipment.ns}</div>
        <div><strong>Ordem de Produção (OP):</strong> {equipment.op}</div>
      </div>
    </div>
  );
}
