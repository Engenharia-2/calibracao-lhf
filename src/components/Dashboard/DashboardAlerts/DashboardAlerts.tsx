import './DashboardAlerts.css';

interface ExpiringStandard {
  id: number;
  code: string;
  name: string;
  certificate_number: string;
  validity_date: string;
}

interface ExpiringEquipment {
  id: number;
  name: string;
  ns: string;
  op: string;
  last_calibration: string | null;
}

interface DashboardAlertsProps {
  expiringStandards: ExpiringStandard[];
  expiringEquipments: ExpiringEquipment[];
}

export function DashboardAlerts({ expiringStandards, expiringEquipments }: DashboardAlertsProps) {
  const now = new Date();

  const isExpired = (dateStr: string) => {
    const validity = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return validity < today;
  };

  return (
    <div className="details-panel glass-card">
      <h3 className="panel-title">Alertas de Validade (Vencidos / Próximos)</h3>
      <div className="alerts-container">
        {/* Vencimentos de Padrões */}
        <div className="alert-section">
          <h4 className="alert-section-title">Padrões de Referência</h4>
          {expiringStandards.length === 0 ? (
            <div className="empty-alert-msg">✓ Todos os padrões com validade em dia.</div>
          ) : (
            <div className="alerts-list">
              {expiringStandards.map(std => {
                const expired = isExpired(std.validity_date);
                return (
                  <div key={std.id} className={`alert-item ${expired ? 'expired' : 'warning'}`}>
                    <div className="alert-meta">
                      <strong>{std.code}</strong> - {std.name}
                    </div>
                    <div className="alert-badge-row">
                      <span className="alert-date">Vence: {new Date(std.validity_date).toLocaleDateString('pt-BR')}</span>
                      <span className="alert-tag">{expired ? 'Vencido' : 'Expira breve'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vencimentos de Equipamentos */}
        <div className="alert-section" style={{ marginTop: '24px' }}>
          <h4 className="alert-section-title">Equipamentos a Calibrar</h4>
          {expiringEquipments.length === 0 ? (
            <div className="empty-alert-msg">✓ Todos os equipamentos ativos calibrados recentemente.</div>
          ) : (
            <div className="alerts-list">
              {expiringEquipments.map(eq => {
                const noCal = !eq.last_calibration;
                const expired = eq.last_calibration 
                  ? new Date(eq.last_calibration) < new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
                  : true;
                return (
                  <div key={eq.id} className={`alert-item ${expired ? 'expired' : 'warning'}`}>
                    <div className="alert-meta">
                      <strong>NS: {eq.ns}</strong> | OP: {eq.op} | {eq.name}
                    </div>
                    <div className="alert-badge-row">
                      <span className="alert-date">
                        Última Calibração: {noCal ? 'Nunca Realizada' : new Date(eq.last_calibration!).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="alert-tag">{noCal ? 'Pendente' : expired ? 'Vencido' : 'Expira breve'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
