import './CalibrationTrendChart.css';

interface TrendItem {
  month: string;
  count: number;
}

interface TrendChartProps {
  trend: TrendItem[];
}

export function CalibrationTrendChart({ trend }: TrendChartProps) {
  // Configuração SVG
  const width = 600;
  const height = 180;
  const paddingY = 40;
  const paddingX = 40;

  const maxCount = trend.length > 0 ? Math.max(...trend.map(t => t.count), 5) : 5;

  const formatMonth = (monthStr: string) => {
    const parts = monthStr.split('-');
    if (parts.length === 2) {
      return `${parts[1]}/${parts[0].slice(2)}`;
    }
    return monthStr;
  };

  // Coordenadas
  const getCoordinates = () => {
    if (trend.length === 0) return [];
    
    // x range: paddingX to width - paddingX
    // y range: paddingY to height - paddingY
    const xStep = trend.length > 1 ? (width - paddingX * 2) / (trend.length - 1) : 0;
    
    return trend.map((item, index) => {
      // Se tiver só 1 mês, colocar no centro
      const x = trend.length > 1 ? paddingX + index * xStep : width / 2;
      // Invert Y because SVG 0,0 is top-left
      const y = height - paddingY - (item.count / maxCount) * (height - paddingY * 2);
      return { x, y, item };
    });
  };

  const points = getCoordinates();

  // Create path strings
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const polygonPoints = points.length > 0 
    ? `${points[0].x},${height - paddingY} ${polylinePoints} ${points[points.length - 1].x},${height - paddingY}`
    : '';

  return (
    <div className="chart-card glass-card trend-chart-card">
      <h4 className="chart-title">Volume de Calibrações por Mês</h4>
      {trend.length === 0 ? (
        <div className="no-chart-data">Nenhuma calibração realizada</div>
      ) : (
        <div className="line-chart-container">
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="trend-svg">
            {/* Defs para o gradiente da bolsa de valores */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary-blue, #0F398C)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-primary-blue, #0F398C)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Sombreamento da Área */}
            <polygon 
              points={polygonPoints} 
              className="chart-area-fill"
            />
            
            {/* Linha da Tendência */}
            <polyline 
              points={polylinePoints} 
              className="chart-line" 
            />

            {/* Pontos Interativos e Labels Verticais */}
            {points.map((p, i) => (
              <g key={i} className="chart-point-group">
                {/* Linha vertical pontilhada indicando o mês */}
                <line x1={p.x} y1={p.y} x2={p.x} y2={height - paddingY} className="chart-grid-line" />
                
                {/* Ponto / Bolinha */}
                <circle cx={p.x} cy={p.y} r="4" className="chart-point" />
                
                {/* Tooltip Hover (Valor) */}
                <text x={p.x} y={p.y - 12} className="chart-tooltip-text">
                  {p.item.count} calibrações
                </text>

                {/* Eixo X (Meses) */}
                <text x={p.x} y={height - 15} className="chart-axis-label">
                  {formatMonth(p.item.month)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
