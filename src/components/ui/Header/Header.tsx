import { useState, useRef, useEffect } from 'react';
import { UserData } from '../../../App';
import './Header.css';

interface HeaderProps {
  currentUser?: UserData | null;
  onLogout: () => void;
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'AD';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return parts[0].toUpperCase();
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userName = currentUser?.name || 'Administrador';
  const userEmail = currentUser?.email || 'admin';
  const userInitials = getInitials(currentUser?.name);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-title">
          <h3>Painel de Controle</h3>
        </div>
        
        <div className="header-actions">
          <div className="header-user-menu-wrapper" ref={userMenuRef}>
            <div 
              className={`header-user-info ${isDropdownOpen ? 'active' : ''}`}
              onClick={toggleDropdown}
              role="button"
              tabIndex={0}
              title="Opções de usuário"
            >
              <div className="user-avatar">{userInitials}</div>
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role">{userEmail}</span>
              </div>
              <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
            </div>

            {isDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-header">
                  <strong>{userName}</strong>
                  <span>{userEmail}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item btn-logout" 
                  onClick={handleLogoutClick}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ marginRight: '8px' }}
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sair da Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
