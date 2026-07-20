import type { ICalibrationPoint, IPointResult, ICalibrationRecord } from './types';

export class CalibrationService {
  /**
   * Helper method to calculate average
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return this.round(sum / values.length, 4);
  }

  /**
   * Helper method to handle floating point issues in JS.
   * Rounds the value to the given number of decimal places.
   */
  private round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Evaluates a single calibration point (e.g. 3 cycles) 
   * applying the custom template tolerance percent over the standard value.
   */
  public evaluatePoint(point: ICalibrationPoint, tolerancePercent: number): IPointResult {
    const stdValues = point.cycles.map(c => c.standardValue);
    const eqValues = point.cycles.map(c => c.equipmentValue);

    const averageStandard = this.calculateAverage(stdValues);
    const averageEquipment = this.calculateAverage(eqValues);

    const deviation = this.round(averageEquipment - averageStandard, 4);
    // Erro Máximo Permitido (Tolerância): customizada sobre o valor Padrão
    const tolerance = this.round(Math.abs(averageStandard) * (tolerancePercent / 100), 4);

    const status = Math.abs(deviation) <= tolerance ? 'Aprovado' : 'Reprovado';

    return {
      ...point,
      averageStandard,
      averageEquipment,
      deviation,
      tolerance,
      status
    };
  }

  /**
   * Evaluates a full calibration and creates a record
   */
  public evaluateCalibration(
    templateId: string,
    instrumentId: string,
    points: ICalibrationPoint[],
    tolerancePercent: number
  ): ICalibrationRecord {
    const results = points.map(p => this.evaluatePoint(p, tolerancePercent));
    const overallStatus = results.every(r => r.status === 'Aprovado') ? 'Aprovado' : 'Reprovado';

    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      templateId,
      instrumentId,
      date: new Date().toISOString(),
      results,
      overallStatus
    };
  }
}
