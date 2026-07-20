import { useState, useRef } from 'react';
import './MegometerForm.css';

// Pontos de teste de exemplo para o megômetro
const TEST_POINTS = [
  '100 kΩ',
  '1 MΩ',
  '10 MΩ',
  '100 MΩ',
  '1 GΩ'
];

export function MegometerForm() {
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(formRef.current);
    const data: Record<string, string | number> = {};
    
    formData.forEach((value, key) => {
      // Converter para número, mantendo string vazia se não preenchido
      data[key] = value ? Number(value) : '';
    });

    try {
      // Usando cast para any para evitar erros de tipagem caso o preload não esteja tipado
      const electron = (window as any).electron;
      if (electron?.saveCalibration) {
        await electron.saveCalibration({
          module: 'Megometer 5kV',
          timestamp: new Date().toISOString(),
          data
        });
        setStatus({ type: 'success', message: 'Calibração salva com sucesso!' });
        formRef.current.reset(); // Opcional: limpar form após salvar
      } else {
        console.warn('Electron IPC não encontrado. Simulando salvamento...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Dados simulados:', data);
        setStatus({ type: 'success', message: 'Modo Web: Dados salvos localmente (simulado).' });
      }
    } catch (err) {
      console.error('Erro ao salvar calibração:', err);
      setStatus({ type: 'error', message: 'Erro ao salvar os dados. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="megometer-form-container">
      <h2>Calibração: Megômetro 5kV</h2>
      
      {status && (
        <div className={`status-message status-${status.type}`}>
          {status.message}
        </div>
      )}

      {/* Usando form não-controlado para performance com muitos inputs */}
      <form ref={formRef} onSubmit={handleSubmit} className="form-grid">
        {TEST_POINTS.map((point, pointIndex) => (
          <div key={`point-${pointIndex}`} className="test-point-section">
            <div className="test-point-title">Ponto de Teste: {point}</div>
            
            <div className="cycles-grid">
              {[1, 2, 3].map(cycle => (
                <div key={`cycle-${cycle}`} className="cycle-column">
                  <div className="cycle-title">Ciclo {cycle}</div>
                  
                  <div className="input-group">
                    <label htmlFor={`pt_${pointIndex}_c${cycle}_padrao`}>Padrão</label>
                    <input 
                      type="number" 
                      id={`pt_${pointIndex}_c${cycle}_padrao`}
                      name={`pt_${pointIndex}_c${cycle}_padrao`}
                      step="any"
                      placeholder="Valor"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor={`pt_${pointIndex}_c${cycle}_equip`}>Equipamento</label>
                    <input 
                      type="number" 
                      id={`pt_${pointIndex}_c${cycle}_equip`}
                      name={`pt_${pointIndex}_c${cycle}_equip`}
                      step="any"
                      placeholder="Valor"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Calcular e Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
