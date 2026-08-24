import { useState, useRef } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Button } from '../../ui/Button/Button';
import { IReferenceStandard, IStandardPoint } from '../../../services/standards/ApiStandardsRepository';
import { UnitSelect } from '../../ui/UnitSelect/UnitSelect';
import './StandardModal.css';

interface StandardModalProps {
  isOpen: boolean;
  standard?: IReferenceStandard | null;
  onClose: () => void;
  onSuccess: () => void;
}

const generateUniqueId = () => {
  return 'pt-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
};

const defaultPoint: IStandardPoint = {
  sectionName: 'Resistência (1 kV)',
  nominalValue: 10,
  unit: 'MΩ',
  referenceValue: 10.006666,
  uncertaintyExpanded: 0.00011,
  kFactor: 2,
  resolution: 0.01
};

export function StandardModal({ isOpen, standard, onClose, onSuccess }: StandardModalProps) {
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const certificateNumberRef = useRef<HTMLInputElement>(null);
  const validityDateRef = useRef<HTMLInputElement>(null);
  const certificateUrlRef = useRef<HTMLInputElement>(null);

  const [points, setPoints] = useState<IStandardPoint[]>(() => {
    if (standard) {
      let parsedPoints: IStandardPoint[] = [];
      if (typeof standard.points === 'string') {
        try { parsedPoints = JSON.parse(standard.points); } catch(e) {}
      } else if (Array.isArray(standard.points)) {
        parsedPoints = standard.points;
      }
      return parsedPoints.map(pt => ({
        ...pt,
        id: pt.id || generateUniqueId()
      }));
    }
    return [ { ...defaultPoint, id: generateUniqueId() } ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPoint = () => {
    setPoints(prev => [...prev, { ...defaultPoint, id: generateUniqueId() }]);
  };

  const handleRemovePoint = (index: number) => {
    setPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, field: keyof IStandardPoint, value: any) => {
    setPoints(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeRef.current?.value || '';
    const name = nameRef.current?.value || '';
    const certificateNumber = certificateNumberRef.current?.value || '';
    const validityDate = validityDateRef.current?.value || '';
    const certificateUrl = certificateUrlRef.current?.value || '';

    if (!code || !name || !certificateNumber || !validityDate) {
      setError('Por favor, preencha todos os campos do padrão.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: IReferenceStandard = {
      code,
      name,
      certificate_number: certificateNumber,
      validity_date: validityDate,
      points,
      certificate_url: certificateUrl || undefined
    };

    try {
      if (standard?.id) {
        await window.electron.updateStandard(standard.id, payload);
      } else {
        await window.electron.createStandard(payload);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao salvar o padrão de referência.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title={standard?.id ? `Editar Padrão: ${standard.code}` : 'Novo Padrão de Referência'}>
      <form onSubmit={handleSubmit} className="standard-form">
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="code">Código do Padrão</label>
            <input
              id="code"
              type="text"
              className="form-input"
              ref={codeRef}
              defaultValue={standard?.code || ''}
              placeholder="Ex: PA-EC-03993"
              disabled={isLoading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Descrição do Padrão</label>
            <input
              id="name"
              type="text"
              className="form-input"
              ref={nameRef}
              defaultValue={standard?.name || ''}
              placeholder="Ex: Módulo de Resistência Padrão LHF - MRP - 01"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="cert">Número do Certificado RBC</label>
            <input
              id="cert"
              type="text"
              className="form-input"
              ref={certificateNumberRef}
              defaultValue={standard?.certificate_number || ''}
              placeholder="Ex: CCR 662/25"
              disabled={isLoading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="validity">Data de Validade do Certificado</label>
            <input
              id="validity"
              type="date"
              className="form-input"
              ref={validityDateRef}
              defaultValue={standard?.validity_date ? new Date(standard.validity_date).toISOString().split('T')[0] : ''}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="certUrl">Link do Certificado de Calibração (URL)</label>
            <input
              id="certUrl"
              type="url"
              className="form-input"
              ref={certificateUrlRef}
              defaultValue={standard?.certificate_url || ''}
              placeholder="Ex: https://drive.google.com/drive/folders/..."
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="standard-points-editor" style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0 }}>Tabela de Pontos de Referência RBC</h4>
            <Button type="button" variant="outline" size="sm" onClick={handleAddPoint} disabled={isLoading}>
              + Adicionar Ponto RBC
            </Button>
          </div>

          <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seção / Escala</th>
                  <th>Nominal</th>
                  <th>Unidade</th>
                  <th>Ref. Padrão (VR)</th>
                  <th>Incerteza U</th>
                  <th>k</th>
                  <th>Resolução</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td>
                      <input
                        type="text"
                        className="form-input table-input"
                        defaultValue={p.sectionName}
                        onBlur={(e) => handlePointChange(idx, 'sectionName', e.target.value)}
                        placeholder="Ex: Resistência (1 kV)"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        defaultValue={p.nominalValue}
                        onBlur={(e) => handlePointChange(idx, 'nominalValue', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <UnitSelect
                        className="table-input"
                        value={p.unit}
                        onChangeValue={(val) => handlePointChange(idx, 'unit', val)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        defaultValue={p.referenceValue}
                        onBlur={(e) => handlePointChange(idx, 'referenceValue', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        defaultValue={p.uncertaintyExpanded}
                        onBlur={(e) => handlePointChange(idx, 'uncertaintyExpanded', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        defaultValue={p.kFactor}
                        onBlur={(e) => handlePointChange(idx, 'kFactor', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        defaultValue={p.resolution}
                        onBlur={(e) => handlePointChange(idx, 'resolution', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove-point"
                        onClick={() => handleRemovePoint(idx)}
                        disabled={points.length === 1}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Padrão'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
