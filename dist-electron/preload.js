let electron = require("electron");
//#region electron/preload.ts
console.log("[Preload] Injetando a ponte de comunicação segura...");
electron.contextBridge.exposeInMainWorld("electron", {
	authLogin: (email, password) => {
		console.log("[Preload] Roteando chamada de Login para a IPC");
		return electron.ipcRenderer.invoke("auth:login", email, password);
	},
	authRegister: (name, email, password, signatureBase64) => {
		console.log("[Preload] Roteando chamada de Registro para a IPC");
		return electron.ipcRenderer.invoke("auth:register", name, email, password, signatureBase64);
	},
	saveCalibration: (data) => {
		console.log("[Preload] Roteando saveCalibration para a IPC");
		return electron.ipcRenderer.invoke("calibration:save", data);
	},
	getCalibrationHistory: (equipmentId) => {
		console.log("[Preload] Buscando histórico de calibração para o equipamento...", equipmentId);
		return electron.ipcRenderer.invoke("calibration:getByEquipment", equipmentId);
	},
	updateCalibrationHeader: (id, clientId, createdAt) => {
		console.log("[Preload] Solicitando atualização de cabeçalho de calibração...", {
			id,
			clientId,
			createdAt
		});
		return electron.ipcRenderer.invoke("calibration:updateHeader", id, clientId, createdAt);
	},
	getEquipments: () => {
		console.log("[Preload] Buscando lista de equipamentos...");
		return electron.ipcRenderer.invoke("equipments:getAll");
	},
	createEquipment: (op, ns, name, equipmentType, measurementRange) => {
		console.log("[Preload] Solicitando criação de equipamento...", {
			op,
			ns,
			name,
			equipmentType,
			measurementRange
		});
		return electron.ipcRenderer.invoke("equipments:create", op, ns, name, equipmentType, measurementRange);
	},
	updateEquipment: (id, op, ns, name, equipmentType, measurementRange) => {
		console.log("[Preload] Solicitando atualização de equipamento...", {
			id,
			op,
			ns,
			name,
			equipmentType,
			measurementRange
		});
		return electron.ipcRenderer.invoke("equipments:update", id, op, ns, name, equipmentType, measurementRange);
	},
	deleteEquipment: (id) => {
		console.log("[Preload] Solicitando exclusão de equipamento...", id);
		return electron.ipcRenderer.invoke("equipments:delete", id);
	},
	getClients: () => {
		console.log("[Preload] Buscando lista de clientes...");
		return electron.ipcRenderer.invoke("clients:getAll");
	},
	createClient: (company, cnpj, email, adress, city) => {
		console.log("[Preload] Solicitando criação de cliente...", {
			company,
			cnpj,
			email,
			adress,
			city
		});
		return electron.ipcRenderer.invoke("clients:create", company, cnpj, email, adress, city);
	},
	updateClient: (id, company, cnpj, email, adress, city) => {
		console.log("[Preload] Solicitando atualização de cliente...", {
			id,
			company,
			cnpj,
			email,
			adress,
			city
		});
		return electron.ipcRenderer.invoke("clients:update", id, company, cnpj, email, adress, city);
	},
	deleteClient: (id) => {
		console.log("[Preload] Solicitando exclusão de cliente...", id);
		return electron.ipcRenderer.invoke("clients:delete", id);
	},
	getTemplates: () => {
		console.log("[Preload] Buscando todos os templates de formulários...");
		return electron.ipcRenderer.invoke("templates:getAll");
	},
	getTemplateById: (id) => {
		console.log("[Preload] Buscando template pelo ID:", id);
		return electron.ipcRenderer.invoke("templates:getById", id);
	},
	createTemplate: (template) => {
		console.log("[Preload] Solicitando criação de template...", template);
		return electron.ipcRenderer.invoke("templates:create", template);
	},
	updateTemplate: (id, template) => {
		console.log("[Preload] Solicitando atualização de template...", {
			id,
			template
		});
		return electron.ipcRenderer.invoke("templates:update", id, template);
	},
	deleteTemplate: (id) => {
		console.log("[Preload] Solicitando exclusão de template...", id);
		return electron.ipcRenderer.invoke("templates:delete", id);
	},
	getStandards: () => {
		console.log("[Preload] Buscando todos os padrões de referência...");
		return electron.ipcRenderer.invoke("standards:getAll");
	},
	getStandardById: (id) => {
		console.log("[Preload] Buscando padrão pelo ID:", id);
		return electron.ipcRenderer.invoke("standards:getById", id);
	},
	createStandard: (standard) => {
		console.log("[Preload] Solicitando criação de padrão...", standard);
		return electron.ipcRenderer.invoke("standards:create", standard);
	},
	updateStandard: (id, standard) => {
		console.log("[Preload] Solicitando atualização de padrão...", {
			id,
			standard
		});
		return electron.ipcRenderer.invoke("standards:update", id, standard);
	},
	deleteStandard: (id) => {
		console.log("[Preload] Solicitando exclusão de padrão...", id);
		return electron.ipcRenderer.invoke("standards:delete", id);
	},
	onStandardsUpdated: (callback) => {
		console.log("[Preload] Registrando ouvinte de atualização de padrões...");
		const subscription = () => callback();
		electron.ipcRenderer.on("standards:updated", subscription);
		return () => {
			electron.ipcRenderer.removeListener("standards:updated", subscription);
		};
	},
	getDashboardMetrics: (filters) => {
		console.log("[Preload] Solicitando métricas do dashboard...", filters);
		return electron.ipcRenderer.invoke("dashboard:getMetrics", filters);
	},
	on: (channel, listener) => {
		electron.ipcRenderer.on(channel, listener);
	},
	removeListener: (channel, listener) => {
		electron.ipcRenderer.removeListener(channel, listener);
	}
});
//#endregion
