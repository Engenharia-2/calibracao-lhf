import { useState, useEffect } from 'react';
import { ApiCalibrationRepository } from '../../services/calibration/ApiCalibrationRepository';
import { CalibrationHistoryTable } from '../../components/CalibrationHistory/CalibrationHistoryTable';
import './CalibrationHistory.css';

const calibrationRepo = new ApiCalibrationRepository();

export function CalibrationHistory() {
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h2 className="history-title">Livro de Registros</h2>
          <p className="history-subtitle">
            Histórico completo e rastreabilidade metrológica de todos os certificados emitidos.
          </p>
        </div>
      </div>

      <div className="history-card">
        <div className="history-card-body">
          {isLoading ? (
            <div className="history-loading">Buscando calibrações...</div>
          ) : (
            <CalibrationHistoryTable records={calibrations} />
          )}
        </div>
      </div>
    </div>
  );
}
