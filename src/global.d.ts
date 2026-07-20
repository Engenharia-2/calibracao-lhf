export {};

declare global {
  interface Window {
    electron: {
      authLogin: (email: string, password: string) => Promise<any>;
      authRegister: (name: string, email: string, password: string) => Promise<any>;
      saveCalibration: (data: any) => Promise<void>;
      getCalibrationHistory: (equipmentId: number) => Promise<any[]>;
      getEquipments: () => Promise<any[]>;
      createEquipment: (op: string, ns: string, name: string) => Promise<any>;
      getClients: () => Promise<any[]>;
      createClient: (company: string, cnpj: string, email: string) => Promise<any>;
      getTemplates: () => Promise<any[]>;
      getTemplateById: (id: string) => Promise<any>;
      createTemplate: (template: any) => Promise<any>;
      updateTemplate: (id: string, template: any) => Promise<any>;
      deleteTemplate: (id: string) => Promise<void>;
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      removeListener: (channel: string, listener: (...args: any[]) => void) => void;
    };
  }
}
