export interface CalibrationStandardSource {
  id?: number;
  code: string;
  name: string;
  certificate_number: string;
  certificate_url?: string | null;
}

export interface CalibrationStandardSnapshot {
  id?: number;
  code: string;
  name: string;
  certificate_number: string;
  certificate_url: string | null;
}

export function createCalibrationStandardSnapshot(
  standard: CalibrationStandardSource,
): CalibrationStandardSnapshot {
  return {
    id: standard.id,
    code: standard.code,
    name: standard.name,
    certificate_number: standard.certificate_number,
    certificate_url: standard.certificate_url || null,
  };
}
