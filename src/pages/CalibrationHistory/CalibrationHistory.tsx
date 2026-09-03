import { useState, useEffect } from 'react';
import { ApiCalibrationRepository } from '../../services/calibration/ApiCalibrationRepository';
import { CalibrationHistoryTable } from '../../components/CalibrationHistory/CalibrationHistoryTable';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import './CalibrationHistory.css';

const calibrationRepo = new ApiCalibrationRepository();

export function CalibrationHistory() {
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCalibrations();
  }, []);

  const loadCalibrations = async () => {
    try {
      setIsLoading(true);
      const data = await calibrationRepo.getAll();
      setCalibrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = calibrations.filter(rec => {
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

  return (
    <div className="history-page">
      <PageHeader 
        onSearch={setSearchTerm}
        searchPlaceholder="Buscar por Data, TAG ou Cliente..."
      />
      <div className="page-content">
        {isLoading ? (
          <div className="loading-state">Buscando calibrações...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma calibração encontrada</h3>
            {searchTerm ? (
              <p>Não há nenhum registro que corresponda à busca "{searchTerm}".</p>
            ) : (
              <p>O livro de registros está vazio.</p>
            )}
          </div>
        ) : (
          <CalibrationHistoryTable records={filteredRecords} onRefresh={loadCalibrations} />
        )}
      </div>
    </div>
  );
}
