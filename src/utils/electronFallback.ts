import { ApiAuthRepository } from '../services/auth/ApiAuthRepository';
import { ApiCalibrationRepository } from '../services/calibration/ApiCalibrationRepository';
import { ApiEquipmentsRepository } from '../services/equipments/ApiEquipmentsRepository';
import { ApiClientsRepository } from '../services/clients/ApiClientsRepository';
import { ApiTemplatesRepository } from '../services/templates/ApiTemplatesRepository';
import { ApiStandardsRepository } from '../services/standards/ApiStandardsRepository';
import { ApiDashboardRepository } from '../services/dashboard/ApiDashboardRepository';

// Garante que process.env.VITE_API_BASE_URL esteja definido no navegador
if (typeof window !== 'undefined') {
  const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002/api`;
  
  if (typeof process === 'undefined') {
    // @ts-ignore
    window.process = { env: { VITE_API_BASE_URL: apiBase } };
  } else if (!process.env) {
    // @ts-ignore
    process.env = { VITE_API_BASE_URL: apiBase };
  } else {
    process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || apiBase;
  }
}

// Instancia os repositórios diretamente no navegador
const authRepo = new ApiAuthRepository();
const calibrationRepo = new ApiCalibrationRepository();
const equipmentsRepo = new ApiEquipmentsRepository();
const clientsRepo = new ApiClientsRepository();
const templatesRepo = new ApiTemplatesRepository();
const standardsRepo = new ApiStandardsRepository();
const dashboardRepo = new ApiDashboardRepository();

if (typeof window !== 'undefined' && !window.electron) {
  console.log('[Web Fallback] Iniciando adaptador de comunicação HTTP direta com API do Synology...');

  window.electron = {
    authLogin: (email, password) => authRepo.login(email, password),
    authRegister: (name, email, password) => authRepo.register(name, email, password),
    saveCalibration: (data) => calibrationRepo.save(data),
    getCalibrationHistory: (equipmentId) => calibrationRepo.getByEquipmentId(equipmentId),
    updateCalibrationHeader: (id, clientId, createdAt) => calibrationRepo.updateHeader(id, clientId, createdAt),
    getEquipments: () => equipmentsRepo.getAll(),
    createEquipment: (op, ns, name) => equipmentsRepo.create(op, ns, name),
    updateEquipment: (id, op, ns, name) => equipmentsRepo.update(id, op, ns, name),
    deleteEquipment: (id) => equipmentsRepo.delete(id),
    getClients: () => clientsRepo.getAll(),
    createClient: (company, cnpj, email, adress, city) => clientsRepo.create(company, cnpj, email, adress, city),
    updateClient: (id, company, cnpj, email, adress, city) => clientsRepo.update(id, company, cnpj, email, adress, city),
    deleteClient: (id) => clientsRepo.delete(id),
    getTemplates: () => templatesRepo.getAll(),
    getTemplateById: (id) => templatesRepo.getById(id),
    createTemplate: (template) => templatesRepo.create(template),
    updateTemplate: (id, template) => templatesRepo.update(id, template),
    deleteTemplate: (id) => templatesRepo.delete(id),
    getStandards: () => standardsRepo.getAll(),
    getStandardById: (id) => standardsRepo.getById(id),
    createStandard: (standard) => standardsRepo.create(standard),
    updateStandard: (id, standard) => standardsRepo.update(id, standard),
    deleteStandard: (id) => standardsRepo.delete(id),
    onStandardsUpdated: (_callback) => {
      // Retorna no-op subscription na web convencional
      return () => {};
    },
    getDashboardMetrics: (filters) => dashboardRepo.getMetrics(filters),
    on: (_channel, _listener) => {},
    removeListener: (_channel, _listener) => {}
  };
}
