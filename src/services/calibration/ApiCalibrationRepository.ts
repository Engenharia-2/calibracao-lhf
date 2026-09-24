// Repositório de calibrações conectando à API Express

export class ApiCalibrationRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://192.168.0.10:3002/api'}/calibration`;

  
  async getAll(): Promise<any[]> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Falha ao buscar todas as calibrações: ${response.statusText}`);
      }
      const result = await response.json();
      
      const parsedData = (result.data || []).map((rec: any) => {
        if (typeof rec.readings === 'string') {
          try {
            rec.readings = JSON.parse(rec.readings);
          } catch (e) {
            rec.readings = [];
          }
        }
        return rec;
      });

      return parsedData;
    } catch (error) {
      console.error('Erro ao buscar histórico de calibração:', error);
      throw error;
    }
  }

  async save(data: any): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Falha ao salvar na API: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Resposta da API:', result);
      return result.data || result;
    } catch (error) {
      console.error('Erro de rede ao salvar na API:', error);
      throw error;
    }
  }

  async getByEquipmentId(equipmentId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/equipment/${equipmentId}`);
      if (!response.ok) {
        throw new Error(`Falha ao buscar histórico: ${response.statusText}`);
      }
      const result = await response.json();
      
      const parsedData = (result.data || []).map((rec: any) => {
        if (typeof rec.readings === 'string') {
          try {
            rec.readings = JSON.parse(rec.readings);
          } catch (e) {
            rec.readings = [];
          }
        }
        return rec;
      });

      return parsedData;
    } catch (error) {
      console.error('Erro ao buscar histórico de calibração:', error);
      throw error;
    }
  }

  async updateHeader(id: number | string, clientId: number | null, createdAt: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientId, createdAt })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Falha ao atualizar cabeçalho: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro de rede ao atualizar cabeçalho de calibração:', error);
      throw error;
    }
  }
}
