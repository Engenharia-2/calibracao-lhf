import { useState, useEffect } from 'react';
import { IClient } from '../services/clients/ApiClientsRepository';

export function useClients() {
  const [clients, setClients] = useState<IClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof (window as any).electron?.getClients === 'function') {
        const data = await (window as any).electron.getClients();
        setClients(data);
      } else {
        throw new Error('Electron getClients is not available');
      }
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err);
      setError(err?.message || 'Erro ao buscar clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    isLoading,
    error,
    refresh: fetchClients
  };
}
