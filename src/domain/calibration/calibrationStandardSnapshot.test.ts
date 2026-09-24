import { describe, expect, it } from 'vitest';
import { createCalibrationStandardSnapshot } from './calibrationStandardSnapshot';

describe('createCalibrationStandardSnapshot', () => {
  it('preserva a URL do certificado no snapshot historico do padrao', () => {
    const snapshot = createCalibrationStandardSnapshot({
      id: 8,
      code: 'PA-001',
      name: 'Padrao de resistencia',
      certificate_number: 'CERT-123',
      certificate_url: 'https://certificados.example.test/CERT-123',
    });

    expect(snapshot).toEqual({
      id: 8,
      code: 'PA-001',
      name: 'Padrao de resistencia',
      certificate_number: 'CERT-123',
      certificate_url: 'https://certificados.example.test/CERT-123',
    });
  });
});
