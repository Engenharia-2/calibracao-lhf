export interface IStandardPoint {
  id?: string;
  sectionName: string;
  nominalValue: number;
  unit: string;
  referenceValue: number; // VR (Valor Padrão RBC)
  uncertaintyExpanded: number; // U_ext
  kFactor: number; // k (geralmente 2.0)
  resolution: number; // Menor divisão no visor (ex: 0.01 ou 0.1)
}

export interface IReferenceStandard {
  id?: number;
  code: string;
  name: string;
  certificate_number: string;
  validity_date: string;
  points: IStandardPoint[] | string;
  certificate_url?: string;
  created_at?: string;
}

export class ApiStandardsRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/standards`;

  async getAll(): Promise<IReferenceStandard[]> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Falha ao buscar padrões');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getById(id: number | string): Promise<IReferenceStandard> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (!response.ok) throw new Error('Falha ao buscar padrão por ID');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(standard: IReferenceStandard): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(standard)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao criar padrão');
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: number | string, standard: IReferenceStandard): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(standard)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao atualizar padrão');
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Falha ao excluir padrão');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
