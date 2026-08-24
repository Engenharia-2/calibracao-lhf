import { useState, useEffect } from 'react';
import { IEquipment } from '../services/equipments/ApiEquipmentsRepository';

interface UseCreateEquipmentProps {
  equipment?: IEquipment | null;
  onSuccess?: () => void;
}

function extractOpFromNs(nsValue: string): string {
  if (!nsValue || !nsValue.includes('-')) return '';
  const parts = nsValue.split('-').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return parts[1];
  } else if (parts.length === 2) {
    return parts[1];
  }
  return '';
}

export function useCreateEquipment({ equipment, onSuccess }: UseCreateEquipmentProps = {}) {
  const [op, setOp] = useState(equipment?.op || '');
  const [ns, setNs] = useState(equipment?.ns || '');
  const [name, setName] = useState(equipment?.name || '');
  const [equipmentType, setEquipmentType] = useState(equipment?.equipment_type || '');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMinUnit, setRangeMinUnit] = useState('Ω');
  const [rangeMax, setRangeMax] = useState('');
  const [rangeMaxUnit, setRangeMaxUnit] = useState('kΩ');
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOp(equipment?.op || '');
    setNs(equipment?.ns || '');
    setName(equipment?.name || '');
    setEquipmentType(equipment?.equipment_type || '');
    
    let rMin = '', rMinU = 'Ω', rMax = '', rMaxU = 'kΩ';
    if (equipment?.measurement_range) {
      const parts = equipment.measurement_range.split(' a ');
      if (parts.length === 2) {
        const leftParts = parts[0].trim().split(' ');
        if (leftParts.length >= 2) {
          rMin = leftParts[0];
          rMinU = leftParts.slice(1).join(' ');
        } else {
          rMin = parts[0].trim();
        }
        const rightParts = parts[1].trim().split(' ');
        if (rightParts.length >= 2) {
          rMax = rightParts[0];
          rMaxU = rightParts.slice(1).join(' ');
        } else {
          rMax = parts[1].trim();
        }
      }
    }
    setRangeMin(rMin);
    setRangeMinUnit(rMinU);
    setRangeMax(rMax);
    setRangeMaxUnit(rMaxU);
    setError(null);
  }, [equipment]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        if (typeof (window as any).electron?.getTemplates === 'function') {
          const list = await (window as any).electron.getTemplates();
          const types = Array.from(new Set(list.map((t: any) => t.equipment_type))).filter(Boolean);
          setAvailableTypes(types as string[]);
        }
      } catch (err) {
        console.error('Erro ao carregar tipos de equipamentos no hook:', err);
      }
    };
    loadTypes();
  }, []);

  const handleNsChange = (newNs: string) => {
    setNs(newNs);
    const extractedOp = extractOpFromNs(newNs);
    if (extractedOp) {
      setOp(extractedOp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMeasurementRange = (rangeMin && rangeMax) ? `${rangeMin} ${rangeMinUnit} a ${rangeMax} ${rangeMaxUnit}` : '';
    if (!op || !ns || !name || !equipmentType) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (equipment?.id) {
        if (typeof (window as any).electron?.updateEquipment !== 'function') {
          throw new Error('Função de comunicação updateEquipment indisponível.');
        }
        const result = await (window as any).electron.updateEquipment(equipment.id, op, ns, name, equipmentType, finalMeasurementRange);
        console.log('Equipamento atualizado:', result);
      } else {
        if (typeof (window as any).electron?.createEquipment !== 'function') {
          throw new Error('Função de comunicação createEquipment indisponível.');
        }
        const result = await (window as any).electron.createEquipment(op, ns, name, equipmentType, finalMeasurementRange);
        console.log('Equipamento criado:', result);
      }
      
      setOp('');
      setNs('');
      setName('');
      setEquipmentType('');
      setRangeMin('');
      setRangeMinUnit('Ω');
      setRangeMax('');
      setRangeMaxUnit('kΩ');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar equipamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    op,
    setOp,
    ns,
    setNs,
    handleNsChange,
    name,
    setName,
    equipmentType,
    setEquipmentType,
    rangeMin,
    setRangeMin,
    rangeMinUnit,
    setRangeMinUnit,
    rangeMax,
    setRangeMax,
    rangeMaxUnit,
    setRangeMaxUnit,
    availableTypes,
    isLoading,
    error,
    handleSubmit
  };
}
