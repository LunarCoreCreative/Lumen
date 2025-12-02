/**
 * Script para CI/CD - Upload para Cloudinary e atualização do Firestore
 * Usado pelo GitHub Actions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FormData = require('form-data');

// Configurações do Cloudinary (via environment variables)
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dasntpbd3';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Firebase config (via environment variables)
const FIREBASE_CONFIG = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Uso: node ci-upload-cloudinary.js <versão> [changelog]');
        process.exit(1);
    }

    const version = args[0];
    const changelog = args[1] || `Release v${version}`;

    try {
        console.log(`🚀 Iniciando upload da versão ${version}...`);

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

        // 3. Upload para Cloudinary
        const publicId = `lumen/releases/v${version}/${exeFile.replace(/\s+/g, '_')}`;
        console.log(`📤 Fazendo upload para Cloudinary...`);

        const downloadUrl = await uploadToCloudinary(exePath, publicId);
        console.log(`✅ Upload concluído: ${downloadUrl}`);

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
 * Faz upload para Cloudinary com assinatura
 */
function uploadToCloudinary(filePath, publicId) {
    return new Promise((resolve, reject) => {
        const timestamp = Math.round(Date.now() / 1000);

        // Criar assinatura
        const signature = crypto
            .createHash('sha1')
            .update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)
            .digest('hex');

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('public_id', publicId);
        form.append('timestamp', timestamp);
        form.append('api_key', API_KEY);
        form.append('signature', signature);
        form.append('resource_type', 'raw');

        const options = {
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${CLOUD_NAME}/raw/upload`,
            method: 'POST',
            headers: form.getHeaders()
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response.secure_url);
                } else {
                    reject(new Error(`Upload falhou: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', reject);
        form.pipe(req);
    });
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
