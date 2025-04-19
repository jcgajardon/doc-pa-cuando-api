const { doctors } = require("./config/config");
const notifyByEmail = require("./services/emailNotifier");
const checkAvailability = require("./services/davilaClient");

(async () => {
    try {
        // Loop through all doctors
        for (const doctor of doctors) {
            const { spec_id, doc_id, office_id, name } = doctor;

            console.log(`Checking availability for: ${name}`);

            const html = await checkAvailability(spec_id, doc_id, office_id);

            if (!html.includes("no cuenta con horas disponibles")) {
                console.log(`🚨 Appointment available for ${name}!`);
                await notifyByEmail(`¡Hay una cita disponible con ${name}. Revisa la página web lo antes posible.`);
            } else {
                console.log(`[${new Date().toLocaleString()}] ❌ No appointments available for ${name} yet.`);
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
