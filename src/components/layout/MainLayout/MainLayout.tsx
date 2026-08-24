import React from 'react';
import { Sidebar } from '../../ui/Sidebar/Sidebar';
import { Header } from '../../ui/Header/Header';
import { UserData } from '../../../App';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  currentUser?: UserData | null;
  onLogout: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export function MainLayout({ children, currentUser, onLogout, activePage, onNavigate }: MainLayoutProps) {
  const pageTitles: Record<string, string> = {
    'dashboard': 'Painel de Controle',
    'formularios': 'Modelos de Formulários de Calibração',
    'equipamentos': 'Gerenciamento de Equipamentos',
    'clientes': 'Gerenciamento de Clientes',
    'padroes': 'Padrões de Referência RBC',
    'calibracao': 'Execução de Calibrações',
  };
  const currentTitle = pageTitles[activePage] || 'Painel de Controle';

  return (
    <div className="main-layout">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="main-content-wrapper">
        <Header currentUser={currentUser} onLogout={onLogout} title={currentTitle} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
