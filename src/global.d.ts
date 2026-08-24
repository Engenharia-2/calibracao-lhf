export {};

declare global {
  interface Window {
    electron: {
      authLogin: (email: string, password: string) => Promise<any>;
      authRegister: (name: string, email: string, password: string, sig?: string) => Promise<any>;
      saveCalibration: (data: any) => Promise<any>;
      getCalibrationHistory: (equipmentId: number) => Promise<any[]>;
      updateCalibrationHeader: (id: number | string, clientId: number | null, createdAt: string) => Promise<any>;
      getEquipments: () => Promise<any[]>;
      createEquipment: (op: string, ns: string, name: string, equipmentType?: string, measurementRange?: string) => Promise<any>;
      updateEquipment: (id: number | string, op: string, ns: string, name: string, equipmentType?: string, measurementRange?: string) => Promise<any>;
      deleteEquipment: (id: number | string) => Promise<void>;
      getClients: () => Promise<any[]>;
      createClient: (company: string, cnpj: string, email: string, adress?: string, city?: string) => Promise<any>;
      updateClient: (id: number | string, company: string, cnpj: string, email: string, adress?: string, city?: string) => Promise<any>;
      deleteClient: (id: number | string) => Promise<void>;
      getTemplates: () => Promise<any[]>;
      getTemplateById: (id: string) => Promise<any>;
      createTemplate: (template: any) => Promise<any>;
      updateTemplate: (id: string, template: any) => Promise<any>;
      deleteTemplate: (id: string) => Promise<void>;
      getStandards: () => Promise<any[]>;
      getStandardById: (id: number | string) => Promise<any>;
      createStandard: (standard: any) => Promise<any>;
      updateStandard: (id: number | string, standard: any) => Promise<any>;
      deleteStandard: (id: number | string) => Promise<void>;
      onStandardsUpdated: (callback: () => void) => () => void;
      getDashboardMetrics: (filters?: any) => Promise<any>;
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      removeListener: (channel: string, listener: (...args: any[]) => void) => void;
    };
  }
}
