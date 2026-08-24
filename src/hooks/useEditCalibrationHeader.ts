import { useState, useEffect } from 'react';
import { CalibrationRecord } from '../components/Equipment/EquipmentHistory/EquipmentHistory';

interface UseEditCalibrationHeaderProps {
  selectedRecord: CalibrationRecord | null;
  setSelectedRecord: (rec: CalibrationRecord | null) => void;
  refreshHistory: () => Promise<CalibrationRecord[]>;
}

export function useEditCalibrationHeader({
  selectedRecord,
  setSelectedRecord,
  refreshHistory
}: UseEditCalibrationHeaderProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [editCreatedAt, setEditCreatedAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Carregar os clientes para o select dropdown
  useEffect(() => {
    const loadClients = async () => {
      try {
        if (typeof window.electron?.getClients === 'function') {
          const list = await window.electron.getClients();
          setClients(list);
        }
      } catch (err) {
        console.error('Erro ao buscar clientes no histórico:', err);
      }
    };
    loadClients();
  }, []);

  // Sincronizar estados de inputs com o registro selecionado no modal
  useEffect(() => {
    if (selectedRecord) {
      setEditClientId(selectedRecord.client_id || null);
      const date = new Date(selectedRecord.created_at);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setEditCreatedAt(localISOTime);
      setIsEditing(false);
    }
  }, [selectedRecord]);

  const handleSaveHeader = async () => {
    if (!selectedRecord) return;
    try {
      if (typeof window.electron?.updateCalibrationHeader !== 'function') {
        throw new Error('Função de comunicação updateCalibrationHeader indisponível.');
      }
      
      setIsSaving(true);
      await window.electron.updateCalibrationHeader(
        selectedRecord.id,
        editClientId,
        new Date(editCreatedAt).toISOString()
      );

      // Recarrega o histórico geral de calibrações
      const freshList = await refreshHistory();
      
      // Atualiza o registro ativo exibido no modal para refletir a alteração imediatamente
      const updated = freshList.find((rec) => rec.id === selectedRecord.id);
      if (updated) {
        setSelectedRecord(updated);
      }
      
      setIsEditing(false);
    } catch (err: any) {
      alert(err?.message || 'Erro ao atualizar os dados da calibração.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    clients,
    isEditing,
    setIsEditing,
    editClientId,
    setEditClientId,
    editCreatedAt,
    setEditCreatedAt,
    isSaving,
    handleSaveHeader
  };
}
