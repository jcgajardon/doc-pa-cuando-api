const nodemailer = require("nodemailer");
const { GMAIL_USER, GMAIL_PASS, EMAIL_TO, SECOND_EMAIL } = require("../config/config");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
    },
});

const notifyByEmail = async (message) => {
    try {
        await transporter.sendMail({
            from: `"DocPaCuándo 🧠" <${GMAIL_USER}>`,
            to: `${EMAIL_TO}, ${SECOND_EMAIL}`,
            subject: "🩺 Appointment available at Clínica Dávila!",
            html: `<p>${message}</p><p><a href="https://agendaweb.davila.cl/" target="_blank">Book now</a></p>`,
        });
        console.log("✅ Email sent.");
    } catch (err) {
        console.error("❌ Failed to send email:", err);
    }
};

module.exports = notifyByEmail;
