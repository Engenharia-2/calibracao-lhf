export interface IClient {
  id?: number;
  company: string;
  cnpj: string;
  email: string;
  created_at?: string;
}

export class ApiClientsRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/clients`;

  async getAll(): Promise<IClient[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error('Falha ao buscar clientes');
    const data = await response.json();
    return data.data;
  }

  async create(company: string, cnpj: string, email: string): Promise<IClient> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, cnpj, email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao cadastrar cliente');
    return data.data;
  }
}
