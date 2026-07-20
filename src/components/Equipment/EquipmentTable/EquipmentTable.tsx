import type { IEquipment } from '../../../services/equipments/ApiEquipmentsRepository';
import { Button } from '../../ui/Button/Button';
import './EquipmentTable.css';

interface EquipmentTableProps {
  equipments: IEquipment[];
  onCalibrate: (equipment: IEquipment) => void;
  onViewHistory: (equipment: IEquipment) => void;
}

export function EquipmentTable({ equipments, onCalibrate, onViewHistory }: EquipmentTableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ordem de Produção (OP)</th>
            <th>Número de Série (NS)</th>
            <th>Equipamento</th>
            <th>Data de Cadastro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {equipments.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.op}</td>
              <td>{eq.ns}</td>
              <td>{eq.name}</td>
              <td>{new Date(eq.created_at || '').toLocaleDateString('pt-BR')}</td>
              <td>
                <div className="action-buttons-cell">
                  <Button size="sm" variant="primary" onClick={() => onCalibrate(eq)}>
                    Calibrar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onViewHistory(eq)}>
                    Histórico
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
