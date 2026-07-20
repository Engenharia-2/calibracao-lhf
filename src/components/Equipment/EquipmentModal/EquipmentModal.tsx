import { Modal } from '../../ui/Modal/Modal';
import { useCreateEquipment } from '../../../hooks/useCreateEquipment';
import { Button } from '../../ui/Button/Button';
import './EquipmentModal.css';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EquipmentModal({ isOpen, onClose, onSuccess }: EquipmentModalProps) {
  const {
    op,
    setOp,
    ns,
    handleNsChange,
    name,
    setName,
    isLoading,
    error,
    handleSubmit
  } = useCreateEquipment({ onSuccess });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Equipamento">
      <form onSubmit={handleSubmit} className="equipment-form">
        {/* Campo 1: Número de Série (NS) */}
        <div className="form-group">
          <label htmlFor="ns">Número de Série (NS)</label>
          <input
            id="ns"
            type="text"
            className="form-input"
            value={ns}
            onChange={(e) => handleNsChange(e.target.value)}
            placeholder="Ex: 9999-8888-123456"
            disabled={isLoading}
          />
        </div>

        {/* Campo 2: Ordem de Produção (OP) */}
        <div className="form-group">
          <label htmlFor="op">Ordem de Produção (OP)</label>
          <input
            id="op"
            type="text"
            className="form-input"
            value={op}
            onChange={(e) => setOp(e.target.value)}
            placeholder="Ex: 8888"
            disabled={isLoading}
          />
        </div>

        {/* Campo 3: Nome do Equipamento */}
        <div className="form-group">
          <label htmlFor="name">Nome do Equipamento</label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Megômetro Portátil 5kV LHF"
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-text">{error}</div>}

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
