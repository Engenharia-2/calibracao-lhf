import { useState } from 'react';

interface UseCreateEquipmentProps {
  onSuccess?: () => void;
}

function extractOpFromNs(nsValue: string): string {
  if (!nsValue || !nsValue.includes('-')) return '';
  const parts = nsValue.split('-').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return parts[1];
  } else if (parts.length === 2) {
    return parts[1];
  }
  return '';
}

export function useCreateEquipment({ onSuccess }: UseCreateEquipmentProps = {}) {
  const [op, setOp] = useState('');
  const [ns, setNs] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNsChange = (newNs: string) => {
    setNs(newNs);
    const extractedOp = extractOpFromNs(newNs);
    if (extractedOp) {
      setOp(extractedOp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!op || !ns || !name) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (typeof (window as any).electron?.createEquipment !== 'function') {
        throw new Error('Função de comunicação indisponível no Electron.');
      }
      
      const result = await (window as any).electron.createEquipment(op, ns, name);
      console.log('Equipamento criado:', result);
      
      setOp('');
      setNs('');
      setName('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar equipamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    op,
    setOp,
    ns,
    setNs,
    handleNsChange,
    name,
    setName,
    isLoading,
    error,
    handleSubmit
  };
}
