import './ReadonlyCalibrationGrid.css';

export interface ReadonlyPoint {
  group: string | null;
  targetValue: number;
  unit: string;
  cycles: Array<{ [columnKey: string]: string | number }>;
  averageStandard: number;
  averageEquipment: number;
  deviation: number;
  uncertaintyExpanded?: number;
  tolerance: number;
  status: 'Aprovado' | 'Reprovado';
}

export interface ReadonlySection {
  sectionName: string;
  points: ReadonlyPoint[];
}

interface ReadonlyCalibrationGridProps {
  section: ReadonlySection;
}

export function ReadonlyCalibrationGrid({ section }: ReadonlyCalibrationGridProps) {
  if (!section.points || section.points.length === 0) return null;

  // Deduzir colunas e ciclos a partir do primeiro ponto salvo
  const firstPoint = section.points[0];
  const cyclesCount = firstPoint.cycles.length;
  const cyclesArray = Array.from({ length: cyclesCount }, (_, i) => i);
  
  // Encontrar todas as chaves de colunas no ciclo do primeiro ponto (e colocar 'standard' primeiro se houver)
  const allKeys = Object.keys(firstPoint.cycles[0] || {});
  const columnKeys = allKeys.includes('standard')
    ? ['standard', ...allKeys.filter(k => k !== 'standard')]
    : allKeys;

  const hasGroups = section.points.some(p => p.group);

  const getColumnLabel = (key: string) => {
    switch (key) {
      case 'standard': return 'Padrão';
      case 'equipment': return 'Equipamento';
      case 'panel': return 'Painel';
      case 'set_1kv': return 'Conjunto (1 kV)';
      case 'set_5kv': return 'Conjunto (5 kV)';
      default: return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  return (
    <div className="readonly-grid-card">
      <h4 className="grid-section-title">{section.sectionName}</h4>
      
      <div className="grid-table-wrapper">
        <table className="dynamic-table">
          <thead>
            <tr>
              {hasGroups && <th rowSpan={2}>Grupo/Escala</th>}
              <th rowSpan={2}>Valor Alvo</th>
              {cyclesArray.map(c => (
                <th key={c} colSpan={columnKeys.length} className="cycle-header">
                  Ciclo {c + 1}
                </th>
              ))}
              <th rowSpan={2}>Média Padrão</th>
              <th rowSpan={2}>Média Equip.</th>
              <th rowSpan={2}>Desvio</th>
              <th rowSpan={2}>Incerteza (U)</th>
              <th rowSpan={2}>Tolerância</th>
              <th rowSpan={2}>Status</th>
            </tr>
            <tr>
              {cyclesArray.flatMap(c => 
                columnKeys.map(key => (
                  <th key={`${c}-${key}`} className="sub-column-header">
                    {getColumnLabel(key)}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {section.points.map((point, pIdx) => (
              <tr key={pIdx} className={point.status === 'Aprovado' ? 'row-approved' : 'row-rejected'}>
                {hasGroups && <td className="group-cell">{point.group || '-'}</td>}
                <td className="target-cell">
                  <strong>{point.targetValue}</strong> {point.unit}
                </td>
                
                {/* Leituras salvas exibidas como texto estático (somente-leitura) */}
                {cyclesArray.flatMap(c =>
                  columnKeys.map(key => {
                    const val = point.cycles[c]?.[key] ?? '-';
                    return (
                      <td key={`${c}-${key}`} className="readonly-cell">
                        {val}
                      </td>
                    );
                  })
                )}

                {/* Resultados */}
                <td className="result-cell">{point.averageStandard}</td>
                <td className="result-cell">{point.averageEquipment}</td>
                <td className="result-cell font-bold">{point.deviation}</td>
                <td className="result-cell">{point.uncertaintyExpanded !== undefined ? point.uncertaintyExpanded : '-'}</td>
                <td className="result-cell">±{point.tolerance}</td>
                <td className="status-cell">
                  <span className={`status-badge ${point.status.toLowerCase()}`}>
                    {point.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
