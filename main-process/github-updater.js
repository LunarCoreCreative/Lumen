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

    // Pegar versão do app (mais confiável que require package.json)
    currentVersion = app.getVersion();

    log.info('GitHub Auto-Updater inicializado, versão atual:', currentVersion);

    // Verificar atualizações 5 segundos após o app iniciar
    setTimeout(() => {
        checkForUpdates();
    }, 5000);
}

/**
 * Verifica se há atualizações disponíveis
 */
let isUpdateInProgress = false;

/**
 * Verifica se há atualizações disponíveis
 */
async function checkForUpdates() {
    if (isUpdateInProgress) return;

    // Não verificar em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        log.info('Modo desenvolvimento - verificação de updates desabilitada');
        return;
    }

    isUpdateInProgress = true;

    try {
        log.info('🔍 Verificando atualizações no Firestore...');

        // Importar firebase apenas quando necessário
        const { db } = require('./firebase-main');
        const { doc, getDoc } = require('firebase/firestore');

        // Buscar informações da última versão no Firestore
        const updateDoc = await getDoc(doc(db, 'config', 'updates'));

        if (!updateDoc.exists()) {
            log.info('Nenhuma informação de update encontrada no Firestore');
            if (mainWindow) {
                mainWindow.webContents.send('update-not-available');
            }
            isUpdateInProgress = false;
            return;
        }

        const updateData = updateDoc.data();
        const latestVersion = updateData.currentVersion;

        log.info(`Versão atual (app.getVersion): ${currentVersion}`);
        log.info(`Versão no Firestore: ${latestVersion}`);
        log.info(`Dados do Firestore:`, JSON.stringify(updateData, null, 2));

        // Comparar versões
        if (compareVersions(latestVersion, currentVersion) > 0) {
            log.info('✨ Nova versão disponível!');

            if (mainWindow) {
                // Enviar evento para a UI (UpdateNotification.jsx)
                mainWindow.webContents.send('update-available', {
                    version: latestVersion,
                    changelog: updateData.changelog || ''
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
    } finally {
        isUpdateInProgress = false;
    }
}

/**
 * Inicia o download da atualização do GitHub Releases
 */
async function downloadUpdate() {
    // Se já estiver baixando, não faz nada (ou avisa)
    // isUpdateInProgress é setado no checkForUpdates, mas se o download for chamado separado,
    // precisamos garantir que não haja conflito.
    // Como o fluxo agora é quebrado, o isUpdateInProgress do checkForUpdates já deve ter virado false.
    // Vamos usar uma nova flag ou reutilizar com cuidado.

    if (isUpdateInProgress) {
        log.warn('Download já em andamento ou verificação ativa.');
        return;
    }
    isUpdateInProgress = true;

    try {
        log.info('📥 Iniciando download da atualização do GitHub...');

        // Importar firebase apenas quando necessário
        const { db } = require('./firebase-main');
        const { doc, getDoc } = require('firebase/firestore');

        // Buscar informações do Firestore
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
        const fileName = updateData.fileName || `Lumen-Setup-${updateData.currentVersion}.exe`;
        const downloadPath = path.join(tempDir, fileName);

        // Fazer download
        await downloadFile(downloadUrl, downloadPath, totalSize);

        // Verificar integridade
        log.info('🔐 Verificando integridade do arquivo...');
        const fileSha512Hex = await calculateSha512(downloadPath);

        // Converter o hash esperado (que pode estar em Base64) para Hex para comparação
        let expectedHex = expectedSha512;

        // Se o hash esperado terminar com =, provavelmente é Base64
        if (expectedSha512.endsWith('=') || expectedSha512.length === 88) {
            try {
                expectedHex = Buffer.from(expectedSha512, 'base64').toString('hex');
                log.info('ℹ️ Hash convertido de Base64 para Hex');
            } catch (e) {
                log.warn('Falha ao converter hash de Base64, usando como está.');
            }
        }

        log.info(`Hash Arquivo (Hex): ${fileSha512Hex}`);
        log.info(`Hash Esperado (Hex): ${expectedHex}`);

        if (fileSha512Hex !== expectedHex) {
            fs.unlinkSync(downloadPath); // Remover arquivo corrompido
            throw new Error(`Verificação de integridade falhou!\nHash calculado: ${fileSha512Hex}\nHash esperado: ${expectedHex}`);
        }

        log.info('✅ Download concluído e verificado!');

        // Guardar caminho para instalação
        global.updatePath = downloadPath;

        // Avisar UI que o download terminou
        if (mainWindow) {
            mainWindow.webContents.send('update-downloaded', {
                version: updateData.currentVersion,
                path: downloadPath
            });
        }

    } catch (error) {
        log.error('Erro ao baixar atualização:', error);

        if (mainWindow) {
            // Enviar erro para a UI em vez de dialog nativo
            mainWindow.webContents.send('update-error', {
                message: `Erro ao baixar atualização: ${error.message}`
            });
        }
    } finally {
        isUpdateInProgress = false;
    }
}

/**
 * Instala a atualização e reinicia o app
 */
function installUpdate() {
    if (!global.updatePath || !fs.existsSync(global.updatePath)) {
        log.error('Arquivo de atualização não encontrado');
        if (mainWindow) {
            dialog.showErrorBox('Erro na Instalação', 'Arquivo de atualização não encontrado.');
        }
        return;
    }

    log.info('🚀 Instalando atualização...');

    // Avisar o usuário
    if (mainWindow) {
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            title: 'Instalando',
            message: 'O aplicativo será fechado para iniciar a instalação.',
            buttons: ['OK']
        });
    }

    // Executar instalador (sem /S para mostrar a interface e possíveis erros)
    // Usar spawn em vez de execFile para garantir que o processo se solte do pai
    const { spawn } = require('child_process');
    const subprocess = spawn(global.updatePath, [], {
        detached: true,
        stdio: 'ignore'
    });

    subprocess.unref();

    // Fechar app
    app.quit();
}

/**
 * Faz download de um arquivo com progresso
 */
function downloadFile(url, dest, totalSize) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        let downloadedSize = 0;

        const download = (downloadUrl) => {
            https.get(downloadUrl, (response) => {
                // Seguir redirects (GitHub usa redirects para releases)
                if (response.statusCode === 301 || response.statusCode === 302) {
                    download(response.headers.location);
                    return;
                }

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
        };

        download(url);
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
