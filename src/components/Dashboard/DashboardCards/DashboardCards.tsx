import { Activity, Award, AlertTriangle, RefreshCw } from 'lucide-react';
import './DashboardCards.css';

interface DashboardCardsProps {
  isLoading: boolean;
  totalCalibrations: number;
  approved: number;
  reproved: number;
  alertsCount: number;
}

export function DashboardCards({
  isLoading,
  totalCalibrations,
  approved,
  reproved,
  alertsCount
}: DashboardCardsProps) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card glass-card accent-blue">
        <div className="kpi-icon-wrapper">
          <Activity size={24} />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Calibrações Realizadas</span>
          <span className="kpi-value">{isLoading ? '...' : totalCalibrations}</span>
        </div>
      </div>

      <div className="kpi-card glass-card accent-green">
        <div className="kpi-icon-wrapper">
          <Award size={24} />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Aprovadas</span>
          <span className="kpi-value">{isLoading ? '...' : approved}</span>
        </div>
      </div>

      <div className="kpi-card glass-card accent-red">
        <div className="kpi-icon-wrapper">
          <AlertTriangle size={24} />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Reprovadas</span>
          <span className="kpi-value">{isLoading ? '...' : reproved}</span>
        </div>
      </div>

      <div className="kpi-card glass-card accent-yellow">
        <div className="kpi-icon-wrapper">
          <RefreshCw size={24} />
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Alertas Vencimento</span>
          <span className="kpi-value">{isLoading ? '...' : alertsCount}</span>
        </div>
      </div>
    </div>
  );
}
