import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { ApiAuthRepository } from '../src/services/auth/ApiAuthRepository'
import { AuthService } from '../src/domain/auth/AuthService'
import { ApiCalibrationRepository } from '../src/services/calibration/ApiCalibrationRepository'
import { ApiEquipmentsRepository } from '../src/services/equipments/ApiEquipmentsRepository'
import { ApiClientsRepository } from '../src/services/clients/ApiClientsRepository'
import { ApiTemplatesRepository } from '../src/services/templates/ApiTemplatesRepository'
import { ApiStandardsRepository } from '../src/services/standards/ApiStandardsRepository'
import { ApiDashboardRepository } from '../src/services/dashboard/ApiDashboardRepository'

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

// Initialize Auth Service
const authRepository = new ApiAuthRepository()
const authService = new AuthService(authRepository)

// Initialize Calibration Repository
const calibrationRepository = new ApiCalibrationRepository()

// Initialize Equipments Repository
const equipmentsRepository = new ApiEquipmentsRepository()

// Initialize Clients Repository
const clientsRepository = new ApiClientsRepository()

// Initialize Templates Repository
const templatesRepository = new ApiTemplatesRepository()

// Initialize Standards Repository
const standardsRepository = new ApiStandardsRepository()

// Initialize Dashboard Repository
const dashboardRepository = new ApiDashboardRepository()

// Setup IPC handlers
ipcMain.handle('auth:login', async (_, email, password) => {
  return authService.login(email, password)
})

ipcMain.handle('auth:register', async (_, name, email, password, signatureBase64) => {
  return authService.register(name, email, password, signatureBase64)
})

ipcMain.handle('calibration:save', async (_, data) => {
  return calibrationRepository.save(data)
})

ipcMain.handle('calibration:getByEquipment', async (_, equipmentId) => {
  return calibrationRepository.getByEquipmentId(equipmentId)
})

ipcMain.handle('calibration:updateHeader', async (_, id, clientId, createdAt) => {
  return calibrationRepository.updateHeader(id, clientId, createdAt)
})

ipcMain.handle('equipments:getAll', async () => {
  return equipmentsRepository.getAll()
})

ipcMain.handle('equipments:create', async (_, op, ns, name, equipmentType, measurementRange) => {
  return equipmentsRepository.create(op, ns, name, equipmentType, measurementRange)
})

ipcMain.handle('equipments:update', async (_, id, op, ns, name, equipmentType, measurementRange) => {
  return equipmentsRepository.update(id, op, ns, name, equipmentType, measurementRange)
})

ipcMain.handle('equipments:delete', async (_, id) => {
  return equipmentsRepository.delete(id)
})

ipcMain.handle('clients:getAll', async () => {
  return clientsRepository.getAll()
})

ipcMain.handle('clients:create', async (_, company, cnpj, email, adress, city) => {
  return clientsRepository.create(company, cnpj, email, adress, city)
})

ipcMain.handle('clients:update', async (_, id, company, cnpj, email, adress, city) => {
  return clientsRepository.update(id, company, cnpj, email, adress, city)
})

ipcMain.handle('clients:delete', async (_, id) => {
  return clientsRepository.delete(id)
})

ipcMain.handle('templates:getAll', async () => {
  return templatesRepository.getAll()
})

ipcMain.handle('templates:getById', async (_, id) => {
  return templatesRepository.getById(id)
})

ipcMain.handle('templates:create', async (_, template) => {
  return templatesRepository.create(template)
})

ipcMain.handle('templates:update', async (_, id, template) => {
  return templatesRepository.update(id, template)
})

ipcMain.handle('templates:delete', async (_, id) => {
  return templatesRepository.delete(id)
})

ipcMain.handle('standards:getAll', async () => {
  return standardsRepository.getAll()
})

ipcMain.handle('standards:getById', async (_, id) => {
  return standardsRepository.getById(id)
})

ipcMain.handle('standards:create', async (_, standard) => {
  const res = await standardsRepository.create(standard)
  win?.webContents.send('standards:updated')
  return res
})

ipcMain.handle('standards:update', async (_, id, standard) => {
  const res = await standardsRepository.update(id, standard)
  win?.webContents.send('standards:updated')
  return res
})

ipcMain.handle('standards:delete', async (_, id) => {
  const res = await standardsRepository.delete(id)
  win?.webContents.send('standards:updated')
  return res
})

ipcMain.handle('dashboard:getMetrics', async (_, filters) => {
  return dashboardRepository.getMetrics(filters)
})

function createWindow() {
  const iconPath = path.join(__dirname, '../src/assets/logo-calibracao-lhf.png')
  win = new BrowserWindow({
    width: 1600,
    height: 768,
    icon: iconPath,
    title: 'Calibração LHF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.whenReady().then(createWindow)
