import { useState } from 'react'
import './App.css'
import { Login } from './components/Login/Login'
import { Register } from './components/Login/Register'
import { Templates } from './pages/Templates/Templates'
import { Equipments } from './pages/Equipments/Equipments'
import { Clients } from './pages/Clients/Clients'
import { Calibration } from './pages/Calibration/Calibration'
import { Standards } from './pages/Standards/Standards'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { CalibrationHistory } from './pages/CalibrationHistory/CalibrationHistory'
import { IEquipment } from './services/equipments/ApiEquipmentsRepository'

import { MainLayout } from './components/layout/MainLayout/MainLayout'

export interface UserData {
  name: string;
  email: string;
  signatureUrl?: string | null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [preselectedEquipment, setPreselectedEquipment] = useState<IEquipment | null>(null)

  const handleLoginSuccess = (user?: UserData) => {
    if (user) {
      setCurrentUser(user)
    }
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onSuccess={() => setShowRegister(false)} 
          onBackToLogin={() => setShowRegister(false)} 
        />
      )
    }
    return (
      <Login 
        onSuccess={handleLoginSuccess} 
        onGoToRegister={() => setShowRegister(true)}
      />
    )
  }

  const handleCalibrateRedirect = (eq: IEquipment) => {
    setPreselectedEquipment(eq)
    setActivePage('calibracao')
  }

  return (
    <MainLayout 
      currentUser={currentUser}
      onLogout={handleLogout}
      activePage={activePage}
      onNavigate={(page) => {
        // Limpa o equipamento pré-selecionado se navegar diretamente pelo menu
        if (page !== 'calibracao') {
          setPreselectedEquipment(null)
        }
        setActivePage(page)
      }}
    >
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'formularios' && <Templates />}
      {activePage === 'equipamentos' && <Equipments onCalibrate={handleCalibrateRedirect} />}
      {activePage === 'clientes' && <Clients />}
        {activePage === 'history' && <CalibrationHistory />}
      {activePage === 'padroes' && <Standards />}
      {activePage === 'calibracao' && (
        <Calibration 
          currentUser={currentUser}
          preselectedEquipment={preselectedEquipment} 
          onClearPreselected={() => setPreselectedEquipment(null)} 
        />
      )}
    </MainLayout>
  )
}

export default App
