import { ICalibrationTemplate, ITemplateSection, ITemplatePoint } from '../../services/templates/ApiTemplatesRepository';
import { IReferenceStandard, IStandardPoint } from '../../services/standards/ApiStandardsRepository';

export const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === '') return NaN;
  const normalized = String(val).replace(',', '.');
  return parseFloat(normalized);
};

export const round = (val: number, dec: number) => {
  const f = Math.pow(10, dec);
  return Math.round((val + Number.EPSILON) * f) / f;
};


export const matchStandardPoint = (
  parsedPoints: IStandardPoint[],
  point: ITemplatePoint,
  defaultUnit: string
): IStandardPoint | null => {
  return parsedPoints.find(p => {
    // 1. Prioridade Máxima: ID Forte ou Key
    if (point.isLinkedToStandard && point.standardPointKey) {
      const keyMatch = p.id === point.standardPointKey ||
                       `${p.sectionName}_${p.nominalValue}_${p.unit}` === point.standardPointKey ||
                       `pt_${p.nominalValue}_${p.unit}` === point.standardPointKey;
      if (keyMatch) return true;
    }
    
    // 2. Fallback Seguro: Match Rigoroso (Valor + Unidade)
    const isValueEqual = Math.abs(p.nominalValue - point.targetValue) < 0.0001;
    const pUnit = (p.unit || '').trim().toLowerCase();
    const ptUnit = (point.unit || defaultUnit || '').trim().toLowerCase();
    
    return isValueEqual && pUnit === ptUnit;
  }) || null;
};

// Obter cálculos metrológicos de um ponto específico incorporando Incertezas RBC + Bancada (GUM)
export const calculatePointMetrology = (
  templateDetail: ICalibrationTemplate,
  selectedStandard: IReferenceStandard | null,
  sectionIndex: number,
  pointIndex: number,
  sectionData: any, // Pode tipar melhor com GridState depois
  applyStandardCorrection: boolean = false
) => {
  if (!templateDetail) return null;
  
  const struct = typeof templateDetail.structure === 'string'
    ? JSON.parse(templateDetail.structure)
    : templateDetail.structure;
  const section: ITemplateSection = struct[sectionIndex];
  const point = section.points[pointIndex];

  if (!sectionData || !point) {
    return { averageStandard: 0, averageEquipment: 0, deviation: 0, uncertaintyExpanded: 0, tolerance: 0, status: 'Reprovado' as const };
  }

  // Busca o ponto RBC correspondente no Padrão selecionado
  let rbcPoint: IStandardPoint | null = null;
  if (selectedStandard) {
    let parsedPoints: IStandardPoint[] = [];
    if (typeof selectedStandard.points === 'string') {
      try { parsedPoints = JSON.parse(selectedStandard.points); } catch(e) {}
    } else if (Array.isArray(selectedStandard.points)) {
      parsedPoints = selectedStandard.points;
    }
    rbcPoint = matchStandardPoint(parsedPoints, point as ITemplatePoint, section.defaultUnit);
  }

  const stdValues: number[] = [];
  const eqValues: number[] = [];

  for (let c = 0; c < section.cyclesCount; c++) {
    const cycleData = sectionData[c] || {};
    let stdVal = parseNumber(cycleData['standard']);
    
    // Se o checkbox "Aplicar correção do padrão" estiver marcado e houver ponto RBC correspondente
    if (applyStandardCorrection && rbcPoint && !isNaN(stdVal)) {
      const correction = rbcPoint.nominalValue - rbcPoint.referenceValue;
      stdVal = stdVal + correction;
    }

    if (!isNaN(stdVal)) stdValues.push(stdVal);

    // Procurar valores do equipamento (qualquer coluna que não seja 'standard')
    const eqKeys = section.columns.filter((col: any) => col.key !== 'standard').map((col: any) => col.key);
    
    if (eqKeys.length === 1) {
      const eqVal = parseNumber(cycleData[eqKeys[0]]);
      if (!isNaN(eqVal)) eqValues.push(eqVal);
    } else {
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

  const referenceValue = rbcPoint ? rbcPoint.referenceValue : (stdValues.length ? stdValues.reduce((a,b)=>a+b,0)/stdValues.length : point.targetValue);
  const averageStandard = referenceValue;
  const averageEquipment = eqValues.length ? eqValues.reduce((a,b)=>a+b,0)/eqValues.length : 0;
  const deviation = averageEquipment - averageStandard;

  // 1. Incerteza de Repetibilidade (u_rep)
  let u_rep = 0;
  if (eqValues.length > 1) {
    const mean = averageEquipment;
    const variance = eqValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (eqValues.length - 1);
    u_rep = Math.sqrt(variance);
  }

  // 2. Incerteza do Certificado Externa (u_cert = U_ext / k)
  const U_ext = rbcPoint ? rbcPoint.uncertaintyExpanded : 0;
  const k_ext = rbcPoint ? (rbcPoint.kFactor || 2) : 2;
  const u_cert = U_ext / k_ext;

  // 3. Incerteza de Resolução (u_res = Resolução / sqrt(3))
  const resolution = rbcPoint ? (rbcPoint.resolution || 0.01) : 0.01;
  const u_res = resolution / Math.sqrt(3);

  // 4. Incerteza Combinada (u_c) e Expandida (U)
  const u_c = Math.sqrt(Math.pow(u_rep, 2) + Math.pow(u_cert, 2) + Math.pow(u_res, 2));
  const u_expanded = round(u_c * 2, 6);

  // 5. Tolerância Permetida MPE e Aprovação (|Desvio| + U <= MPE)
  const tolerance = round(Math.abs(averageStandard) * (templateDetail.tolerance / 100), 6);
  const status = (Math.abs(deviation) + u_expanded) <= tolerance ? 'Aprovado' : 'Reprovado';

  return {
    averageStandard: round(averageStandard, 6),
    averageEquipment: round(averageEquipment, 6),
    deviation: round(deviation, 6),
    uncertaintyExpanded: u_expanded,
    tolerance,
    status
  };
};
