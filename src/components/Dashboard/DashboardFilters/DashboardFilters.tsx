import { Calendar, Search } from 'lucide-react';
import './DashboardFilters.css';

interface DashboardFiltersProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  equipmentType: string;
  setEquipmentType: (type: string) => void;
  equipmentTypes: string[];
}

export function DashboardFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  equipmentType,
  setEquipmentType,
  equipmentTypes
}: DashboardFiltersProps) {
  return (
    <div className="dashboard-card filters-bar-card">
      <div className="filter-group">
        <Calendar size={16} className="filter-icon" />
        <div className="filter-field">
          <label>Data Inicial</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="filter-input"
          />
        </div>
        <div className="filter-field">
          <label>Data Final</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="filter-input"
          />
        </div>
      </div>

      <div className="filter-group">
        <Search size={16} className="filter-icon" />
        <div className="filter-field">
          <label>Tipo de Equipamento</label>
          <select
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
            className="filter-input filter-select"
          >
            <option value="">Todos os Tipos</option>
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
