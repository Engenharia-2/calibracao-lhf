import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
console.log('[Preload] Injetando a ponte de comunicação segura...');

contextBridge.exposeInMainWorld('electron', {
  authLogin: (email: string, password: string) => {
    console.log('[Preload] Roteando chamada de Login para a IPC');
    return ipcRenderer.invoke('auth:login', email, password);
  },
  authRegister: (name: string, email: string, password: string) => {
    console.log('[Preload] Roteando chamada de Registro para a IPC');
    return ipcRenderer.invoke('auth:register', name, email, password);
  },
  saveCalibration: (data: any) => {
    console.log('[Preload] Roteando saveCalibration para a IPC');
    return ipcRenderer.invoke('calibration:save', data);
  },
  getCalibrationHistory: (equipmentId: number) => {
    console.log('[Preload] Buscando histórico de calibração para o equipamento...', equipmentId);
    return ipcRenderer.invoke('calibration:getByEquipment', equipmentId);
  },
  getEquipments: () => {
    console.log('[Preload] Buscando lista de equipamentos...');
    return ipcRenderer.invoke('equipments:getAll');
  },
  createEquipment: (op: string, ns: string, name: string) => {
    console.log('[Preload] Solicitando criação de equipamento...', { op, ns, name });
    return ipcRenderer.invoke('equipments:create', op, ns, name);
  },
  getClients: () => {
    console.log('[Preload] Buscando lista de clientes...');
    return ipcRenderer.invoke('clients:getAll');
  },
  createClient: (company: string, cnpj: string, email: string) => {
    console.log('[Preload] Solicitando criação de cliente...', { company, cnpj, email });
    return ipcRenderer.invoke('clients:create', company, cnpj, email);
  },
  getTemplates: () => {
    console.log('[Preload] Buscando todos os templates de formulários...');
    return ipcRenderer.invoke('templates:getAll');
  },
  getTemplateById: (id: string) => {
    console.log('[Preload] Buscando template pelo ID:', id);
    return ipcRenderer.invoke('templates:getById', id);
  },
  createTemplate: (template: any) => {
    console.log('[Preload] Solicitando criação de template...', template);
    return ipcRenderer.invoke('templates:create', template);
  },
  updateTemplate: (id: string, template: any) => {
    console.log('[Preload] Solicitando atualização de template...', { id, template });
    return ipcRenderer.invoke('templates:update', id, template);
  },
  deleteTemplate: (id: string) => {
    console.log('[Preload] Solicitando exclusão de template...', id);
    return ipcRenderer.invoke('templates:delete', id);
  },
  getStandards: () => {
    console.log('[Preload] Buscando todos os padrões de referência...');
    return ipcRenderer.invoke('standards:getAll');
  },
  getStandardById: (id: number | string) => {
    console.log('[Preload] Buscando padrão pelo ID:', id);
    return ipcRenderer.invoke('standards:getById', id);
  },
  createStandard: (standard: any) => {
    console.log('[Preload] Solicitando criação de padrão...', standard);
    return ipcRenderer.invoke('standards:create', standard);
  },
  updateStandard: (id: number | string, standard: any) => {
    console.log('[Preload] Solicitando atualização de padrão...', { id, standard });
    return ipcRenderer.invoke('standards:update', id, standard);
  },
  deleteStandard: (id: number | string) => {
    console.log('[Preload] Solicitando exclusão de padrão...', id);
    return ipcRenderer.invoke('standards:delete', id);
  },
  onStandardsUpdated: (callback: () => void) => {
    console.log('[Preload] Registrando ouvinte de atualização de padrões...');
    const subscription = () => callback();
    ipcRenderer.on('standards:updated', subscription);
    return () => {
      ipcRenderer.removeListener('standards:updated', subscription);
    };
  },
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, listener)
  },
  removeListener: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, listener)
  }
})
