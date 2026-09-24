import { describe, expect, it } from 'vitest'
import type { ICalibrationTemplate, ITemplatePoint } from '../../services/templates/ApiTemplatesRepository'
import type { IReferenceStandard, IStandardPoint } from '../../services/standards/ApiStandardsRepository'
import { calculatePointMetrology, matchStandardPoint, parseNumber } from './metrology'

const point: ITemplatePoint = {
  id: 'point-100-v',
  targetValue: 100,
  unit: 'V',
}

const createTemplate = (tolerance = 5): ICalibrationTemplate => ({
  id: 'template-test',
  name: 'Template de teste',
  equipment_type: 'TEST',
  tolerance,
  structure: [
    {
      name: 'Tensão',
      defaultUnit: 'V',
      cyclesCount: 3,
      columns: [
        { key: 'standard', label: 'Padrão' },
        { key: 'equipment', label: 'Equipamento' },
      ],
      points: [point],
    },
  ],
})

const standardPoint: IStandardPoint = {
  id: 'standard-100-v',
  sectionName: 'Tensão',
  nominalValue: 100,
  unit: 'V',
  referenceValue: 100,
  uncertaintyExpanded: 0.2,
  kFactor: 2,
  resolution: 0.1,
}

const standard: IReferenceStandard = {
  id: 1,
  code: 'PADRAO-TESTE',
  name: 'Padrão de teste',
  certificate_number: 'CERT-TESTE',
  validity_date: '2099-12-31',
  points: [standardPoint],
}

const cycles = (equipmentValues: number[]) => equipmentValues.map((equipment, index) => ({
  standard: [99.9, 100, 100.1][index],
  equipment,
}))

describe('parseNumber', () => {
  it('aceita separador decimal brasileiro e rejeita campo vazio', () => {
    expect(parseNumber('1,25')).toBe(1.25)
    expect(parseNumber('')).toBeNaN()
  })
})

describe('matchStandardPoint', () => {
  it('prioriza a chave forte de vínculo', () => {
    const linkedPoint = {
      ...point,
      isLinkedToStandard: true,
      standardPointKey: 'standard-100-v',
    }

    expect(matchStandardPoint([standardPoint], linkedPoint, 'V')).toBe(standardPoint)
  })

  it('exige valor e unidade no fallback', () => {
    expect(matchStandardPoint([standardPoint], point, 'V')).toBe(standardPoint)
    expect(matchStandardPoint([{ ...standardPoint, unit: 'A' }], point, 'V')).toBeNull()
  })
})

describe('calculatePointMetrology', () => {
  it('combina incertezas e aprova um ponto dentro do MPE', () => {
    const result = calculatePointMetrology(
      createTemplate(),
      standard,
      0,
      0,
      cycles([101, 101, 101]),
    )

    expect(result).toEqual({
      averageStandard: 100,
      averageEquipment: 101,
      deviation: 1,
      uncertaintyExpanded: 0.23094,
      tolerance: 5,
      status: 'Aprovado',
    })
  })

  it('inclui a repetibilidade observada na incerteza', () => {
    const result = calculatePointMetrology(
      createTemplate(),
      standard,
      0,
      0,
      cycles([99, 100, 101]),
    )

    expect(result?.averageEquipment).toBe(100)
    expect(result?.uncertaintyExpanded).toBe(2.013289)
  })

  it('reprova quando desvio mais incerteza ultrapassa a tolerância', () => {
    const result = calculatePointMetrology(
      createTemplate(),
      standard,
      0,
      0,
      cycles([105, 105, 105]),
    )

    expect(result?.status).toBe('Reprovado')
  })

  it('permite calcular a tolerância sobre o fundo de escala', () => {
    const pointMode = calculatePointMetrology(
      createTemplate(1),
      standard,
      0,
      0,
      cycles([104, 104, 104]),
    )
    const scaleMode = calculatePointMetrology(
      createTemplate(1),
      standard,
      0,
      0,
      cycles([104, 104, 104]),
      false,
      { mode: 'scale', scaleValue: 1000 },
    )

    expect(pointMode?.status).toBe('Reprovado')
    expect(pointMode?.tolerance).toBe(1)
    expect(scaleMode?.status).toBe('Aprovado')
    expect(scaleMode?.tolerance).toBe(10)
  })
})
