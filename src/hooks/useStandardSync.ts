import { useState, useEffect } from 'react';
import { IReferenceStandard, IStandardPoint } from '../services/standards/ApiStandardsRepository';
import { ITemplateSection } from '../services/templates/ApiTemplatesRepository';

interface UseStandardSyncProps {
  sections: ITemplateSection[];
  setSections: (sections: ITemplateSection[]) => void;
  generateUniqueId: () => string;
}

export function generateSectionsFromStandard(standard: IReferenceStandard, generateUniqueId: () => string): ITemplateSection[] {
  if (!standard || !standard.points) return [];

  let pointsList: IStandardPoint[] = [];
  if (typeof standard.points === 'string') {
    try { pointsList = JSON.parse(standard.points); } catch (e) {}
  } else if (Array.isArray(standard.points)) {
    pointsList = standard.points;
  }

  if (!pointsList.length) return [];

  const sectionsMap = new Map<string, ITemplateSection>();

  pointsList.forEach((pt) => {
    const secName = pt.sectionName || 'Seção de Teste';
    if (!sectionsMap.has(secName)) {
      sectionsMap.set(secName, {
        name: secName,
        defaultUnit: pt.unit || 'V',
        cyclesCount: 3,
        columns: [
          { key: 'standard', label: 'Padrão' },
          { key: 'equipment', label: 'Conjunto' }
        ],
        points: []
      });
    }

    const currentSec = sectionsMap.get(secName)!;
    currentSec.points.push({
      id: generateUniqueId(),
      targetValue: pt.nominalValue,
      unit: pt.unit || currentSec.defaultUnit
    });
  });

  return Array.from(sectionsMap.values());
}

export function useStandardSync({ sections, setSections, generateUniqueId }: UseStandardSyncProps) {
  const [targetSectionIndex, setTargetSectionIndex] = useState<number | null>(null);
  const [standards, setStandards] = useState<IReferenceStandard[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingStandard, setPendingStandard] = useState<IReferenceStandard | null>(null);

  // Carrega e escuta atualizações dos padrões disponíveis em tempo real
  useEffect(() => {
    const fetchStandards = async () => {
      console.log("[useStandardSync.ts] fetchStandards disparado.");
      try {
        if (typeof (window as any).electron?.getStandards === 'function') {
          const list = await (window as any).electron.getStandards();
          setStandards(list);
        }
      } catch (err) {
        console.error('[useStandardSync.ts] Erro ao buscar padrões:', err);
      }
    };
    fetchStandards();

    if (typeof (window as any).electron?.onStandardsUpdated === 'function') {
      const cleanup = (window as any).electron.onStandardsUpdated(() => {
        fetchStandards();
      });
      return () => cleanup();
    }
  }, []);

  const handleStandardSelect = (idVal: string | number, sectionIndex: number) => {
    if (!idVal) {
      setPendingStandard(null);
      setTargetSectionIndex(null);
      return;
    }

    const selectedStd = standards.find(s => String(s.id) === String(idVal));
    if (!selectedStd) return;

    setPendingStandard(selectedStd);
    setTargetSectionIndex(sectionIndex);
    setIsImportModalOpen(true);
  };

  const importSelectedPoints = (selectedPoints: IStandardPoint[]) => {
    setIsImportModalOpen(false);
    if (!selectedPoints.length || targetSectionIndex === null) return;

    const updatedSections = [...sections];
    const targetSec = updatedSections[targetSectionIndex];

    selectedPoints.forEach((stdPt) => {
      const stdPtKey = stdPt.id || `pt_${stdPt.nominalValue}_${stdPt.unit}`;

      const pointExists = targetSec.points.some(
        p => p.isLinkedToStandard && p.standardPointKey === stdPtKey
      );

      if (!pointExists) {
        targetSec.points.push({
          id: generateUniqueId(),
          targetValue: stdPt.nominalValue,
          unit: stdPt.unit || targetSec.defaultUnit,
          resolution: stdPt.resolution,
          isLinkedToStandard: true,
          standardPointKey: stdPtKey
        });
      }
    });

    setSections(updatedSections);
    setPendingStandard(null);
    setTargetSectionIndex(null);
  };

  const syncSectionWithStandard = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (!section.standard_id) {
       alert("Esta seção não tem padrão vinculado.");
       return;
    }
    const selectedStd = standards.find(s => String(s.id) === String(section.standard_id));
    if (!selectedStd) return;

    let stdPointsList: IStandardPoint[] = [];
    if (typeof selectedStd.points === 'string') {
      try { stdPointsList = JSON.parse(selectedStd.points); } catch (e) {}
    } else if (Array.isArray(selectedStd.points)) {
      stdPointsList = selectedStd.points;
    }

    if (stdPointsList.length === 0) {
      alert('O padrão vinculado a esta seção não possui pontos configurados.');
      return;
    }

    const stdPointsMap = new Map<string, IStandardPoint>();
    stdPointsList.forEach((pt) => {
      if (pt.id) {
        stdPointsMap.set(pt.id, pt);
      }
      const secName = pt.sectionName || 'Seção de Teste';
      const oldKey = `${secName}_${pt.nominalValue}_${pt.unit}`;
      stdPointsMap.set(oldKey, pt);
      const fallbackKey = `pt_${pt.nominalValue}_${pt.unit}`;
      stdPointsMap.set(fallbackKey, pt);
    });

    let syncCount = 0;

    const updatedSections = [...sections];
    const updatedPoints = section.points.map((pt) => {
      if (pt.isLinkedToStandard && pt.standardPointKey) {
        const matchPt = stdPointsMap.get(pt.standardPointKey);
        if (matchPt) {
          syncCount++;
          return {
            ...pt,
            targetValue: matchPt.nominalValue,
            unit: matchPt.unit || pt.unit,
            resolution: matchPt.resolution !== undefined ? matchPt.resolution : pt.resolution
          };
        }
      }
      return pt;
    });

    updatedSections[sectionIndex] = {
      ...section,
      points: updatedPoints
    };

    setSections(updatedSections);
    alert(`Sincronização concluída! ${syncCount} pontos vinculados atualizados nesta seção.`);
  };

  return {

    standards,
    isImportModalOpen,
    setIsImportModalOpen,
    pendingStandard,
    handleStandardSelect,
    importSelectedPoints,
    syncSectionWithStandard
  };
}
