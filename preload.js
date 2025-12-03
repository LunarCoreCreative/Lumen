const { contextBridge, ipcRenderer } = require('electron');

try {
    contextBridge.exposeInMainWorld('electronAPI', {
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
            console.log('PRELOAD: Recebido update-available do Main');
            ipcRenderer.on('update-available', (event, info) => {
                console.log('PRELOAD: Repassando update-available para o Renderer', info);
                callback(info);
            });
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
    });
    console.log('✅ ContextBridge exposto com sucesso!');
} catch (error) {
    console.error('❌ Erro ao expor ContextBridge:', error);
}
