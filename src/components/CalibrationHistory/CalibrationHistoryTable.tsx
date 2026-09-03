import { useState } from 'react';
import { FileDown, TableProperties } from 'lucide-react';
import { useDownloadCalibrationPdf } from '../../hooks/useDownloadCalibrationPdf';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { ReadonlyCalibrationGrid } from '../Calibration/ReadonlyCalibrationGrid/ReadonlyCalibrationGrid';
import { useEditCalibrationHeader } from '../../hooks/useEditCalibrationHeader';
import './CalibrationHistoryTable.css';

interface Props {
  records: any[];
  onRefresh?: () => void;
}

export function CalibrationHistoryTable({ records, onRefresh }: Props) {
  const { downloadPdf, isDownloading } = useDownloadCalibrationPdf();
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Hook de edicao de metadados da calibracao
  const {
    clients,
    isEditing,
    setIsEditing,
    editClientId,
    setEditClientId,
    editCreatedAt,
    setEditCreatedAt,
    handleSaveHeader
  } = useEditCalibrationHeader({
    selectedRecord,
    setSelectedRecord,
    refreshHistory: async () => {
      if (onRefresh) onRefresh();
      return [];
    }
  });

  const getDuration = (startedAt: string | null, createdAt: string) => {
    if (!startedAt) return 'Nǜo registrado';
    const start = new Date(startedAt).getTime();
    const end = new Date(createdAt).getTime();
    const diffMs = end - start;
    if (diffMs <= 0) return '0s';
    const diffSec = Math.floor(diffMs / 1000);
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Equipamento (TAG)</th>
            <th>Cliente</th>
            <th>Status</th>
            <th className="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td className="td-date">
                {new Date(rec.created_at).toLocaleDateString('pt-BR')}
              </td>
              <td>
                <div className="td-title">
                  {rec.equipment_tag || 'S/N'}
                </div>
                <div className="td-subtitle">
                  {rec.equipment_description || ''}
                </div>
              </td>
              <td className="td-client">
                {rec.client_company || '-'}
              </td>
              <td>
                <span className={`status-badge ${rec.overall_status === 'Aprovado' ? 'status-approved' : 'status-rejected'}`}>
                  {rec.overall_status || '-'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className="btn-action-sm btn-action-slate" 
                    onClick={() => setSelectedRecord(rec)}
                    title="Visualizar Planilha"
                  >
                    <TableProperties size={15} /> Planilha
                  </button>
                  <button
                    onClick={() => downloadPdf(rec)}
                    className="btn-action-sm btn-action-blue"
                    disabled={isDownloading === rec.id}
                    title="Baixar Certificado PDF"
                  >
                    <FileDown size={15} />
                    {isDownloading === rec.id ? '...' : 'PDF'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Visualizacao da Planilha Gravada */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord ? `Planilha de Calibração Gravada - ID #${selectedRecord.id}` : ''}
        size="xxl"
      >
        {selectedRecord && (
          <>
            {/* Infos Clima e Condições do dia */}
            {isEditing ? (
              <div className="readonly-meta-banner editing-banner">
                <div className="editing-banner-fields">
                  <div className="editing-banner-group">
                    <label className="editing-banner-label">Cliente:</label>
                    <select
                      value={editClientId || ''}
                      onChange={(e) => setEditClientId(e.target.value ? Number(e.target.value) : null)}
                      className="editing-banner-input"
                    >
                      <option value="">LHF (Uso Interno)</option>
                      {clients.map((cli) => (
                        <option key={cli.id} value={cli.id}>
                          {cli.company} ({cli.cnpj})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="editing-banner-group">
                    <label className="editing-banner-label">Data de Execução:</label>
                    <input
                      type="datetime-local"
                      value={editCreatedAt}
                      onChange={(e) => setEditCreatedAt(e.target.value)}
                      className="editing-banner-input"
                    />
                  </div>
                </div>
                <div className="editing-banner-actions">
                  <Button size="sm" variant="primary" onClick={handleSaveHeader}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="readonly-meta-banner">
                <div><strong>Operador:</strong> {selectedRecord.operator}</div>
                <div><strong>Cliente:</strong> {selectedRecord.client_company || 'LHF (Uso Interno)'}</div>
                <div><strong>Data:</strong> {new Date(selectedRecord.created_at).toLocaleString('pt-BR')}</div>
                <div><strong>Duração:</strong> {getDuration(selectedRecord.started_at, selectedRecord.created_at)}</div>
                <div><strong>Temperatura:</strong> {selectedRecord.temperature} °C</div>
                <div><strong>Umidade:</strong> {selectedRecord.humidity} %</div>
                {selectedRecord.mains_voltage && (
                  <div><strong>Rede VCA:</strong> {selectedRecord.mains_voltage} V</div>
                )}
                <div>
                  <strong>Status Geral:</strong>{' '}
                  <span className={`status-badge ${selectedRecord.overall_status.toLowerCase()}`}>
                    {selectedRecord.overall_status}
                  </span>
                </div>
                <div className="readonly-meta-actions">
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                    Editar Cliente/Data
                  </Button>
                </div>
              </div>
            )}

            {/* Tabelas de Leitura */}
            <div className="grids-container" style={{ marginTop: '20px' }}>
              {(selectedRecord.readings || []).map((section: any, sIdx: number) => (
                <ReadonlyCalibrationGrid key={sIdx} section={section} />
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
