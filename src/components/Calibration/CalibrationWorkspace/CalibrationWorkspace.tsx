import { IEquipment } from '../../../services/equipments/ApiEquipmentsRepository';
import { useCalibrationWorkspace } from '../../../hooks/useCalibrationWorkspace';
import { DynamicGrid } from '../DynamicGrid/DynamicGrid';
import { Button } from '../../ui/Button/Button';
import { PageHeader } from '../../ui/PageHeader/PageHeader';
import { UserData } from '../../../App';
import { EquipmentInfo } from '../../Equipment/EquipmentInfo/EquipmentInfo';
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
    operatorRef,
    temperatureRef,
    humidityRef,
    mainsVoltageRef,
    gridState,
    updateCell,
    getPointCalculations,
    handleSave,
    isLoading,
    error,
    clients,
    selectedClientId,
    setSelectedClientId,
    applyStandardCorrection,
    setApplyStandardCorrection
  } = useCalibrationWorkspace({ currentUser, equipment, onSuccess: onBack });

  const struct = templateDetail
    ? typeof templateDetail.structure === 'string'
      ? JSON.parse(templateDetail.structure)
      : templateDetail.structure
    : [];

  return (
    <div className="calibration-workspace-page">
      <div className="workspace-header">
        <PageHeader 
        action={
          <Button variant="secondary" onClick={onBack}>
            Voltar  
          </Button>
          }
        />
      </div>

      <div className="workspace-main">
        {/* Header do Equipamento selecionado */}
        <EquipmentInfo equipment={equipment} />

        {/* Formulário Interativo de Calibração */}
        <div className="workspace-card select-form-card">
          <h3>Selecione o Modelo de Formulário</h3>
          <div className="form-group-row">
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

          <div className="correction-banner">
            <div className="correction-banner-row">
              <input
                type="checkbox"
                id="applyCorrection"
                className="correction-checkbox"
                checked={applyStandardCorrection}
                onChange={(e) => setApplyStandardCorrection(e.target.checked)}
              />
              <label htmlFor="applyCorrection" className="correction-label">
                Aplicar Correção dos Padrões RBC (Compensar erros do certificado nas leituras)
              </label>
            </div>
          </div>
        </div>

        {selectedTemplateId && templateDetail && (
          <form onSubmit={handleSave} className="calibration-run-form">
            {/* Dados Ambientais */}
            <div className="workspace-card environmental-card">
              <h3>Condições Ambientais e Operador</h3>
              <div className="form-group-row environmental-row">
                <div className="form-group">
                  <label htmlFor="clientSelect">Cliente do Certificado</label>
                  <select
                    id="clientSelect"
                    className="form-input"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">-- LHF (Uso Interno) --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company} ({c.cnpj})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="operator">Operador / Técnico</label>
                  <input
                    id="operator"
                    type="text"
                    className="form-input"
                    ref={operatorRef}
                    defaultValue={currentUser?.name || ''}
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
                    ref={temperatureRef}
                    defaultValue=""
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
                    ref={humidityRef}
                    defaultValue=""
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
                      ref={mainsVoltageRef}
                      defaultValue=""
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
