import { compressImage } from './compressImage';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dasntpbd3/image/upload';
const UPLOAD_PRESET = 'lumen_uploads';

/**
 * Faz upload de uma imagem para o Cloudinary.
 * @param {File} file - O arquivo de imagem a ser enviado.
 * @returns {Promise<string>} - A URL da imagem enviada.
 */
export const uploadToCloudinary = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Falha no upload da imagem');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Erro no upload para Cloudinary:", error);
        throw error;
    }
};

export { compressImage };
