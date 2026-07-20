export interface ICycle {
  standardValue: number;
  equipmentValue: number;
}

export interface ICalibrationPoint {
  targetValue: number;
  unit: string;
  cycles: ICycle[];
}

export interface ICalibrationTemplate {
  id: string;
  equipmentType: string; // Ex: 'MEGOHMMETER'
  points: ICalibrationPoint[];
}

export interface IPointResult extends ICalibrationPoint {
  averageStandard: number;
  averageEquipment: number;
  deviation: number;
  tolerance: number;
  status: 'Aprovado' | 'Reprovado';
}

export interface ICalibrationRecord {
  id: string;
  templateId: string;
  instrumentId: string;
  date: string;
  results: IPointResult[];
  overallStatus: 'Aprovado' | 'Reprovado';
}

export interface ICalibrationRepository {
  save(record: ICalibrationRecord): Promise<void>;
}
