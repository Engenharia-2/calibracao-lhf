import './CalibrationStatusChart.css';

interface StatusChartProps {
  approved: number;
  reproved: number;
}

export function CalibrationStatusChart({ approved, reproved }: StatusChartProps) {
  const numApproved = Number(approved || 0);
  const numReproved = Number(reproved || 0);
  const total = numApproved + numReproved;
  const approvedPercent = total > 0 ? Math.round((numApproved / total) * 100) : 0;
  const reprovedPercent = total > 0 ? Math.round((numReproved / total) * 100) : 0;

  const r = 36;
  const circ = 2 * Math.PI * r;
  const approvedOffset = circ - (approvedPercent / 100) * circ;
  
  return (
    <div className="chart-card glass-card">
      <h4 className="chart-title">Status das Calibrações</h4>
      {total === 0 ? (
        <div className="no-chart-data">Nenhum registro no período</div>
      ) : (
        <div className="chart-content">
          <div className="svg-wrapper">
            <svg width="120" height="120" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray={circ}
                strokeDashoffset={approvedOffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="chart-center-label">
              <span className="percent-num">{approvedPercent}%</span>
              <span className="percent-text">Aprovados</span>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-bullet approved-bullet"></span>
              <span className="legend-label">Aprovados: <strong>{numApproved}</strong> ({approvedPercent}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-bullet reproved-bullet"></span>
              <span className="legend-label">Reprovados: <strong>{numReproved}</strong> ({reprovedPercent}%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
