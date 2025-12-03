const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const updater = require('./github-updater');

// ... (rest of the file remains the same until app.whenReady)

app.whenReady().then(async () => {
    createWindow();

    // Verificação de atualização apenas em produção
    const isDev = process.env.NODE_ENV === 'development';

    // if (!isDev) { // Comentado para teste em dev
    // Aguardar janela estar pronta
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inicializar autoupdate system
    const win2 = BrowserWindow.getAllWindows()[0];
    if (win2) {
        updater.initialize(win2);
    }
    // }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


ipcMain.on('resize-window', (event, width, height) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        }
        win.setSize(width, height, true);
        win.center();
    }
});

ipcMain.on('maximize-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    }
});

ipcMain.on('minimize-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.minimize();
    }
});

ipcMain.on('close-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.close();
    }
});



// Handlers de autoupdate
ipcMain.on('check-for-updates', (event) => {
    updater.checkForUpdates(event.sender);
});

ipcMain.on('download-update', (event) => {
    updater.downloadUpdate(event.sender);
});

ipcMain.on('install-update', (event) => {
    updater.installUpdate(event.sender);
});

// Handler para obter versão do app
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});



function createWindow() {
    const preloadPath = path.join(app.getAppPath(), 'preload.js');

    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        resizable: true,
        backgroundColor: '#1a1a1a',
        frame: true,
        autoHideMenuBar: true,
        title: 'Lumen', // Título da janela
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webSecurity: false,
            preload: preloadPath
        },
    });

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        win.loadURL('http://localhost:5173');
    } else {
        // Em produção, servir via HTTP local (localhost) para compatibilidade total com Firebase Auth e Google OAuth
        const http = require('http');
        const handler = require('serve-handler');

        const server = http.createServer((request, response) => {
            return handler(request, response, {
                public: path.join(__dirname, '../dist'),
                rewrites: [
                    { source: '**', destination: '/index.html' } // Support for client-side routing if needed
                ]
            });
        });

        server.listen(0, () => {
            const port = server.address().port;
            console.log(`Server running at http://localhost:${port}`);
            win.loadURL(`http://localhost:${port}`);
        });
    }

    // Customizar abertura de novas janelas (Popups como o do Google Login)
    win.webContents.setWindowOpenHandler(({ url }) => {
        // Permitir popups do Google OAuth
        if (url.includes('accounts.google.com') || url.includes('firebase')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    autoHideMenuBar: true,
                    backgroundColor: '#ffffff', // Fundo branco para o Google
                    width: 500,
                    height: 600,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                }
            };
        }

        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                autoHideMenuBar: true,
                backgroundColor: '#131316',
            }
        };
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
