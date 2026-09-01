import { useState, useCallback } from 'react';
import { ICalibrationTemplate, ITemplateSection } from '../services/templates/ApiTemplatesRepository';
import { IReferenceStandard, IStandardPoint } from '../services/standards/ApiStandardsRepository';
import { matchStandardPoint } from '../core/domain/metrology';

export interface GridState {
  [sectionIndex: number]: {
    [pointIndex: number]: {
      [cycleIndex: number]: {
        [columnKey: string]: string | number;
      }
    }
  }
}

export function generateAutoFilledGrid(template: ICalibrationTemplate, standards: IReferenceStandard[] = [], existingGrid: GridState = {}): GridState {
  if (!template) return {};

  const struct = typeof template.structure === 'string'
    ? JSON.parse(template.structure)
    : template.structure;

  if (!Array.isArray(struct)) return {};

  const nextGrid: GridState = { ...existingGrid };

  struct.forEach((section: ITemplateSection, sIdx: number) => {
    if (!nextGrid[sIdx]) nextGrid[sIdx] = {};
    const hasStandardCol = section.columns.some((col: any) => col.key === 'standard');

    const stdId = section.standard_id;
    const std = standards.find(s => s.id === stdId) || null;
    let parsedPoints: IStandardPoint[] = [];
    if (std) {
      if (typeof std.points === 'string') {
        try { parsedPoints = JSON.parse(std.points); } catch(e) {}
      } else if (Array.isArray(std.points)) {
        parsedPoints = std.points;
      }
    }

    section.points.forEach((point, pIdx) => {
      if (!nextGrid[sIdx][pIdx]) nextGrid[sIdx][pIdx] = {};
      
      const rbcPoint = matchStandardPoint(parsedPoints, point, section.defaultUnit);
      const refVal = rbcPoint ? String(rbcPoint.referenceValue) : String(point.targetValue);

      for (let c = 0; c < section.cyclesCount; c++) {
        if (!nextGrid[sIdx][pIdx][c]) nextGrid[sIdx][pIdx][c] = {};
        if (hasStandardCol) {
          nextGrid[sIdx][pIdx][c] = {
            ...nextGrid[sIdx][pIdx][c],
            standard: refVal
          };
        }
      }
    });
  });

  return nextGrid;
}

export function useCalibrationGrid() {
  const [gridState, setGridState] = useState<GridState>({});

  const updateCell = useCallback((
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
  }, []);

  return {
    gridState,
    setGridState,
    updateCell,
    generateAutoFilledGrid
  };
}
