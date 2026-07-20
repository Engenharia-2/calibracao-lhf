let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electron", {
	authLogin: (username, password) => electron.ipcRenderer.invoke("auth:login", username, password),
	saveCalibration: (data) => electron.ipcRenderer.invoke("calibration:save", data),
	on: (channel, listener) => {
		electron.ipcRenderer.on(channel, listener);
	},
	removeListener: (channel, listener) => {
		electron.ipcRenderer.removeListener(channel, listener);
	}
});
//#endregion
