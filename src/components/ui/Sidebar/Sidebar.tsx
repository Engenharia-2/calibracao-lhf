import { useState } from 'react';
import { 
  ChevronLeft, 
  Menu, 
  Users, 
  ServerPlus, 
  ZodiacLibra, 
  FileText, 
  SquareChartGantt 
} from 'lucide-react';
import './Sidebar.css';
import logoLhf from '../../../assets/logo-lhf.png';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const navItems = [
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'equipamentos', label: 'Equipamentos', icon: ServerPlus },
    { id: 'calibracao', label: 'Calibração', icon: ZodiacLibra },
    { id: 'formularios', label: 'Formulários', icon: FileText },
    { id: 'padroes', label: 'Padrões', icon: SquareChartGantt },
  ];

  return (
    <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <img src={logoLhf} alt="LHF Calibrações" className="sidebar-logo-img" />
          </div>
        )}
        <button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <Menu size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <IconComponent className="nav-icon" size={20} />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
