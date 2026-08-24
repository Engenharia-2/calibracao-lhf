export interface IEquipment {
  id?: number;
  op: string;
  ns: string;
  name: string;
  equipment_type?: string;
  measurement_range?: string;
  created_at?: string;
}

export class ApiEquipmentsRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/equipments`;

  async getAll(): Promise<IEquipment[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error('Falha ao buscar equipamentos');
    const data = await response.json();
    return data.data;
  }

  async create(op: string, ns: string, name: string, equipmentType?: string, measurementRange?: string): Promise<IEquipment> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op, ns, name, equipment_type: equipmentType, measurement_range: measurementRange })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao cadastrar equipamento');
    return data.data;
  }

  async update(id: number | string, op: string, ns: string, name: string, equipmentType?: string, measurementRange?: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op, ns, name, equipment_type: equipmentType, measurement_range: measurementRange })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao atualizar equipamento');
    return data;
  }

  async delete(id: number | string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Falha ao excluir equipamento');
  }
}
