const { doctors } = require("./config/config");
const notifyByEmail = require("./services/emailNotifier");
const notifyByWhatsApp = require("./services/whatsappNotifier");
const { checkAvailability, extractAvailabilityInfo } = require("./services/davilaClient");

// Configuración para WhatsApp
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || ""; // Tu número de teléfono con código de país (sin +)
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || ""; // Tu API Key de Callmebot

(async () => {
    try {
        // Loop through all doctors
        for (const doctor of doctors) {
            const { spec_id, doc_id, office_id, name } = doctor;

            console.log(`Checking availability for: ${name}`);

            const responseData = await checkAvailability(spec_id, doc_id, office_id);
            const availabilityInfo = await extractAvailabilityInfo(responseData, doctor);

            if (availabilityInfo.available) {
                console.log(`🚨 Appointment available for ${name}!`);
                console.log(`Found ${availabilityInfo.appointments.length} appointments`);
                
                // Enviar correo con información detallada
                await notifyByEmail(availabilityInfo.message);
                
                // Enviar WhatsApp si está configurado
                if (WHATSAPP_PHONE && WHATSAPP_API_KEY) {
                    await notifyByWhatsApp(availabilityInfo.message, WHATSAPP_PHONE, WHATSAPP_API_KEY);
                }
            } else {
                console.log(`[${new Date().toLocaleString()}] ❌ No appointments available for ${name} yet.`);
                // Opcional: puedes comentar esta línea para no enviar correos cuando no hay citas
                await notifyByEmail(`❌ No hay citas disponibles con ${name} en este momento. Por favor, revisa nuevamente más tarde.`);
            }
        }

        // Ensure the process exits after all tasks are done
        console.log("✅ Process completed successfully.");
        process.exit(0); // Exit the process with a success status

    } catch (error) {
        console.error("❌ Error during availability check:", error.message);
        process.exit(1); // Exit with an error status if something went wrong
    }
})();
