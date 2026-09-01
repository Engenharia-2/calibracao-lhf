export interface IDashboardMetrics {
  kpi: {
    total: number;
    approved: number;
    reproved: number;
  };
  trend: Array<{
    month: string;
    count: number;
  }>;
  calibrations: Array<{
    id: number;
    equipment_id: number;
    created_at: string;
    overall_status: string;
    operator: string;
    equipment_name: string;
    equipment_ns: string;
    equipment_op: string;
    template_name: string;
    client_company?: string | null;
  }>;
  expiringStandards: Array<{
    id: number;
    code: string;
    name: string;
    certificate_number: string;
    validity_date: string;
  }>;
  expiringEquipments: Array<{
    id: number;
    name: string;
    ns: string;
    op: string;
    last_calibration: string | null;
  }>;
}

export class ApiDashboardRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/dashboard`;

  async getMetrics(filters?: { startDate?: string; endDate?: string; equipmentType?: string }): Promise<IDashboardMetrics> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.equipmentType) params.append('equipmentType', filters.equipmentType);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${this.apiUrl}/metrics${queryStr}`);
    if (!response.ok) {
      const errTxt = await response.text();
      console.error('[ApiDashboard] HTTP ERROR:', response.status, errTxt);
      throw new Error(`Falha ao buscar métricas da dashboard: Status ${response.status} - ${errTxt}`);
    }
    const data = await response.json();
    return data.data;
  }
}
