import './Sidebar.css';
import logoLhf from '../../../assets/logo-lhf.png';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <img src={logoLhf} alt="LHF Calibrações" className="sidebar-logo-img" />
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activePage === 'clientes' ? 'active' : ''}`}
          onClick={() => onNavigate('clientes')}
        >
          Clientes
        </button>
        <button 
          className={`nav-item ${activePage === 'equipamentos' ? 'active' : ''}`}
          onClick={() => onNavigate('equipamentos')}
        >
          Equipamentos
        </button>
        <button 
          className={`nav-item ${activePage === 'calibracao' ? 'active' : ''}`}
          onClick={() => onNavigate('calibracao')}
        >
          Calibração
        </button>
        <button 
          className={`nav-item ${activePage === 'formularios' ? 'active' : ''}`}
          onClick={() => onNavigate('formularios')}
        >
          Formulários
        </button>
      </nav>
    </aside>
  );
}
