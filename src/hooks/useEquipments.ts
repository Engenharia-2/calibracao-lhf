import { useState, useEffect } from 'react';
import type { IEquipment } from '../services/equipments/ApiEquipmentsRepository';

export function useEquipments() {
  const [equipments, setEquipments] = useState<IEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof (window as any).electron?.getEquipments === 'function') {
        const data = await (window as any).electron.getEquipments();
        setEquipments(data);
      } else {
        throw new Error('Electron getEquipments is not available');
      }
    } catch (err: any) {
      console.error('Erro ao buscar equipamentos:', err);
      setError(err?.message || 'Erro ao buscar equipamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  return {
    equipments,
    isLoading,
    error,
    refresh: fetchEquipments
  };
}
