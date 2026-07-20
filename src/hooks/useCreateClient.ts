import { useState } from 'react';

interface UseCreateClientProps {
  onSuccess?: () => void;
}

export function useCreateClient({ onSuccess }: UseCreateClientProps = {}) {
  const [company, setCompany] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !cnpj || !email) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (typeof (window as any).electron?.createClient !== 'function') {
        throw new Error('Função de comunicação indisponível no Electron.');
      }
      
      const result = await (window as any).electron.createClient(company, cnpj, email);
      console.log('Cliente criado:', result);
      
      setCompany('');
      setCnpj('');
      setEmail('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar cliente. Tente novamente.');
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
    isLoading,
    error,
    handleSubmit
  };
}
