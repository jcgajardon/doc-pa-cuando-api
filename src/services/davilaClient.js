const axios = require("axios");
const https = require("https");

const checkAvailability = async (spec_id, doc_id, office_id) => {
    const body = new URLSearchParams({
        spec_id: spec_id,
        doc_id: doc_id,
        office_id: office_id,
        search_for: "",
        source: "ajax",
        patient_rut: process.env.PATIENT_RUT,
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
                accept: "*/*",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://agendaweb.davila.cl/davila?&source=ajax",
            withCredentials: true,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        }
    );

    return response.data.data;
};

module.exports = checkAvailability;
