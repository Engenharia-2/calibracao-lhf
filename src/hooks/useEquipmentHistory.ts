import { useState, useEffect, useCallback } from 'react';
import { CalibrationRecord } from '../components/Equipment/EquipmentHistory/EquipmentHistory';

export function useEquipmentHistory(equipmentId?: number) {
  const [history, setHistory] = useState<CalibrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!equipmentId) return [];
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window.electron?.getCalibrationHistory === 'function') {
        const list = await window.electron.getCalibrationHistory(equipmentId);
        setHistory(list);
        return list;
      }
      throw new Error('Serviço getCalibrationHistory indisponível.');
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o histórico de calibrações.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { history, isLoading, error, refreshHistory: loadHistory };
}
