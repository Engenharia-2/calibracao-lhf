export interface ITemplateColumn {
  key: string;
  label: string;
}

export interface ITemplatePoint {
  id?: string;
  group?: string;
  targetValue: number;
  unit?: string;
  resolution?: number;
  isLinkedToStandard?: boolean;
  standardPointKey?: string;
}

export interface ITemplateSection {
  name: string;
  defaultUnit: string;
  cyclesCount: number;
  columns: ITemplateColumn[];
  points: ITemplatePoint[];
  standard_id?: string | number | null;
}

export interface ICalibrationTemplate {
  id: string;
  name: string;
  equipment_type: string;
  tolerance: number;
  default_standard_id?: number | null;
  structure: ITemplateSection[] | string;
  created_at?: string;
  updated_at?: string;
}

export class ApiTemplatesRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/templates`;

  async getAll(): Promise<ICalibrationTemplate[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error('Falha ao buscar templates');
    const data = await response.json();
    return data.data;
  }

  async getById(id: string): Promise<ICalibrationTemplate> {
    const response = await fetch(`${this.apiUrl}/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar template');
    const data = await response.json();
    const template = data.data;
    if (typeof template.structure === 'string') {
      template.structure = JSON.parse(template.structure);
    }
    return template;
  }

  async create(template: ICalibrationTemplate): Promise<ICalibrationTemplate> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao cadastrar template');
    return data.data;
  }

  async update(id: string, template: Partial<ICalibrationTemplate>): Promise<ICalibrationTemplate> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao atualizar template');
    return data.data;
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Falha ao excluir template');
    }
  }
}
