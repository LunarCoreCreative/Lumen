/**
 * Script para atualizar Firestore automaticamente após publicação no GitHub
 * Lê o latest.yml gerado pelo electron-builder e extrai SHA512 + URL
 * 
 * USO:
 * - Local: node scripts/update-firestore-from-release.js
 * - CI/CD: Executado automaticamente pelo GitHub Actions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');


// Firebase config (via environment variables ou arquivo local)
const FIREBASE_CONFIG = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

// GitHub config
const GITHUB_REPO = 'LunarCoreCreative/Lumen';

async function main() {
    try {
        console.log('🚀 Iniciando atualização do Firestore...\n');

        // 1. Ler package.json para obter a versão
        const packageJson = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
        );
        const version = packageJson.version;
        console.log(`📦 Versão detectada: ${version}`);

        // 2. Ler latest.yml gerado pelo electron-builder
        const latestYmlPath = path.join(__dirname, '..', 'dist-electron', 'latest.yml');

        if (!fs.existsSync(latestYmlPath)) {
            throw new Error(`❌ Arquivo latest.yml não encontrado em: ${latestYmlPath}\n   Execute o build primeiro: npm run build:win`);
        }

        const latestYmlContent = fs.readFileSync(latestYmlPath, 'utf8');
        console.log(`✅ latest.yml encontrado\n`);

        // 3. Parsear o YAML
        const releaseInfo = parseLatestYml(latestYmlContent);
        console.log('📋 Informações extraídas:');
        console.log(`   - Versão: ${releaseInfo.version}`);
        console.log(`   - Arquivo: ${releaseInfo.fileName}`);
        console.log(`   - SHA512: ${releaseInfo.sha512.substring(0, 20)}...`);
        console.log(`   - Tamanho: ${(releaseInfo.fileSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   - URL: ${releaseInfo.downloadUrl}\n`);

        // 4. Validar credenciais do Firebase
        if (!FIREBASE_CONFIG.project_id || !FIREBASE_CONFIG.client_email || !FIREBASE_CONFIG.private_key) {
            console.error('❌ Credenciais do Firebase não configuradas!');
            console.log('\n📝 Configure as variáveis de ambiente:');
            console.log('   - FIREBASE_PROJECT_ID');
            console.log('   - FIREBASE_CLIENT_EMAIL');
            console.log('   - FIREBASE_PRIVATE_KEY\n');
            process.exit(1);
        }

        // 5. Atualizar Firestore
        console.log('📝 Atualizando Firestore...');
        await updateFirestore({
            currentVersion: releaseInfo.version,
            releaseDate: new Date().toISOString(),
            downloadUrl: releaseInfo.downloadUrl,
            sha512: releaseInfo.sha512,
            fileSize: releaseInfo.fileSize,
            changelog: `Release v${releaseInfo.version}`,
            fileName: releaseInfo.fileName
        });

        console.log('✅ Firestore atualizado com sucesso!\n');
        console.log('🎉 Processo concluído! Os usuários receberão a atualização automaticamente.\n');

    } catch (error) {
        console.error(`\n❌ Erro: ${error.message}\n`);
        process.exit(1);
    }
}

/**
 * Parseia o latest.yml gerado pelo electron-builder
 */
function parseLatestYml(ymlContent) {
    const lines = ymlContent.split('\n');
    const data = {};

    // Extrair versão
    const versionLine = lines.find(l => l.startsWith('version:'));
    if (versionLine) {
        data.version = versionLine.split(':')[1].trim();
    }

    // Extrair informações do arquivo (primeira entrada em 'files')
    const filesIndex = lines.findIndex(l => l.startsWith('files:'));
    if (filesIndex !== -1) {
        // Procurar por 'url:', 'sha512:', 'size:' após 'files:'
        for (let i = filesIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('url:')) {
                data.fileName = line.split(':')[1].trim();
            } else if (line.startsWith('sha512:')) {
                data.sha512 = line.split(':')[1].trim();
            } else if (line.startsWith('size:')) {
                data.fileSize = parseInt(line.split(':')[1].trim());
            }

            // Se encontramos todos os campos, podemos parar
            if (data.fileName && data.sha512 && data.fileSize) {
                break;
            }
        }
    }

    // Construir URL de download do GitHub
    if (data.version && data.fileName) {
        data.downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${data.version}/${data.fileName}`;
    }

    // Validar dados extraídos
    if (!data.version || !data.fileName || !data.sha512 || !data.fileSize) {
        throw new Error('Falha ao extrair informações do latest.yml. Verifique o formato do arquivo.');
    }

    return data;
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
