import { useState } from 'react';
import './Dashboard.css';

export function Dashboard() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Sistema de Calibração LHF</h1>
        <p>Selecione um módulo para iniciar a calibração.</p>
      </div>

      {!activeModule ? (
        <div className="dashboard-menu">
          <div className="menu-card" onClick={() => setActiveModule('megometer')}>
            <h2>Megômetro 5kV</h2>
            <p>Calibração de megômetros até 5kV. Pontos de teste padronizados para medição de resistência de isolação.</p>
            <button className="btn-primary">Iniciar Calibração</button>
          </div>
          {/* Adicione mais cartões de módulo aqui no futuro */}
        </div>
      ) : (
        <div className="dashboard-content">
          <button 
            className="back-button" 
            onClick={() => setActiveModule(null)}
          >
            ← Voltar ao Menu
          </button>
          
          {activeModule === 'megometer' && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <h3>Módulo Megômetro 5kV</h3>
              <p>Por favor, selecione ou crie um equipamento do tipo Megômetro e execute a calibração utilizando a aba "Calibração" no menu lateral.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
