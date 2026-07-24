import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Button } from '../../components/ui/Button/Button';
import { IReferenceStandard, IStandardPoint } from '../../services/standards/ApiStandardsRepository';
import { UnitSelect } from '../../components/ui/UnitSelect/UnitSelect';
import './Standards.css';

interface StandardModalProps {
  isOpen: boolean;
  standard?: IReferenceStandard | null;
  onClose: () => void;
  onSuccess: () => void;
}

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
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [points, setPoints] = useState<IStandardPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (standard) {
      setCode(standard.code || '');
      setName(standard.name || '');
      setCertificateNumber(standard.certificate_number || '');
      
      if (standard.validity_date) {
        const d = new Date(standard.validity_date);
        const dateStr = d.toISOString().split('T')[0];
        setValidityDate(dateStr);
      } else {
        setValidityDate('');
      }

      let parsedPoints: IStandardPoint[] = [];
      if (typeof standard.points === 'string') {
        try { parsedPoints = JSON.parse(standard.points); } catch(e) {}
      } else if (Array.isArray(standard.points)) {
        parsedPoints = standard.points;
      }
      setPoints(parsedPoints.length ? parsedPoints : [ { ...defaultPoint } ]);
    } else {
      setCode('');
      setName('');
      setCertificateNumber('');
      setValidityDate('');
      setPoints([ { ...defaultPoint } ]);
    }
  }, [standard, isOpen]);

  const handleAddPoint = () => {
    setPoints(prev => [...prev, { ...defaultPoint }]);
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
      points
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
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
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
              value={validityDate}
              onChange={(e) => setValidityDate(e.target.value)}
              disabled={isLoading}
              required
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
                  <th>Incerteza U (Ext)</th>
                  <th>k</th>
                  <th>Resolução</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        className="form-input table-input"
                        value={p.sectionName}
                        onChange={(e) => handlePointChange(idx, 'sectionName', e.target.value)}
                        placeholder="Ex: Resistência (1 kV)"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        value={p.nominalValue}
                        onChange={(e) => handlePointChange(idx, 'nominalValue', Number(e.target.value))}
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
                        value={p.referenceValue}
                        onChange={(e) => handlePointChange(idx, 'referenceValue', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        value={p.uncertaintyExpanded}
                        onChange={(e) => handlePointChange(idx, 'uncertaintyExpanded', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        value={p.kFactor}
                        onChange={(e) => handlePointChange(idx, 'kFactor', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="form-input table-input"
                        value={p.resolution}
                        onChange={(e) => handlePointChange(idx, 'resolution', Number(e.target.value))}
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
