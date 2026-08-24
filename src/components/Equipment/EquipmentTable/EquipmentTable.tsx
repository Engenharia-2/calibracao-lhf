import type { IEquipment } from '../../../services/equipments/ApiEquipmentsRepository';
import { ZodiacLibra, FolderClock, Pencil, Trash2 } from 'lucide-react';
import './EquipmentTable.css';

interface EquipmentTableProps {
  equipments: IEquipment[];
  onCalibrate: (equipment: IEquipment) => void;
  onViewHistory: (equipment: IEquipment) => void;
  onEdit: (equipment: IEquipment) => void;
  onDelete: (id: number) => void;
}

export function EquipmentTable({ equipments, onCalibrate, onViewHistory, onEdit, onDelete }: EquipmentTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>OP</th>
            <th>NS</th>
            <th>Tipo</th>
            <th>Equipamento</th>
            <th>Data de Cadastro</th>
            <th className="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          {equipments.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.op}</td>
              <td>{eq.ns}</td>
              <td>
                {eq.equipment_type ? (
                  <span className={`badge-type ${eq.equipment_type.toLowerCase()}`}>
                    {eq.equipment_type}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>{eq.name}</td>
              <td>{new Date(eq.created_at || '').toLocaleDateString('pt-BR')}</td>
              <td>
                <div className="action-icons-cell">
                  <button 
                    className="icon-btn calibrate-btn" 
                    onClick={() => onCalibrate(eq)}
                    title="Calibrar Equipamento"
                  >
                    <ZodiacLibra size={18} />
                  </button>
                  <button 
                    className="icon-btn history-btn" 
                    onClick={() => onViewHistory(eq)}
                    title="Histórico de Calibrações"
                  >
                    <FolderClock size={18} />
                  </button>
                  <button 
                    className="icon-btn edit-btn" 
                    onClick={() => onEdit(eq)}
                    title="Editar Equipamento"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => onDelete(eq.id!)}
                    title="Excluir Equipamento"
                  >
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
