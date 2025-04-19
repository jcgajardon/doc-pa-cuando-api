require("dotenv").config();
const axios = require("axios");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// CONFIGURACIÓN
const CHECK_INTERVAL = '0 8,12,16,20 * * *'; // Ejecutar a las 08:00, 12:00, 16:00 y 20:00 todos los días
//const CHECK_INTERVAL = '0 7-20 * * 1-5'; // Ejecutar cada hora de 07:00 a 20:00, lunes a viernes
const {
    GMAIL_USER,
    GMAIL_PASS,
    EMAIL_TO,
    SECOND_EMAIL,
    PATIENT_RUT,
    DOC_ID,
    SPEC_ID,
    OFFICE_ID
} = process.env;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    }
});

const notifyByEmail = async (message) => {
    try {
        await transporter.sendMail({
            from: `"DocPaCuándo 🧠" <${GMAIL_USER}>`,
            to: `${EMAIL_TO}, ${SECOND_EMAIL}`,  // Añadir el segundo destinatario aquí
            subject: "¡Hora disponible en Clínica Dávila!",
            html: `<p>${message}</p><p><a href="https://agendaweb.davila.cl/" target="_blank">Ir a agendar</a></p>`,
        });
        console.log("✅ Correo enviado.");
    } catch (err) {
        console.error("❌ Error al enviar el correo:", err);
    }
};



const checkAvailability = async () => {
    try {
        const body = new URLSearchParams({
            spec_id: SPEC_ID,
            doc_id: DOC_ID,
            office_id: OFFICE_ID,
            search_for: "",
            source: "ajax",
            patient_rut: PATIENT_RUT,
            isapre: "",
            multiple_spec_id: "",
            multiple_office_id: "",
            spec_name: "Neurologia Infantil",
        });

        const response = await axios.post(
            "https://agendaweb.davila.cl/api/v1/search/6803c5738221ea874006def4",
            body.toString(),
            {
                headers: {
                    "accept": "*/*",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "x-requested-with": "XMLHttpRequest"
                },
                referrer: "https://agendaweb.davila.cl/davila?&source=ajax",
                withCredentials: true,
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false  // Deshabilita la verificación SSL
                })
            }
        );


        const html = response.data.data;

        if (!html.includes("no cuenta con horas disponibles")) {
            console.log("🚨 ¡Hay hora disponible!");
            await notifyByEmail("¡El doctor tiene una hora disponible! Revisa el sitio lo antes posible.");
        } else {
            console.log(`[${new Date().toLocaleString()}] ❌ Sin disponibilidad aún.`);
            // Enviar el correo siempre, incluso si no hay disponibilidad
            await notifyByEmail("❌ No hay disponibilidad de horas en este momento. Revisa más tarde.");
        }

    } catch (error) {
        console.error("❌ Error en la consulta:", error.message);
    }
};

// Agendamos la tarea con el cron
cron.schedule(CHECK_INTERVAL, () => {
    console.log("🕒 Ejecutando verificación...");
    checkAvailability();
}, {
    scheduled: true,
    timezone: "America/Santiago"  // Establecer la zona horaria de Santiago de Chile
});


// Consulta inicial al ejecutar
checkAvailability();
