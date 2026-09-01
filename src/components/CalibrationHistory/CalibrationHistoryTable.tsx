import { useState, useMemo } from 'react';
import { Search, FileText } from 'lucide-react';
import { useDownloadCalibrationPdf } from '../../hooks/useDownloadCalibrationPdf';
import './CalibrationHistoryTable.css';

interface Props {
  records: any[];
}

export function CalibrationHistoryTable({ records }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const { downloadPdf, isDownloading } = useDownloadCalibrationPdf();

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const searchStr = searchTerm.toLowerCase();
      const dateStr = new Date(rec.created_at).toLocaleDateString('pt-BR').toLowerCase();
      const tagStr = (rec.equipment_tag || '').toLowerCase();
      const companyStr = (rec.client_company || '').toLowerCase();
      return (
        dateStr.includes(searchStr) ||
        tagStr.includes(searchStr) ||
        companyStr.includes(searchStr)
      );
    });
  }, [records, searchTerm]);

  return (
    <div>
      <div className="table-toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar por Data, TAG ou Cliente..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" />
        </div>
        <div className="toolbar-info">
          Mostrando {filteredRecords.length} calibrações
        </div>
      </div>

      <div className="table-responsive">
        <table className="history-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Equipamento (TAG)</th>
              <th>Cliente</th>
              <th>Status</th>
              <th className="right-align">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#6b7280' }}>
                  Nenhuma calibração encontrada.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
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
                  <td className="td-actions">
                    <button
                      onClick={() => downloadPdf(rec)}
                      disabled={isDownloading === rec.id}
                      className="btn-pdf"
                    >
                      <FileText style={{ width: '1rem', height: '1rem' }} />
                      {isDownloading === rec.id ? 'Gerando...' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
