import { useState, useEffect } from 'react';
import { IEquipment } from '../../services/equipments/ApiEquipmentsRepository';
import { ReadonlyCalibrationGrid } from '../../components/Calibration/ReadonlyCalibrationGrid/ReadonlyCalibrationGrid';
import { Button } from '../../components/ui/Button/Button';
import './EquipmentHistory.css';

interface EquipmentHistoryProps {
  equipment: IEquipment;
  onBack: () => void;
}

interface CalibrationRecord {
  id: number;
  equipment_id: number;
  template_id: string;
  template_name: string;
  operator: string;
  temperature: number;
  humidity: number;
  mains_voltage: number | null;
  readings: any; // JSON
  overall_status: 'Aprovado' | 'Reprovado';
  started_at: string | null;
  created_at: string;
}

export function EquipmentHistory({ equipment, onBack }: EquipmentHistoryProps) {
  const [history, setHistory] = useState<CalibrationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CalibrationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (typeof window.electron?.getCalibrationHistory === 'function') {
          const list = await window.electron.getCalibrationHistory(equipment.id!);
          setHistory(list);
        } else {
          throw new Error('Electron getCalibrationHistory interface not available');
        }
      } catch (err: any) {
        console.error(err);
        setError('Não foi possível carregar o histórico de calibrações.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [equipment]);

  const getDuration = (startedAt: string | null, createdAt: string) => {
    if (!startedAt) return 'Não registrado';
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
    <div className="equipment-history-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Histórico de Calibrações</h2>
          <p>Confira todos os testes de bancada executados para o equipamento <strong>{equipment.name}</strong>.</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Voltar para Lista
        </Button>
      </div>

      <div className="workspace-main">
        {/* Banner do Equipamento */}
        <div className="workspace-card equipment-details-banner">
          <h3>Dados do Equipamento</h3>
          <div className="details-grid">
            <div><strong>Nome:</strong> {equipment.name}</div>
            <div><strong>Número de Série (NS):</strong> {equipment.ns}</div>
            <div><strong>Ordem de Produção (OP):</strong> {equipment.op}</div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="workspace-card">
          <h3>Calibrações Realizadas</h3>

          {isLoading ? (
            <div className="loading-state">Carregando histórico...</div>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhuma calibração realizada</h3>
              <p>Este equipamento ainda não possui calibrações salvas no banco de dados.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data de Execução</th>
                    <th>Formulário</th>
                    <th>Operador</th>
                    <th>Duração</th>
                    <th>Status Final</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rec) => (
                    <tr key={rec.id}>
                      <td>{new Date(rec.created_at).toLocaleString('pt-BR')}</td>
                      <td>
                        <strong>{rec.template_id}</strong> - {rec.template_name}
                      </td>
                      <td>{rec.operator}</td>
                      <td>{getDuration(rec.started_at, rec.created_at)}</td>
                      <td>
                        <span className={`status-badge ${rec.overall_status.toLowerCase()}`}>
                          {rec.overall_status}
                        </span>
                      </td>
                      <td>
                        <Button 
                          size="sm"
                          variant="danger" 
                          onClick={() => setSelectedRecord(rec)}
                        >
                          Visualizar Planilha
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Overlay de Visualização da Planilha Gravada */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content readonly-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Planilha de Calibração Gravada - ID #{selectedRecord.id}</h3>
              <button className="btn-close" onClick={() => setSelectedRecord(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {/* Infos Clima e Condições do dia */}
              <div className="readonly-meta-banner">
                <div><strong>Operador:</strong> {selectedRecord.operator}</div>
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
              </div>

              {/* Tabelas de Leitura */}
              <div className="grids-container" style={{ marginTop: '20px' }}>
                {(selectedRecord.readings || []).map((section: any, sIdx: number) => (
                  <ReadonlyCalibrationGrid key={sIdx} section={section} />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setSelectedRecord(null)}>
                Fechar Auditoria
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
