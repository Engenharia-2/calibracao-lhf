import { useState, useEffect } from 'react';
import { IEquipment } from '../../services/equipments/ApiEquipmentsRepository';
import { CalibrationWorkspace } from './CalibrationWorkspace';
import { UserData } from '../../App';
import './Calibration.css';

interface CalibrationProps {
  currentUser?: UserData | null;
  preselectedEquipment: IEquipment | null;
  onClearPreselected: () => void;
}

export function Calibration({ currentUser, preselectedEquipment, onClearPreselected }: CalibrationProps) {
  const [equipments, setEquipments] = useState<IEquipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<IEquipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega todos os equipamentos cadastrados
  useEffect(() => {
    const fetchEquipments = async () => {
      setIsLoading(true);
      try {
        const list = await window.electron.getEquipments();
        setEquipments(list);
      } catch (err) {
        console.error('Erro ao buscar equipamentos:', err);
        setError('Erro ao carregar a lista de equipamentos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipments();
  }, []);

  // Preencher caso venha redirecionado da lista de equipamentos
  useEffect(() => {
    if (preselectedEquipment) {
      setSelectedEquipment(preselectedEquipment);
    }
  }, [preselectedEquipment]);

  const handleBack = () => {
    setSelectedEquipment(null);
    onClearPreselected();
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const eq = equipments.find(x => x.id === id) || null;
    setSelectedEquipment(eq);
  };

  if (selectedEquipment) {
    return (
      <CalibrationWorkspace 
        currentUser={currentUser}
        equipment={selectedEquipment} 
        onBack={handleBack} 
      />
    );
  }

  return (
    <div className="calibration-select-page">
      <div className="page-header">
        <div>
          <h2>Execução de Calibrações</h2>
          <p>Selecione um equipamento cadastrado abaixo para iniciar o formulário de bancada.</p>
        </div>
      </div>

      <div className="workspace-main">
        <div className="workspace-card select-equipment-card">
          <h3>Equipamento para Teste</h3>
          
          {isLoading ? (
            <div className="loading-state">Carregando equipamentos...</div>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : equipments.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum equipamento cadastrado</h3>
              <p>Por favor, adicione um equipamento na aba "Equipamentos" antes de prosseguir.</p>
            </div>
          ) : (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="equipmentSelect" style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Selecione o Equipamento
              </label>
              <select
                id="equipmentSelect"
                className="form-input"
                value=""
                onChange={handleEquipmentChange}
                style={{ width: '100%', padding: '10px', fontSize: '15px' }}
              >
                <option value="">-- Clique para escolher --</option>
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} (NS: {eq.ns} | OP: {eq.op})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
