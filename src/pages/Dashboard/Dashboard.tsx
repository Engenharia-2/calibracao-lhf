import { RefreshCw } from 'lucide-react';
import { CalibrationStatusChart } from '../../components/Dashboard/CalibrationStatusChart/CalibrationStatusChart';
import { CalibrationTrendChart } from '../../components/Dashboard/CalibrationTrendChart/CalibrationTrendChart';
import { DashboardFilters } from '../../components/Dashboard/DashboardFilters/DashboardFilters';
import { DashboardCards } from '../../components/Dashboard/DashboardCards/DashboardCards';
import { DashboardAlerts } from '../../components/Dashboard/DashboardAlerts/DashboardAlerts';
import { DashboardRecentCalibrations } from '../../components/Dashboard/DashboardRecentCalibrations/DashboardRecentCalibrations';
import { useDashboard } from '../../hooks/useDashboard';
import { useDownloadCalibrationPdf } from '../../hooks/useDownloadCalibrationPdf';
import './Dashboard.css';

export function Dashboard() {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    equipmentType,
    setEquipmentType,
    equipmentTypes,
    metrics,
    isLoading,
    error,
    loadMetrics
  } = useDashboard();

  const { downloadPdf, isDownloading } = useDownloadCalibrationPdf();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h2 className="dashboard-title">Painel de Métricas (Dashboard)</h2>
          <p className="dashboard-subtitle">Acompanhe calibrações, validades e produtividade do laboratório LHF</p>
        </div>
        <button className="refresh-btn" onClick={loadMetrics} disabled={isLoading} title="Recarregar">
          <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          Sincronizar
        </button>
      </div>

      {/* Barra de Filtros */}
      <DashboardFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        equipmentType={equipmentType}
        setEquipmentType={setEquipmentType}
        equipmentTypes={equipmentTypes}
      />

      {error && <div className="error-banner">{error}</div>}

      {/* KPIs Grid */}
      <DashboardCards
        isLoading={isLoading}
        totalCalibrations={metrics?.kpi.total || 0}
        approved={metrics?.kpi.approved || 0}
        reproved={metrics?.kpi.reproved || 0}
        alertsCount={(metrics?.expiringStandards.length || 0) + (metrics?.expiringEquipments.length || 0)}
      />

      {/* Gráficos em Linha */}
      <div className="charts-grid">
        <CalibrationStatusChart 
          approved={metrics?.kpi.approved || 0} 
          reproved={metrics?.kpi.reproved || 0} 
        />
        <CalibrationTrendChart 
          trend={metrics?.trend || []} 
        />
      </div>

      {/* Alertas e Calibrações Recentes */}
      <div className="dashboard-details-row">
        <DashboardAlerts
          expiringStandards={metrics?.expiringStandards || []}
          expiringEquipments={metrics?.expiringEquipments || []}
        />
        <DashboardRecentCalibrations
          calibrations={metrics?.calibrations || []}
          onDownloadPdf={downloadPdf}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
}
