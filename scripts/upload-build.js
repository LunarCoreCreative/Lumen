const { app, dialog } = require('electron');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Inicializar Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

const firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'lumen-b4bf0.appspot.com' // Ajuste para seu bucket
});

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

/**
 * Faz upload de um build para o Firebase
 * @param {string} version - Versão (ex: "0.0.7")
 * @param {string} exePath - Caminho para o .exe
 * @param {string} changelog - Notas da versão
 */
async function uploadBuild(version, exePath, changelog = '') {
    try {
        console.log(`📦 Fazendo upload da versão ${version}...`);

        // 1. Verificar se arquivo existe
        if (!fs.existsSync(exePath)) {
            throw new Error(`Arquivo não encontrado: ${exePath}`);
        }

        // 2. Calcular SHA512
        const fileBuffer = fs.readFileSync(exePath);
        const sha512 = crypto.createHash('sha512').update(fileBuffer).digest('hex');
        const fileSize = fs.statSync(exePath).size;

        console.log('✅ SHA512 calculado:', sha512);

        // 3. Upload para Firebase Storage
        const fileName = path.basename(exePath);
        const destination = `releases/v${version}/${fileName}`;
        const bucket = storage.bucket();

        console.log('📤 Fazendo upload para:', destination);

        await bucket.upload(exePath, {
            destination: destination,
            metadata: {
                contentType: 'application/x-msdownload',
                metadata: {
                    version: version,
                    uploadDate: new Date().toISOString()
                }
            }
        });

        // 4. Tornar arquivo público
        const file = bucket.file(destination);
        await file.makePublic();
        const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

        console.log('✅ Upload concluído:', downloadUrl);

        // 5. Atualizar Firestore
        const updateDoc = {
            currentVersion: version,
            releaseDate: new Date().toISOString(),
            downloadUrl: downloadUrl,
            sha512: sha512,
            fileSize: fileSize,
            changelog: changelog || `Release v${version}`
        };

        await db.collection('config').doc('updates').set(updateDoc);
        console.log('✅ Firestore atualizado');

        // 6. Criar latest.yml (para compatibilidade com electron-updater se necessário)
        const latestYml = `version: ${version}
files:
  - url: ${downloadUrl}
    sha512: ${sha512}
    size: ${fileSize}
path: ${fileName}
sha512: ${sha512}
releaseDate: ${new Date().toISOString()}`;

        const ymlPath = path.join(path.dirname(exePath), 'latest.yml');
        fs.writeFileSync(ymlPath, latestYml);

        // Upload do latest.yml
        await bucket.upload(ymlPath, {
            destination: `releases/v${version}/latest.yml`,
            metadata: {
                contentType: 'text/yaml'
            }
        });

        console.log('✅ latest.yml criado e enviado');
        console.log('\n🎉 Build publicado com sucesso!');
        console.log(`Versão: ${version}`);
        console.log(`Download URL: ${downloadUrl}`);

        return {
            version,
            downloadUrl,
            sha512,
            fileSize
        };

    } catch (error) {
        console.error('❌ Erro ao fazer upload:', error);
        throw error;
    }
}

// Se executado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Uso: node upload-build.js <versão> <caminho-do-exe> [changelog]');
        console.log('Exemplo: node upload-build.js 0.0.7 ./dist-electron/Lumen-Setup-0.0.7.exe "Bug fixes"');
        process.exit(1);
    }

    const [version, exePath, changelog] = args;

    uploadBuild(version, exePath, changelog)
        .then(() => {
            console.log('✅ Concluído!');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Erro:', err.message);
            process.exit(1);
        });
}

module.exports = { uploadBuild };
