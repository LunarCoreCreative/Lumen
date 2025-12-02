const { db } = require('../firebase');
const { doc, setDoc } = require('firebase/firestore');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FormData = require('form-data');

// Configuração do Cloudinary
const CLOUD_NAME = 'dasntpbd3';
const UPLOAD_PRESET = 'ml_default'; // Usando preset signed existente

/**
 * Faz upload de um build para o Cloudinary e atualiza Firestore
 * @param {string} version - Versão (ex: "0.0.7")
 * @param {string} exePath - Caminho para o .exe
 * @param {string} changelog - Notas da versão
 */
async function uploadBuild(version, exePath, changelog = '') {
    try {
        console.log(`📦 Fazendo upload da versão ${version} para Cloudinary...`);

        // 1. Verificar se arquivo existe
        if (!fs.existsSync(exePath)) {
            throw new Error(`Arquivo não encontrado: ${exePath}`);
        }

        // 2. Calcular SHA512 e obter tamanho
        const fileBuffer = fs.readFileSync(exePath);
        const sha512 = crypto.createHash('sha512').update(fileBuffer).digest('hex');
        const fileSize = fs.statSync(exePath).size;

        console.log('✅ SHA512 calculado:', sha512);
        console.log('📏 Tamanho do arquivo:', (fileSize / 1024 / 1024).toFixed(2), 'MB');

        // 3. Upload para Cloudinary
        const fileName = path.basename(exePath);
        const publicId = `lumen/releases/v${version}/${fileName.replace(/\s+/g, '_')}`;

        console.log('📤 Fazendo upload para Cloudinary...');

        const downloadUrl = await uploadToCloudinary(exePath, publicId);

        console.log('✅ Upload concluído:', downloadUrl);

        // 4. Atualizar Firestore
        const updateDoc = {
            currentVersion: version,
            releaseDate: new Date().toISOString(),
            downloadUrl: downloadUrl,
            sha512: sha512,
            fileSize: fileSize,
            changelog: changelog || `Release v${version}`,
            fileName: fileName
        };

        await setDoc(doc(db, 'config', 'updates'), updateDoc);
        console.log('✅ Firestore atualizado');

        console.log('\n🎉 Build publicado com sucesso!');
        console.log(`Versão: ${version}`);
        console.log(`Download URL: ${downloadUrl}`);
        console.log(`SHA512: ${sha512}`);

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

/**
 * Faz upload de um arquivo para o Cloudinary
 * @param {string} filePath - Caminho do arquivo
 * @param {string} publicId - ID público no Cloudinary
 * @returns {Promise<string>} URL do arquivo
 */
function uploadToCloudinary(filePath, publicId) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('upload_preset', UPLOAD_PRESET);
        form.append('public_id', publicId);
        form.append('resource_type', 'raw'); // Para arquivos que não são imagens

        const options = {
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${CLOUD_NAME}/raw/upload`,
            method: 'POST',
            headers: form.getHeaders()
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response.secure_url);
                } else {
                    reject(new Error(`Upload falhou: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        form.pipe(req);
    });
}

// Se executado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Uso: node upload-build-cloudinary.js <versão> <caminho-do-exe> [changelog]');
        console.log('Exemplo: node upload-build-cloudinary.js 0.0.7 "./dist-electron/Lumen Setup 0.0.7.exe" "Bug fixes"');
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
