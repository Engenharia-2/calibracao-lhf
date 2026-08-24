import { CheckCircle, XCircle, FileDown } from 'lucide-react';
import './DashboardRecentCalibrations.css';

interface CalibrationItem {
  id: number;
  equipment_id: number;
  created_at: string;
  overall_status: string;
  operator: string;
  equipment_name: string;
  equipment_ns: string;
  equipment_op: string;
  template_name: string;
  client_company?: string | null;
}

interface DashboardRecentCalibrationsProps {
  calibrations: CalibrationItem[];
  onDownloadPdf: (item: CalibrationItem) => void;
  isDownloading: number | null;
}

export function DashboardRecentCalibrations({
  calibrations,
  onDownloadPdf,
  isDownloading
}: DashboardRecentCalibrationsProps) {
  return (
    <div className="details-panel glass-card recent-calibrations-panel">
      <h3 className="panel-title">Atividades Recentes no Período</h3>
      {calibrations.length === 0 ? (
        <div className="no-table-data">Nenhuma calibração recente encontrada no período.</div>
      ) : (
        <div className="table-responsive">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Equipamento</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {calibrations.map((item) => (
                <tr key={item.id}>
                  <td className="date-cell">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <div className="eq-cell-title">{item.equipment_name}</div>
                    <div className="eq-cell-subtitle">NS: {item.equipment_ns} | OP: {item.equipment_op}</div>
                  </td>
                  <td>{item.client_company || 'LHF'}</td>
                  <td>
                    <span className={`status-badge ${item.overall_status === 'Aprovado' ? 'status-ok' : 'status-fail'}`}>
                      {item.overall_status === 'Aprovado' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {item.overall_status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onDownloadPdf(item)}
                      className="btn-download-recent"
                      disabled={isDownloading === item.id}
                      title="Baixar Certificado PDF"
                    >
                      <FileDown size={15} />
                      {isDownloading === item.id ? '...' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
