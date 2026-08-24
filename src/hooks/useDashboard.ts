import { useState, useEffect } from 'react';
import { IDashboardMetrics } from '../services/dashboard/ApiDashboardRepository';

export function useDashboard() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [equipmentType, setEquipmentType] = useState('');
  
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        if (typeof window.electron?.getTemplates === 'function') {
          const list = await window.electron.getTemplates();
          const types = Array.from(new Set(list.map((t: any) => t.equipment_type))).filter(Boolean);
          setEquipmentTypes(types as string[]);
        }
      } catch (err) {
        console.error('Erro ao buscar tipos de equipamentos:', err);
      }
    };
    fetchTypes();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window.electron?.getDashboardMetrics === 'function') {
        const data = await window.electron.getDashboardMetrics({
          startDate,
          endDate,
          equipmentType: equipmentType || undefined
        });
        setMetrics(data);
      }
    } catch (err) {
      console.error('Erro ao buscar métricas do dashboard:', err);
      setError('Erro ao conectar com a API de métricas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [startDate, endDate, equipmentType]);

  return {
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
  };
}
