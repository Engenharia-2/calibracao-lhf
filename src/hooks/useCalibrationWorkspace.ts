import { useState, useEffect } from 'react';
import { IEquipment } from '../services/equipments/ApiEquipmentsRepository';
import { ICalibrationTemplate, ITemplateSection } from '../services/templates/ApiTemplatesRepository';
import { UserData } from '../App';

interface UseCalibrationWorkspaceProps {
  currentUser?: UserData | null;
  equipment: IEquipment;
  onSuccess?: () => void;
}

const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === '') return NaN;
  const normalized = String(val).replace(',', '.');
  return parseFloat(normalized);
};

export interface GridState {
  [sectionIndex: number]: {
    [pointIndex: number]: {
      [cycleIndex: number]: {
        [columnKey: string]: string | number;
      }
    }
  }
}

export function useCalibrationWorkspace({ currentUser, equipment, onSuccess }: UseCalibrationWorkspaceProps) {
  const [templates, setTemplates] = useState<ICalibrationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateDetail, setTemplateDetail] = useState<ICalibrationTemplate | null>(null);
  
  // Dados ambientais: pré-preenche o operador com o nome do usuário logado
  const [operator, setOperator] = useState(currentUser?.name || '');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [mainsVoltage, setMainsVoltage] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Sincroniza o operador se o usuário estiver disponível
  useEffect(() => {
    if (currentUser?.name && !operator) {
      setOperator(currentUser.name);
    }
  }, [currentUser]);

  const [gridState, setGridState] = useState<GridState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar todos os templates para o dropdown
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        if (typeof (window as any).electron?.getTemplates === 'function') {
          const list = await (window as any).electron.getTemplates();
          setTemplates(list);
          
          // Pré-selecionar template correspondente ao equipamento se houver match no nome
          const matched = list.find((t: any) => 
            equipment.name.toLowerCase().includes(t.name.toLowerCase()) ||
            t.name.toLowerCase().includes(equipment.name.toLowerCase())
          );
          if (matched) {
            setSelectedTemplateId(matched.id);
          }
        }
      } catch (err) {
        console.error('Erro ao listar templates para calibração:', err);
      }
    };
    fetchTemplates();
  }, [equipment]);

  // Carregar detalhes do template selecionado e inicializar grid
  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateDetail(null);
      setGridState({});
      return;
    }

    const loadTemplateDetail = async () => {
      setIsLoading(true);
      try {
        if (typeof (window as any).electron?.getTemplateById === 'function') {
          const detail = await (window as any).electron.getTemplateById(selectedTemplateId);
          setTemplateDetail(detail);

          // Inicializar estrutura do grid
          const initialGrid: GridState = {};
          const struct = typeof detail.structure === 'string'
            ? JSON.parse(detail.structure)
            : detail.structure;

          (struct || []).forEach((section: ITemplateSection, sIdx: number) => {
            initialGrid[sIdx] = {};
            section.points.forEach((point, pIdx) => {
              initialGrid[sIdx][pIdx] = {};
              for (let c = 0; c < section.cyclesCount; c++) {
                initialGrid[sIdx][pIdx][c] = {};
                section.columns.forEach(col => {
                  // Pré-preenche o Padrão com o valor alvo (targetValue) para facilitar
                  if (col.key === 'standard') {
                    initialGrid[sIdx][pIdx][c][col.key] = point.targetValue;
                  } else {
                    initialGrid[sIdx][pIdx][c][col.key] = '';
                  }
                });
              }
            });
          });

          setGridState(initialGrid);
          setStartedAt(new Date().toISOString()); // Registra o início da calibração na bancada
        }
      } catch (err) {
        console.error('Erro ao carregar estrutura do template:', err);
        setError('Não foi possível carregar os detalhes do formulário.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplateDetail();
  }, [selectedTemplateId]);

  // Atualizar célula do grid
  const updateCell = (
    sectionIndex: number,
    pointIndex: number,
    cycleIndex: number,
    columnKey: string,
    value: string
  ) => {
    setGridState(prev => {
      const next = { ...prev };
      if (!next[sectionIndex]) next[sectionIndex] = {};
      if (!next[sectionIndex][pointIndex]) next[sectionIndex][pointIndex] = {};
      if (!next[sectionIndex][pointIndex][cycleIndex]) next[sectionIndex][pointIndex][cycleIndex] = {};
      
      next[sectionIndex][pointIndex][cycleIndex] = {
        ...next[sectionIndex][pointIndex][cycleIndex],
        [columnKey]: value
      };
      
      return next;
    });
  };

  const round = (val: number, dec: number) => {
    const f = Math.pow(10, dec);
    return Math.round((val + Number.EPSILON) * f) / f;
  };

  // Obter cálculos metrológicos de um ponto específico
  const getPointCalculations = (sectionIndex: number, pointIndex: number) => {
    if (!templateDetail) return null;
    
    const struct = typeof templateDetail!.structure === 'string'
      ? JSON.parse(templateDetail!.structure)
      : templateDetail!.structure;
    const section = struct[sectionIndex];
    const sectionData = gridState[sectionIndex]?.[pointIndex];

    if (!sectionData) {
      return { averageStandard: 0, averageEquipment: 0, deviation: 0, tolerance: 0, status: 'Reprovado' as const };
    }

    const stdValues: number[] = [];
    const eqValues: number[] = [];

    for (let c = 0; c < section.cyclesCount; c++) {
      const cycleData = sectionData[c] || {};
      const stdVal = parseNumber(cycleData['standard']);
      if (!isNaN(stdVal)) stdValues.push(stdVal);

      // Procurar valores do equipamento (qualquer coluna que não seja 'standard')
      const eqKeys = section.columns.filter((col: any) => col.key !== 'standard').map((col: any) => col.key);
      
      if (eqKeys.length === 1) {
        const eqVal = parseNumber(cycleData[eqKeys[0]]);
        if (!isNaN(eqVal)) eqValues.push(eqVal);
      } else {
        // Múltiplas colunas (ex: set_1kv, set_5kv). Pegar o primeiro valor numérico válido digitado no ciclo
        let foundVal = NaN;
        for (const key of eqKeys) {
          const val = parseNumber(cycleData[key]);
          if (!isNaN(val) && String(cycleData[key]) !== '-') {
            foundVal = val;
            break;
          }
        }
        if (!isNaN(foundVal)) eqValues.push(foundVal);
      }
    }

    const averageStandard = stdValues.length ? stdValues.reduce((a,b)=>a+b,0)/stdValues.length : 0;
    const averageEquipment = eqValues.length ? eqValues.reduce((a,b)=>a+b,0)/eqValues.length : 0;

    const deviation = round(averageEquipment - averageStandard, 4);
    const tolerance = round(Math.abs(averageStandard) * (templateDetail.tolerance / 100), 4);
    const status = Math.abs(deviation) <= tolerance ? 'Aprovado' : 'Reprovado';

    return {
      averageStandard: round(averageStandard, 4),
      averageEquipment: round(averageEquipment, 4),
      deviation,
      tolerance,
      status
    };
  };

  // Submeter a calibração finalizada
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTemplateId || !operator || !temperature || !humidity) {
      setError('Por favor, preencha o Operador e as Condições Ambientais.');
      return;
    }

    setIsLoading(true);

    try {
      const struct = typeof templateDetail!.structure === 'string'
        ? JSON.parse(templateDetail!.structure)
        : templateDetail!.structure;

      // Montar os resultados calculados de todas as seções e pontos
      let overallStatus = 'Aprovado';
      const resultsBySection = (struct || []).map((section: ITemplateSection, sIdx: number) => {
        const pointsResults = section.points.map((point, pIdx) => {
          const calcs = getPointCalculations(sIdx, pIdx);
          if (calcs && calcs.status === 'Reprovado') {
            overallStatus = 'Reprovado';
          }
          
          // Mapear os ciclos preenchidos
          const cyclesData = [];
          for (let c = 0; c < section.cyclesCount; c++) {
            cyclesData.push(gridState[sIdx]?.[pIdx]?.[c] || {});
          }

          return {
            group: point.group,
            targetValue: point.targetValue,
            unit: point.unit || section.defaultUnit,
            cycles: cyclesData,
            ...calcs
          };
        });

        return {
          sectionName: section.name,
          points: pointsResults
        };
      });

      const calibrationRecord = {
        equipmentId: equipment.id,
        templateId: selectedTemplateId,
        operator,
        temperature: parseNumber(temperature),
        humidity: parseNumber(humidity),
        mainsVoltage: mainsVoltage ? parseNumber(mainsVoltage) : null,
        readings: resultsBySection,
        overallStatus,
        startedAt: startedAt || new Date().toISOString()
      };

      if (typeof (window as any).electron?.saveCalibration === 'function') {
        await (window as any).electron.saveCalibration(calibrationRecord);
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Electron saveCalibration function not available');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao salvar o registro de calibração.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
