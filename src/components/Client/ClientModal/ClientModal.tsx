import { Modal } from '../../ui/Modal/Modal';
import { useCreateClient } from '../../../hooks/useCreateClient';
import { Button } from '../../ui/Button/Button';
import './ClientModal.css';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClientModal({ isOpen, onClose, onSuccess }: ClientModalProps) {
  const {
    company,
    setCompany,
    cnpj,
    setCnpj,
    email,
    setEmail,
    isLoading,
    error,
    handleSubmit
  } = useCreateClient({ onSuccess });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Cliente">
      <form onSubmit={handleSubmit} className="client-form">
        <div className="form-group">
          <label htmlFor="company">Empresa (Razão Social/Nome)</label>
          <input
            id="company"
            type="text"
            className="form-input"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Ex: LHF Calibrações Ltda"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            id="cnpj"
            type="text"
            className="form-input"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Ex: 00.000.000/0001-00"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail de Contato</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: contato@empresa.com"
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
