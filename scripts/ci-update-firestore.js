/**
 * Script para CI/CD - Atualização do Firestore com info do GitHub Release
 * Usado pelo GitHub Actions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Firebase config (via environment variables)
const FIREBASE_CONFIG = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

// GitHub config
const GITHUB_REPO = 'LunarCoreCreative/Lumen';

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Uso: node ci-update-firestore.js <versão> [changelog]');
        process.exit(1);
    }

    const version = args[0];
    const changelog = args[1] || `Release v${version}`;

    try {
        console.log(`🚀 Atualizando Firestore para versão ${version}...`);

        // 1. Encontrar o arquivo .exe
        const distDir = path.join(__dirname, '..', 'dist-electron');
        const files = fs.readdirSync(distDir);
        const exeFile = files.find(f => f.endsWith('.exe') && f.includes('Setup'));

        if (!exeFile) {
            throw new Error('Arquivo .exe não encontrado em dist-electron/');
        }

        const exePath = path.join(distDir, exeFile);
        console.log(`📦 Arquivo encontrado: ${exeFile}`);

        // 2. Calcular SHA512 e tamanho
        const fileBuffer = fs.readFileSync(exePath);
        const sha512 = crypto.createHash('sha512').update(fileBuffer).digest('hex');
        const fileSize = fs.statSync(exePath).size;

        console.log(`✅ SHA512: ${sha512.substring(0, 16)}...`);
        console.log(`📏 Tamanho: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

        // 3. URL do GitHub Release
        const downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${exeFile}`;
        console.log(`🔗 Download URL: ${downloadUrl}`);

        // 4. Atualizar Firestore
        console.log(`📝 Atualizando Firestore...`);
        await updateFirestore({
            currentVersion: version,
            releaseDate: new Date().toISOString(),
            downloadUrl: downloadUrl,
            sha512: sha512,
            fileSize: fileSize,
            changelog: changelog,
            fileName: exeFile
        });

        console.log(`✅ Firestore atualizado`);
        console.log(`\n🎉 Release ${version} publicada com sucesso!`);

    } catch (error) {
        console.error(`❌ Erro:`, error.message);
        process.exit(1);
    }
}

/**
 * Atualiza Firestore via REST API
 */
async function updateFirestore(data) {
    return new Promise((resolve, reject) => {
        // Criar JWT token para autenticar com Firebase
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            {
                iss: FIREBASE_CONFIG.client_email,
                sub: FIREBASE_CONFIG.client_email,
                aud: 'https://firestore.googleapis.com/',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600
            },
            FIREBASE_CONFIG.private_key,
            { algorithm: 'RS256' }
        );

        const payload = JSON.stringify({
            fields: {
                currentVersion: { stringValue: data.currentVersion },
                releaseDate: { stringValue: data.releaseDate },
                downloadUrl: { stringValue: data.downloadUrl },
                sha512: { stringValue: data.sha512 },
                fileSize: { integerValue: String(data.fileSize) },
                changelog: { stringValue: data.changelog },
                fileName: { stringValue: data.fileName }
            }
        });

        const options = {
            hostname: 'firestore.googleapis.com',
            path: `/v1/projects/${FIREBASE_CONFIG.project_id}/databases/(default)/documents/config/updates`,
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    reject(new Error(`Firestore update falhou: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Executar
main();
