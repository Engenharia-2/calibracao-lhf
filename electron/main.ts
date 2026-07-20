import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { ApiAuthRepository } from '../src/services/auth/ApiAuthRepository'
import { AuthService } from '../src/domain/auth/AuthService'
import { ApiCalibrationRepository } from '../src/services/calibration/ApiCalibrationRepository'
import { ApiEquipmentsRepository } from '../src/services/equipments/ApiEquipmentsRepository'
import { ApiClientsRepository } from '../src/services/clients/ApiClientsRepository'
import { ApiTemplatesRepository } from '../src/services/templates/ApiTemplatesRepository'

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

// Setup IPC handlers
ipcMain.handle('auth:login', async (_, email, password) => {
  return authService.login(email, password)
})

ipcMain.handle('auth:register', async (_, name, email, password) => {
  return authService.register(name, email, password)
})

ipcMain.handle('calibration:save', async (_, data) => {
  return calibrationRepository.save(data)
})

ipcMain.handle('calibration:getByEquipment', async (_, equipmentId) => {
  return calibrationRepository.getByEquipmentId(equipmentId)
})

ipcMain.handle('equipments:getAll', async () => {
  return equipmentsRepository.getAll()
})

ipcMain.handle('equipments:create', async (_, op, ns, name) => {
  return equipmentsRepository.create(op, ns, name)
})

ipcMain.handle('clients:getAll', async () => {
  return clientsRepository.getAll()
})

ipcMain.handle('clients:create', async (_, company, cnpj, email) => {
  return clientsRepository.create(company, cnpj, email)
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

function createWindow() {
  const iconPath = path.join(__dirname, '../src/assets/logo-calibracao.png')
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
