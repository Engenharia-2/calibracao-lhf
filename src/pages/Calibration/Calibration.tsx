import { useState, useEffect } from 'react';
import { IEquipment } from '../../services/equipments/ApiEquipmentsRepository';
import { CalibrationWorkspace } from '../../components/Calibration/CalibrationWorkspace/CalibrationWorkspace';
import { UserData } from '../../App';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import './Calibration.css';

interface CalibrationProps {
  currentUser?: UserData | null;
  preselectedEquipment: IEquipment | null;
  onClearPreselected: () => void;
}

export function Calibration({ currentUser, preselectedEquipment, onClearPreselected }: CalibrationProps) {
  const [equipments, setEquipments] = useState<IEquipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<IEquipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredEquipments = equipments.filter(eq => {
    const term = searchTerm.toLowerCase();
    const typeMatch = eq.equipment_type?.toLowerCase().includes(term) || false;
    const nameMatch = eq.name?.toLowerCase().includes(term) || false;
    const opMatch = eq.op?.toLowerCase().includes(term) || false;
    const nsMatch = eq.ns?.toLowerCase().includes(term) || false;
    return typeMatch || nameMatch || opMatch || nsMatch;
  });

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
      <PageHeader />

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
            <div className="form-group calibration-form-group">
              <input
                id="equipmentSearch"
                type="text"
                className="form-input calibration-search-input"
                placeholder="Busque por tipo, modelo, NS ou OP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <label htmlFor="equipmentSelect" className="calibration-form-label">
                Selecione o Equipamento
              </label>
              <select
                id="equipmentSelect"
                className="form-input calibration-select-input"
                value=""
                onChange={handleEquipmentChange}
              >
                <option value="">-- Clique para escolher --</option>
                {filteredEquipments.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.equipment_type ? `${eq.equipment_type} - ` : ''}{eq.name} (NS: {eq.ns} | OP: {eq.op})
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
