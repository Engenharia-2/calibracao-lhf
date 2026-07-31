import { useState, useEffect } from 'react';
import { IReferenceStandard, IStandardPoint } from '../../../services/standards/ApiStandardsRepository';
import { Button } from '../../ui/Button/Button';
import './StandardPointsModal.css';

interface StandardPointsModalProps {
  isOpen: boolean;
  standard: IReferenceStandard | null;
  onClose: () => void;
  onConfirm: (selectedPoints: IStandardPoint[]) => void;
}

export function StandardPointsModal({
  isOpen,
  standard,
  onClose,
  onConfirm
}: StandardPointsModalProps) {
  const [pointsList, setPointsList] = useState<IStandardPoint[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!standard) {
      setPointsList([]);
      setSelectedIndices(new Set());
      return;
    }

    let parsedPoints: IStandardPoint[] = [];
    if (typeof standard.points === 'string') {
      try {
        parsedPoints = JSON.parse(standard.points);
      } catch (e) {
        console.error('Erro ao fazer parse dos pontos do padrão:', e);
      }
    } else if (Array.isArray(standard.points)) {
      parsedPoints = standard.points;
    }

    setPointsList(parsedPoints);
    // Por padrão, selecionamos todos os pontos
    const allIndices = new Set<number>(parsedPoints.map((_, idx) => idx));
    setSelectedIndices(allIndices);
  }, [standard]);

  if (!isOpen || !standard) return null;

  // Agrupa os pontos com seus índices originais por sectionName
  const groupedPoints: { [key: string]: { point: IStandardPoint; originalIndex: number }[] } = {};
  pointsList.forEach((point, index) => {
    const secName = point.sectionName || 'Seção Geral';
    if (!groupedPoints[secName]) {
      groupedPoints[secName] = [];
    }
    groupedPoints[secName].push({ point, originalIndex: index });
  });

  const handleTogglePoint = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  const handleToggleSection = (secName: string, active: boolean) => {
    const next = new Set(selectedIndices);
    groupedPoints[secName].forEach(({ originalIndex }) => {
      if (active) {
        next.add(originalIndex);
      } else {
        next.delete(originalIndex);
      }
    });
    setSelectedIndices(next);
  };

  const handleSelectAll = () => {
    const all = new Set<number>(pointsList.map((_, idx) => idx));
    setSelectedIndices(all);
  };

  const handleDeselectAll = () => {
    setSelectedIndices(new Set());
  };

  const handleSave = () => {
    const selectedPoints = pointsList.filter((_, idx) => selectedIndices.has(idx));
    onConfirm(selectedPoints);
  };

  return (
    <div className="standard-modal-overlay">
      <div className="standard-modal-container">
        <div className="standard-modal-header">
          <h3>Selecionar Pontos do Padrão</h3>
          <p className="standard-modal-subtitle">
            Padrão: <strong>[{standard.code}] {standard.name}</strong> ({standard.certificate_number})
          </p>
        </div>

        <div className="standard-modal-actions-bar">
          <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
            Selecionar Todos
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
            Desmarcar Todos
          </Button>
        </div>

        <div className="standard-modal-body">
          {Object.keys(groupedPoints).length === 0 ? (
            <p className="no-points-warning">Nenhum ponto de calibração configurado neste padrão.</p>
          ) : (
            Object.entries(groupedPoints).map(([secName, items]) => {
              const allSectionSelected = items.every(({ originalIndex }) => selectedIndices.has(originalIndex));
              const someSectionSelected = items.some(({ originalIndex }) => selectedIndices.has(originalIndex)) && !allSectionSelected;

              return (
                <div key={secName} className="standard-modal-section">
                  <div className="standard-modal-section-header">
                    <label className="section-checkbox-label">
                      <input
                        type="checkbox"
                        checked={allSectionSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSectionSelected;
                        }}
                        onChange={(e) => handleToggleSection(secName, e.target.checked)}
                      />
                      <span>Seção: {secName}</span>
                    </label>
                  </div>

                  <div className="standard-modal-section-points">
                    {items.map(({ point, originalIndex }) => (
                      <label key={originalIndex} className="point-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedIndices.has(originalIndex)}
                          onChange={() => handleTogglePoint(originalIndex)}
                        />
                        <span className="point-badge-info">
                          Valor Nominal: <strong>{point.nominalValue} {point.unit}</strong> | 
                          VR: {point.referenceValue} {point.unit}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="standard-modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleSave} disabled={selectedIndices.size === 0}>
            Confirmar Importação ({selectedIndices.size})
          </Button>
        </div>
      </div>
    </div>
  );
}
