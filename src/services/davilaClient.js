const axios = require("axios");
const https = require("https");
const cheerio = require("cheerio"); // Necesitarás instalar esta dependencia

const checkAvailability = async (spec_id, doc_id, office_id) => {
    const body = new URLSearchParams({
        spec_id: spec_id,
        doc_id: doc_id,
        office_id: office_id,
        search_for: "",
        source: "ajax",
        patient_rut: process.env.PATIENT_RUT || "",
        isapre: "",
        multiple_spec_id: "",
        multiple_office_id: "",
        spec_name: "Neurologia Infantil",
    });

    try {
        const response = await axios.post(
            "https://agendaweb.davila.cl/api/v1/search/6803c5738221ea874006def4",
            body.toString(),
            {
                headers: {
                    accept: "*/*",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "x-requested-with": "XMLHttpRequest",
                },
                referrer: "https://agendaweb.davila.cl/davila?&source=ajax",
                withCredentials: true,
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error en la solicitud:", error.message);
        throw error;
    }
};

// Función para extraer información detallada de las horas disponibles
const extractAvailabilityInfo = async (data, doctor) => {
    // Si no hay datos o contiene el mensaje de no disponibilidad
    if (!data || !data.data || data.data.includes("no cuenta con horas disponibles")) {
        return {
            available: false,
            appointments: [],
            message: `No hay citas disponibles con ${doctor.name} en este momento.`
        };
    }

    try {
        // Usar cheerio para analizar el HTML
        const $ = cheerio.load(data.data);
        const appointments = [];

        // Extraer información de las horas disponibles
        $("#result-hours .hour").each((index, element) => {
            const date = $(element).find(".date").text().trim();
            const time = $(element).find(".time").text().trim();
            const center = $(element).find(".center").text().trim();
            
            appointments.push({
                date,
                time,
                center
            });
        });

        // Si no encontramos citas en el resultado inicial, intentamos obtener más información
        if (appointments.length === 0) {
            try {
                // Obtener fechas disponibles del calendario
                const calendarResponse = await axios.get(
                    "https://agendaweb.davila.cl/api/v1/create_calendar/682605f33f29f4a32fd149e9",
                    {
                        headers: {
                            accept: "*/*",
                            "x-requested-with": "XMLHttpRequest",
                        },
                        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                    }
                );
                
                if (calendarResponse.data && calendarResponse.data.data && calendarResponse.data.data.length > 0) {
                    // Tomar hasta 5 fechas para no sobrecargar
                    const availableDates = calendarResponse.data.data.slice(0, 5);
                    
                    // Para cada fecha, obtener las horas disponibles
                    for (const dateStr of availableDates) {
                        const formattedDate = formatDateForRequest(dateStr);
                        
                        const hoursBody = new URLSearchParams({
                            spec_id: doctor.spec_id,
                            doc_id: doctor.doc_id,
                            office_id: doctor.office_id,
                            date: formattedDate,
                            source: "ajax",
                            spec_name: "Neurologia Infantil"
                        });
                        
                        const hoursResponse = await axios.post(
                            "https://agendaweb.davila.cl/api/v1/propose_hours/682605f33f29f4a32fd149e9",
                            hoursBody.toString(),
                            {
                                headers: {
                                    accept: "*/*",
                                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                                    "x-requested-with": "XMLHttpRequest",
                                },
                                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                            }
                        );
                        
                        if (hoursResponse.data && hoursResponse.data.data) {
                            const $hours = cheerio.load(hoursResponse.data.data);
                            
                            $hours(".available-hours .detail ul li").each((idx, el) => {
                                const hour = $hours(el).find(".hour").text().trim();
                                const doctorName = $hours(el).find(".doctor").text().trim();
                                const center = $hours(el).find(".center").text().trim();
                                
                                appointments.push({
                                    date: convertDateFormat(dateStr),
                                    time: hour,
                                    doctor: doctorName,
                                    center
                                });
                            });
                        }
                    }
                }
            } catch (calendarError) {
                console.error("Error al obtener información adicional:", calendarError.message);
                // Continuamos con lo que tengamos hasta ahora
            }
        }

        // Preparar mensaje para el correo
        let message = "";
        if (appointments.length > 0) {
            message = `✅ ¡Hay ${appointments.length} cita(s) disponible(s) con ${doctor.name}!\n\n`;
            
            appointments.forEach((apt, index) => {
                message += `${index + 1}. ${apt.date} - ${apt.time}\n`;
                message += `   Centro: ${apt.center}\n`;
                if (apt.doctor) {
                    message += `   Doctor: ${apt.doctor}\n`;
                }
                message += "\n";
            });
            
            message += "Revisa la página web lo antes posible: https://agendaweb.davila.cl/";
        } else {
            message = `❌ No se encontraron citas disponibles con ${doctor.name} en este momento.`;
        }

        return {
            available: appointments.length > 0,
            appointments,
            message
        };
    } catch (error) {
        console.error("Error al extraer información:", error.message);
        return {
            available: true, // Asumimos que hay disponibilidad pero no pudimos extraer detalles
            appointments: [],
            message: `✅ ¡Hay una cita disponible con ${doctor.name}, pero no pudimos extraer los detalles. Revisa la página web lo antes posible: https://agendaweb.davila.cl/`
        };
    }
};

// Función auxiliar para formatear fechas
function formatDateForRequest(dateStr) {
    // Convertir formato YYYY-MM-DD a MM/DD/YYYY
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
}

// Función auxiliar para convertir formato de fecha
function convertDateFormat(dateStr) {
    // Convertir formato YYYY-MM-DD a una fecha más legible
    const [year, month, day] = dateStr.split('-');
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const monthName = months[parseInt(month) - 1];
    return `${day} de ${monthName} de ${year}`;
}

module.exports = {
    checkAvailability,
    extractAvailabilityInfo
};
