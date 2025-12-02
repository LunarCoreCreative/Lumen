const { db } = require('../firebase');
const { doc, getDoc } = require('firebase/firestore');
const { app, dialog } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const log = require('electron-log');

// Configurar logging
log.transports.file.level = 'info';

let mainWindow = null;
let currentVersion = null;

/**
 * Inicializa o sistema de autoupdate
 * @param {BrowserWindow} win - Janela principal do aplicativo
 */
function initialize(win) {
    mainWindow = win;

    // Pegar versão do package.json
    const packageJson = require('../package.json');
    currentVersion = packageJson.version;

    log.info('Firebase Auto-Updater inicializado, versão atual:', currentVersion);

    // Verificar atualizações 5 segundos após o app iniciar
    setTimeout(() => {
        checkForUpdates();
    }, 5000);
}

/**
 * Verifica se há atualizações disponíveis
 */
async function checkForUpdates() {
    // Não verificar em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        log.info('Modo desenvolvimento - verificação de updates desabilitada');
        return;
    }

    try {
        log.info('🔍 Verificando atualizações no Firebase...');

        // Buscar informações da última versão no Firestore
        const updateDoc = await getDoc(doc(db, 'config', 'updates'));

        if (!updateDoc.exists()) {
            log.info('Nenhuma informação de update encontrada no Firestore');
            if (mainWindow) {
                mainWindow.webContents.send('update-not-available');
            }
            return;
        }

        const updateData = updateDoc.data();
        const latestVersion = updateData.currentVersion;

        log.info(`Versão atual: ${currentVersion}, Versão disponível: ${latestVersion}`);

        // Comparar versões
        if (compareVersions(latestVersion, currentVersion) > 0) {
            log.info('✨ Nova versão disponível!');

            if (mainWindow) {
                mainWindow.webContents.send('update-available', {
                    version: latestVersion,
                    releaseNotes: updateData.changelog || '',
                    releaseDate: updateData.releaseDate,
                    downloadUrl: updateData.downloadUrl,
                    fileSize: updateData.fileSize,
                    sha512: updateData.sha512
                });
            }
        } else {
            log.info('App está atualizado');
            if (mainWindow) {
                mainWindow.webContents.send('update-not-available');
            }
        }

    } catch (error) {
        log.error('Erro ao verificar atualizações:', error);
        if (mainWindow) {
            mainWindow.webContents.send('update-error', {
                message: `Erro ao verificar atualizações: ${error.message}`
            });
        }
    }
}

/**
 * Inicia o download da atualização
 */
async function downloadUpdate() {
    try {
        log.info('📥 Iniciando download da atualização...');

        // Buscar informações do Firestore novamente
        const updateDoc = await getDoc(doc(db, 'config', 'updates'));
        if (!updateDoc.exists()) {
            throw new Error('Informações de update não encontradas');
        }

        const updateData = updateDoc.data();
        const downloadUrl = updateData.downloadUrl;
        const expectedSha512 = updateData.sha512;
        const totalSize = updateData.fileSize;

        // Definir caminho para download
        const tempDir = app.getPath('temp');
        const fileName = `Lumen-Setup-${updateData.currentVersion}.exe`;
        const downloadPath = path.join(tempDir, fileName);

        // Fazer download
        await downloadFile(downloadUrl, downloadPath, totalSize);

        // Verificar integridade
        log.info('🔐 Verificando integridade do arquivo...');
        const fileSha512 = await calculateSha512(downloadPath);

        if (fileSha512 !== expectedSha512) {
            fs.unlinkSync(downloadPath); // Remover arquivo corrompido
            throw new Error('Verificação de integridade falhou! Arquivo corrompido.');
        }

        log.info('✅ Download concluído e verificado!');

        // Notificar que download foi concluído
        if (mainWindow) {
            mainWindow.webContents.send('update-downloaded', {
                version: updateData.currentVersion,
                path: downloadPath
            });
        }

        // Guardar caminho para instalação
        global.updatePath = downloadPath;

    } catch (error) {
        log.error('Erro ao baixar atualização:', error);
        if (mainWindow) {
            mainWindow.webContents.send('update-error', {
                message: `Erro ao baixar atualização: ${error.message}`
            });
        }
    }
}

/**
 * Instala a atualização e reinicia o app
 */
function installUpdate() {
    if (!global.updatePath || !fs.existsSync(global.updatePath)) {
        log.error('Arquivo de atualização não encontrado');
        return;
    }

    log.info('🚀 Instalando atualização...');

    // Executar instalador
    execFile(global.updatePath, ['/S'], (error) => {
        if (error) {
            log.error('Erro ao executar instalador:', error);
        }
    });

    // Fechar app após 1 segundo
    setTimeout(() => {
        app.quit();
    }, 1000);
}

/**
 * Faz download de um arquivo com progresso
 */
function downloadFile(url, dest, totalSize) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        let downloadedSize = 0;

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Falha no download: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                const percent = totalSize ? (downloadedSize / totalSize) * 100 : 0;

                if (mainWindow) {
                    mainWindow.webContents.send('download-progress', {
                        percent: percent,
                        transferred: downloadedSize,
                        total: totalSize
                    });
                }
            });

            file.on('finish', () => {
                file.close();
                resolve();
            });

        }).on('error', (err) => {
            fs.unlink(dest, () => { }); // Remover arquivo parcial
            reject(err);
        });
    });
}

/**
 * Calcula SHA512 de um arquivo
 */
function calculateSha512(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha512');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

/**
 * Compara duas versões semânticas
 * @returns {number} 1 se v1 > v2, -1 se v1 < v2, 0 se iguais
 */
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0;
}

module.exports = {
    initialize,
    checkForUpdates,
    downloadUpdate,
    installUpdate
};
