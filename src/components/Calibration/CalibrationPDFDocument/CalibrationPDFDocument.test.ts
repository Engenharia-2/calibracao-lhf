import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { describe, expect, it } from 'vitest';
import { CalibrationPDFDocument } from './CalibrationPDFDocument';

describe('CalibrationPDFDocument', () => {
  it('inclui um link para o certificado do padrao registrado na secao', async () => {
    const certificateUrl = 'https://certificados.example.test/CERT-123';
    const document = React.createElement(CalibrationPDFDocument, {
      record: {
        id: 1,
        equipment_id: 9,
        template_id: 'FC-3232',
        template_name: 'Template de teste',
        operator: 'Operador',
        temperature: 24,
        humidity: 55,
        mains_voltage: null,
        readings: [{
          sectionName: 'Resistencia',
          standard: {
            id: 8,
            code: 'PA-001',
            name: 'Padrao de resistencia',
            certificate_number: 'CERT-123',
            certificate_url: certificateUrl,
          },
          points: [{
            group: null,
            targetValue: 10,
            unit: 'MΩ',
            averageStandard: 10,
            averageEquipment: 10,
            deviation: 0,
            uncertaintyExpanded: 0.01,
            tolerance: 0.5,
            status: 'Aprovado',
            resolution: 0.01,
            cycles: [],
          }],
        }],
        overall_status: 'Aprovado',
        started_at: '2026-09-18T10:00:00.000Z',
        created_at: '2026-09-18T10:10:00.000Z',
      },
      equipmentName: 'Equipamento de teste',
      equipmentNs: 'NS-001',
      equipmentOp: 'OP-001',
      equipmentType: 'Tipo de teste',
      equipmentRange: '0 a 100 MΩ',
    });

    const buffer = await renderToBuffer(document as Parameters<typeof renderToBuffer>[0]);

    expect(buffer.toString('latin1')).toContain(certificateUrl);
  });
});
