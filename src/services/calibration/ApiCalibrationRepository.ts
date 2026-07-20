// Repositório de calibrações conectando à API Express

export class ApiCalibrationRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/calibration`;

  async save(data: any): Promise<void> {
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
      return result.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de calibração:', error);
      throw error;
    }
  }
}
