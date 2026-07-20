import { IEquipment } from '../../services/equipments/ApiEquipmentsRepository';
import { useCalibrationWorkspace } from '../../hooks/useCalibrationWorkspace';
import { DynamicGrid } from '../../components/Calibration/DynamicGrid/DynamicGrid';
import { Button } from '../../components/ui/Button/Button';
import { UserData } from '../../App';
import './CalibrationWorkspace.css';

interface CalibrationWorkspaceProps {
  currentUser?: UserData | null;
  equipment: IEquipment;
  onBack: () => void;
}

export function CalibrationWorkspace({ currentUser, equipment, onBack }: CalibrationWorkspaceProps) {
  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    templateDetail,
    operator,
    setOperator,
    temperature,
    setTemperature,
    humidity,
    setHumidity,
    mainsVoltage,
    setMainsVoltage,
    gridState,
    updateCell,
    getPointCalculations,
    handleSave,
    isLoading,
    error
  } = useCalibrationWorkspace({ currentUser, equipment, onSuccess: onBack });

  const struct = templateDetail
    ? typeof templateDetail.structure === 'string'
      ? JSON.parse(templateDetail.structure)
      : templateDetail.structure
    : [];

  return (
    <div className="calibration-workspace-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Executar Calibração de Equipamento</h2>
          <p>Insira as leituras coletadas na bancada para calcular os desvios automaticamente.</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Cancelar / Voltar
        </Button>
      </div>

      <div className="workspace-main">
        {/* Info do Equipamento */}
        <div className="workspace-card equipment-details-banner">
          <h3>Equipamento em Teste</h3>
          <div className="details-grid">
            <div><strong>Nome:</strong> {equipment.name}</div>
            <div><strong>Número de Série (NS):</strong> {equipment.ns}</div>
            <div><strong>Ordem de Produção (OP):</strong> {equipment.op}</div>
          </div>
        </div>

        {/* Escolha do Formulário */}
        <div className="workspace-card select-form-card">
          <h3>Selecione o Modelo de Formulário</h3>
          <div className="form-group">
            <label htmlFor="templateSelect">Formulário de Calibração</label>
            <select
              id="templateSelect"
              className="form-input"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">-- Selecione o Formulário --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.id}] {t.name} (Tolerância: ±{t.tolerance}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTemplateId && templateDetail && (
          <form onSubmit={handleSave} className="calibration-run-form">
            {/* Dados Ambientais */}
            <div className="workspace-card environmental-card">
              <h3>Condições Ambientais e Operador</h3>
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="operator">Operador / Técnico</label>
                  <input
                    id="operator"
                    type="text"
                    className="form-input"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="Nome do técnico"
                    required
                  />
                </div>
                <div className="form-group size-small">
                  <label htmlFor="temp">Temperatura (°C)</label>
                  <input
                    id="temp"
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="23.5"
                    required
                  />
                </div>
                <div className="form-group size-small">
                  <label htmlFor="humidity">Umidade (%)</label>
                  <input
                    id="humidity"
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    placeholder="55"
                    required
                  />
                </div>
                {templateDetail.equipment_type === 'HIPOT' && (
                  <div className="form-group size-small">
                    <label htmlFor="mains">Rede (VCA)</label>
                    <input
                      id="mains"
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={mainsVoltage}
                      onChange={(e) => setMainsVoltage(e.target.value)}
                      placeholder="220"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Grades de medição */}
            <div className="grids-container">
              {struct.map((section: any, sIdx: number) => (
                <DynamicGrid
                  key={sIdx}
                  section={section}
                  sectionIndex={sIdx}
                  gridState={gridState}
                  updateCell={updateCell}
                  getPointCalculations={getPointCalculations}
                />
              ))}
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={onBack} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" variant="danger" disabled={isLoading}>
                {isLoading ? 'Salvando Leituras...' : 'Calcular e Salvar Calibração'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
