import { useState, useEffect } from 'react';
import { IClient } from '../services/clients/ApiClientsRepository';

interface UseCreateClientProps {
  client?: IClient | null;
  onSuccess?: () => void;
}

export function useCreateClient({ client, onSuccess }: UseCreateClientProps = {}) {
  const [company, setCompany] = useState(client?.company || '');
  const [cnpj, setCnpj] = useState(client?.cnpj || '');
  const [email, setEmail] = useState(client?.email || '');
  const [adress, setAdress] = useState(client?.adress || '');
  const [city, setCity] = useState(client?.city || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCompany(client?.company || '');
    setCnpj(client?.cnpj || '');
    setEmail(client?.email || '');
    setAdress(client?.adress || '');
    setCity(client?.city || '');
    setError(null);
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !cnpj || !email) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (client?.id) {
        if (typeof (window as any).electron?.updateClient !== 'function') {
          throw new Error('Função de comunicação updateClient indisponível.');
        }
        const result = await (window as any).electron.updateClient(client.id, company, cnpj, email, adress, city);
        console.log('Cliente atualizado:', result);
      } else {
        if (typeof (window as any).electron?.createClient !== 'function') {
          throw new Error('Função de comunicação createClient indisponível.');
        }
        const result = await (window as any).electron.createClient(company, cnpj, email, adress, city);
        console.log('Cliente criado:', result);
      }
      
      setCompany('');
      setCnpj('');
      setEmail('');
      setAdress('');
      setCity('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar cliente. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    company,
    setCompany,
    cnpj,
    setCnpj,
    email,
    setEmail,
    adress,
    setAdress,
    city,
    setCity,
    isLoading,
    error,
    handleSubmit
  };
}
