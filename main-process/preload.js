console.error('🚀 PRELOAD SCRIPT INICIADO (ERROR LEVEL)!');
try {
    // alert('Preload script rodando!'); // Descomente se quiser um popup chato
} catch (e) {
    console.error('Erro no alert:', e);
}

const { contextBridge, ipcRenderer } = require('electron');

console.log('🚀 Preload script carregou módulos!');
console.log('ContextBridge:', contextBridge);
console.log('IpcRenderer:', ipcRenderer);

const api = {
    // APIs de controle de janela
    resizeWindow: (width, height) => ipcRenderer.send('resize-window', width, height),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),

    // APIs de autoupdate
    checkForUpdates: () => ipcRenderer.send('check-for-updates'),
    downloadUpdate: () => ipcRenderer.send('download-update'),
    installUpdate: () => ipcRenderer.send('install-update'),

    // Listeners de eventos de update
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', (event, info) => callback(info));
    },
    onUpdateNotAvailable: (callback) => {
        ipcRenderer.on('update-not-available', () => callback());
    },
    onUpdateError: (callback) => {
        ipcRenderer.on('update-error', (event, error) => callback(error));
    },
    onDownloadProgress: (callback) => {
        ipcRenderer.on('download-progress', (event, progress) => callback(progress));
    },
    onUpdateDownloaded: (callback) => {
        ipcRenderer.on('update-downloaded', (event, info) => callback(info));
    }
};

// Tentar usar contextBridge se disponível, senão jogar no window direto
try {
    contextBridge.exposeInMainWorld('electronAPI', api);
} catch (error) {
    console.log('ContextBridge falhou (provavelmente contextIsolation: false), expondo no window direto.');
    window.electronAPI = api;
}
