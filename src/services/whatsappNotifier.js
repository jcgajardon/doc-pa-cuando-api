const axios = require('axios');

/**
 * Envía una notificación por WhatsApp usando Callmebot
 * @param {string} message - Mensaje a enviar
 * @param {string} phoneNumber - Número de teléfono con código de país (sin +)
 * @param {string} apiKey - API Key de Callmebot
 * @returns {Promise<boolean>} - True si el mensaje se envió correctamente
 */
const notifyByWhatsApp = async (message, phoneNumber, apiKey) => {
    try {
        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Construir la URL de la API
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apiKey}`;
        
        // Enviar la solicitud
        const response = await axios.get(url);
        
        if (response.status === 200) {
            console.log('✅ Mensaje de WhatsApp enviado correctamente');
            return true;
        } else {
            console.error('❌ Error al enviar mensaje de WhatsApp:', response.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Error al enviar mensaje de WhatsApp:', error.message);
        return false;
    }
};

module.exports = notifyByWhatsApp;