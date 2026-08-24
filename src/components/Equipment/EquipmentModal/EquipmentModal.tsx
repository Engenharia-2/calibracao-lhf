import { Modal } from '../../ui/Modal/Modal';
import { useCreateEquipment } from '../../../hooks/useCreateEquipment';
import { Button } from '../../ui/Button/Button';
import { IEquipment } from '../../../services/equipments/ApiEquipmentsRepository';
import './EquipmentModal.css';

interface EquipmentModalProps {
  isOpen: boolean;
  equipment?: IEquipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EquipmentModal({ isOpen, equipment, onClose, onSuccess }: EquipmentModalProps) {
  const {
    op,
    setOp,
    ns,
    handleNsChange,
    name,
    setName,
    equipmentType,
    setEquipmentType,
    rangeMin,
    setRangeMin,
    rangeMinUnit,
    setRangeMinUnit,
    rangeMax,
    setRangeMax,
    rangeMaxUnit,
    setRangeMaxUnit,
    availableTypes,
    isLoading,
    error,
    handleSubmit
  } = useCreateEquipment({ equipment, onSuccess });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={equipment ? 'Editar Equipamento' : 'Novo Equipamento'}>
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

        {/* Campo 3: Tipo de Equipamento */}
        <div className="form-group">
          <label htmlFor="equipmentType">Tipo de Equipamento</label>
          <select
            id="equipmentType"
            className="form-input"
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Selecione um Tipo...</option>
            {availableTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Campo 4: Modelo do Equipamento */}
        <div className="form-group">
          <label htmlFor="name">Modelo do Equipamento</label>
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

        {/* Campo 5: Faixa de Medição */}
        <div className="form-group">
          <label>Faixa de Medição (Opcional)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              className="form-input"
              value={rangeMin}
              onChange={(e) => setRangeMin(e.target.value)}
              placeholder="Mín."
              style={{ width: '80px', flex: 1 }}
              disabled={isLoading}
            />
            <select
              className="form-input"
              value={rangeMinUnit}
              onChange={(e) => setRangeMinUnit(e.target.value)}
              style={{ width: '80px', flex: 'none' }}
              disabled={isLoading}
            >
              <option value="µΩ">µΩ</option>
              <option value="mΩ">mΩ</option>
              <option value="Ω">Ω</option>
              <option value="kΩ">kΩ</option>
              <option value="MΩ">MΩ</option>
              <option value="GΩ">GΩ</option>
              <option value="TΩ">TΩ</option>
            </select>
            <span style={{ fontWeight: 'bold', color: '#555' }}>a</span>
            <input
              type="number"
              className="form-input"
              value={rangeMax}
              onChange={(e) => setRangeMax(e.target.value)}
              placeholder="Máx."
              style={{ width: '80px', flex: 1 }}
              disabled={isLoading}
            />
            <select
              className="form-input"
              value={rangeMaxUnit}
              onChange={(e) => setRangeMaxUnit(e.target.value)}
              style={{ width: '80px', flex: 'none' }}
              disabled={isLoading}
            >
              <option value="µΩ">µΩ</option>
              <option value="mΩ">mΩ</option>
              <option value="Ω">Ω</option>
              <option value="kΩ">kΩ</option>
              <option value="MΩ">MΩ</option>
              <option value="GΩ">GΩ</option>
              <option value="TΩ">TΩ</option>
            </select>
          </div>
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
