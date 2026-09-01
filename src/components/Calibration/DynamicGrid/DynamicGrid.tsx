import React, { useState, useEffect } from 'react';
import { ITemplateSection } from '../../../services/templates/ApiTemplatesRepository';
import { GridState } from '../../../hooks/useCalibrationWorkspace';
import './DynamicGrid.css';

interface DynamicGridProps {
  section: ITemplateSection;
  sectionIndex: number;
  gridState: GridState;
  updateCell: (
    sectionIndex: number,
    pointIndex: number,
    cycleIndex: number,
    columnKey: string,
    value: string
  ) => void;
  getPointCalculations: (sectionIndex: number, pointIndex: number) => any;
  isCorrectionApplied?: boolean;
  onToggleCorrection?: (val: boolean) => void;
  scaleMode?: 'point' | 'scale';
  scaleValue?: number;
  onUpdateScaleMode?: (sectionIndex: number, mode: 'point' | 'scale', scaleValue?: number) => void;
}

interface GridInputProps {
  value: string | number;
  onChange: (val: string) => void;
}

function GridInput({ value, onChange }: GridInputProps) {
  const [localVal, setLocalVal] = useState(String(value));

  useEffect(() => {
    setLocalVal(String(value));
  }, [value]);

  const handleBlur = () => {
    if (localVal !== String(value)) {
      onChange(localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Dispara o onBlur e salva
    }
  };

  const isInvalid = localVal.trim() !== '' && 
                    localVal.trim() !== '-' && 
                    isNaN(Number(localVal.trim().replace(',', '.')));

  return (
    <input
      type="text"
      className={`grid-input ${isInvalid ? 'input-invalid' : ''}`}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="-"
    />
  );
}

export function DynamicGrid({
  section,
  sectionIndex,
  gridState,
  updateCell,
  getPointCalculations,
  isCorrectionApplied = false,
  onToggleCorrection,
  scaleMode = 'point',
  scaleValue,
  onUpdateScaleMode
}: DynamicGridProps) {
  
  const cyclesArray = Array.from({ length: section.cyclesCount }, (_, i) => i);
  const hasGroups = section.points.some(p => p.group);

  return (
    <div className="dynamic-grid-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingRight: '8px' }}>
        <h3 className="grid-section-title" style={{ margin: 0, padding: 0 }}>{section.name}</h3>
        <div className="section-controls" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {onToggleCorrection && section.standard_id && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id={`correction-${sectionIndex}`}
              checked={isCorrectionApplied}
              onChange={(e) => onToggleCorrection(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor={`correction-${sectionIndex}`} style={{ fontSize: '14px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
              Erro Referencial (RBC)
            </label>
          </div>
        )}
          <div className="scale-mode-control" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>Tolerância:</label>
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '4px 8px' }}
              value={scaleMode}
              onChange={(e) => onUpdateScaleMode && onUpdateScaleMode(sectionIndex, e.target.value as 'point' | 'scale', scaleValue)}
            >
              <option value="point">Por Ponto</option>
              <option value="scale">Fundo de Escala</option>
            </select>
            {scaleMode === 'scale' && (
              <input 
                type="number" 
                className="form-input" 
                style={{ width: '100px', padding: '4px 8px' }}
                placeholder="Valor F.E."
                value={scaleValue || ''}
                onChange={(e) => onUpdateScaleMode && onUpdateScaleMode(sectionIndex, 'scale', parseFloat(e.target.value) || undefined)}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="grid-table-wrapper">
        <table className="dynamic-table">
          <thead>
            <tr>
              {hasGroups && <th rowSpan={2}>Grupo/Escala</th>}
              <th rowSpan={2}>Valor Alvo</th>
              {cyclesArray.map(c => (
                <th key={c} colSpan={section.columns.length} className="cycle-header">
                  Ciclo {c + 1}
                </th>
              ))}
              <th rowSpan={2}>Média Padrão (VR)</th>
              <th rowSpan={2}>Média Equip.</th>
              <th rowSpan={2}>Desvio</th>
              <th rowSpan={2}>Incerteza (U)</th>
              <th rowSpan={2}>Tolerância (MPE)</th>
              <th rowSpan={2}>Status</th>
            </tr>
            <tr>
              {cyclesArray.flatMap(c => 
                section.columns.map(col => (
                  <th key={`${c}-${col.key}`} className="sub-column-header">
                    {col.label}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {section.points.map((point, pIdx) => {
              const calcs = getPointCalculations(sectionIndex, pIdx) || {
                averageStandard: 0,
                averageEquipment: 0,
                deviation: 0,
                uncertaintyExpanded: 0,
                tolerance: 0,
                status: 'Reprovado'
              };

              return (
                <tr key={pIdx} className={calcs.status === 'Aprovado' ? 'row-approved' : 'row-rejected'}>
                  {hasGroups && <td className="group-cell">{point.group || '-'}</td>}
                  <td className="target-cell">
                    <strong>{point.targetValue}</strong> {point.unit || section.defaultUnit}
                  </td>
                  
                  {/* Inputs para cada ciclo e coluna */}
                  {cyclesArray.flatMap(c =>
                    section.columns.map(col => {
                      const val = gridState[sectionIndex]?.[pIdx]?.[c]?.[col.key] ?? '';
                      return (
                        <td key={`${c}-${col.key}`} className={`input-cell ${col.key === 'standard' ? 'standard-col' : ''}`}>
                          <GridInput
                            value={val}
                            onChange={(newVal) => updateCell(sectionIndex, pIdx, c, col.key, newVal)}
                          />
                        </td>
                      );
                    })
                  )}

                  {/* Resultados */}
                  <td className="result-cell">{calcs.averageStandard}</td>
                  <td className="result-cell">{calcs.averageEquipment}</td>
                  <td className="result-cell font-bold">{calcs.deviation}</td>
                  <td className="result-cell">{calcs.uncertaintyExpanded ?? 0}</td>
                  <td className="result-cell">±{calcs.tolerance}</td>
                  <td className="status-cell">
                    <span className={`status-badge ${calcs.status.toLowerCase()}`}>
                      {calcs.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
