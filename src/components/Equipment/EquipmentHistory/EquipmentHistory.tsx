import { useState } from 'react';
import { IEquipment } from '../../../services/equipments/ApiEquipmentsRepository';
import { ReadonlyCalibrationGrid, ReadonlySection } from '../../Calibration/ReadonlyCalibrationGrid/ReadonlyCalibrationGrid';
import { Button } from '../../ui/Button/Button';
import { Modal } from '../../ui/Modal/Modal';
import { PageHeader } from '../../ui/PageHeader/PageHeader';
import { pdf } from '@react-pdf/renderer';
import { CalibrationPDFDocument } from '../../Calibration/CalibrationPDFDocument/CalibrationPDFDocument';
import { EquipmentInfo } from '../EquipmentInfo/EquipmentInfo';
import './EquipmentHistory.css';

interface EquipmentHistoryProps {
  equipment: IEquipment;
  onBack: () => void;
}

import { useEquipmentHistory } from '../../../hooks/useEquipmentHistory';
import { useEditCalibrationHeader } from '../../../hooks/useEditCalibrationHeader';

export interface CalibrationRecord {
  id: number;
  equipment_id: number;
  client_id?: number | null;
  client_company?: string | null;
  client_cnpj?: string | null;
  client_email?: string | null;
  client_adress?: string | null;
  client_city?: string | null;
  template_id: string;
  template_name: string;
  operator: string;
  temperature: number;
  humidity: number;
  mains_voltage: number | null;
  readings: ReadonlySection[];
  overall_status: 'Aprovado' | 'Reprovado';
  started_at: string | null;
  created_at: string;
  standard_code?: string | null;
  standard_name?: string | null;
  standard_certificate?: string | null;
  standard_certificate_url?: string | null;
}

export function EquipmentHistory({ equipment, onBack }: EquipmentHistoryProps) {
  const [selectedRecord, setSelectedRecord] = useState<CalibrationRecord | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<number | null>(null);

  // Hook de busca e atualizacao do historico
  const handleDownloadPdf = async (rec: CalibrationRecord) => {
    setIsPdfGenerating(rec.id);
    try {
      const doc = (
        <CalibrationPDFDocument
          record={rec}
          equipmentName={equipment.name}
          equipmentNs={equipment.ns}
          equipmentOp={equipment.op}
          equipmentType={equipment.equipment_type || '-'}
          equipmentRange={equipment.measurement_range || '-'}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const [day, month, year] = new Date(rec.created_at).toLocaleDateString('pt-BR').split('/');
      const yearStr = year.slice(-2);
      link.download = `Certificado-${yearStr}${month}${day}${equipment.op}.pdf`;

      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar certificado PDF.');
    } finally {
      setIsPdfGenerating(null);
    }
  };

  const { history, isLoading, error, refreshHistory } = useEquipmentHistory(equipment.id);

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
    refreshHistory
  });

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
      <PageHeader 
        action={
          <Button variant="secondary" onClick={onBack}>
            Voltar para Lista
          </Button>
        }
      />
      <div className="internal-page-header">
        <h2>Histórico de Calibrações</h2>
        <p>
          Confira todos os testes de bancada executados para o equipamento <strong>{equipment.name}</strong>.
        </p>
      </div>

      <div className="workspace-main">
        {/* Banner do Equipamento */}
        <EquipmentInfo equipment={equipment} />

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
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Button 
                          size="sm"
                          variant="danger" 
                          onClick={() => setSelectedRecord(rec)}
                        >
                          Visualizar Planilha
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={isPdfGenerating === rec.id}
                          onClick={() => handleDownloadPdf(rec)}
                        >
                          {isPdfGenerating === rec.id ? 'Gerando...' : 'PDF'}
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

      {/* Modal de Visualização da Planilha Gravada */}
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
              {(selectedRecord.readings || []).map((section, sIdx) => (
                <ReadonlyCalibrationGrid key={sIdx} section={section} />
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
