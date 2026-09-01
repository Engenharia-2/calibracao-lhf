import { useState } from 'react';
import { ITemplateSection, ITemplatePoint } from '../services/templates/ApiTemplatesRepository';

const generateUniqueId = () => {
  return 'pt-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
};

export function useTemplateSections(initialSections: ITemplateSection[] = []) {
  const [sections, setSections] = useState<ITemplateSection[]>(initialSections);

  const addSection = () => {
    const newSection: ITemplateSection = {
      name: 'Nova Seção',
      defaultUnit: 'V',
      cyclesCount: 3,
      columns: [
        { key: 'standard', label: 'Padrão' },
        { key: 'equipment', label: 'Conjunto' }
      ],
      points: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionIndex: number) => {
    setSections(sections.filter((_, index) => index !== sectionIndex));
  };

  const updateSection = (sectionIndex: number, fields: Partial<ITemplateSection>) => {
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        return { ...sec, ...fields };
      }
      return sec;
    }));
  };

  const addPointToSection = (sectionIndex: number) => {
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        const newPoint: ITemplatePoint = {
          id: generateUniqueId(),
          targetValue: 0,
          unit: sec.defaultUnit
        };
        return {
          ...sec,
          points: [...sec.points, newPoint]
        };
      }
      return sec;
    }));
  };

  const removePointFromSection = (sectionIndex: number, pointIndex: number) => {
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        return {
          ...sec,
          points: sec.points.filter((_, pIdx) => pIdx !== pointIndex)
        };
      }
      return sec;
    }));
  };

  const movePointInSection = (sectionIndex: number, dragIndex: number, dropIndex: number) => {
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        const updatedPoints = [...sec.points];
        const [movedItem] = updatedPoints.splice(dragIndex, 1);
        updatedPoints.splice(dropIndex, 0, movedItem);
        return { ...sec, points: updatedPoints };
      }
      return sec;
    }));
  };

  const updatePointInSection = (sectionIndex: number, pointIndex: number, fields: Partial<ITemplatePoint>) => {
    setSections(sections.map((sec, index) => {
      if (index === sectionIndex) {
        return {
          ...sec,
          points: sec.points.map((pt, pIdx) => {
            if (pIdx === pointIndex) {
              return { ...pt, ...fields };
            }
            return pt;
          })
        };
      }
      return sec;
    }));
  };

  return {
    sections,
    setSections,
    addSection,
    removeSection,
    updateSection,
    addPointToSection,
    removePointFromSection,
    updatePointInSection,
    movePointInSection,
    generateUniqueId
  };
}
