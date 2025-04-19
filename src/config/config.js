require("dotenv").config();
const path = require("path");
const fs = require("fs");

// Load doctors from the config JSON file
const doctors = JSON.parse(
    fs.readFileSync(path.join(__dirname, "doctors.json"), "utf8")
);

module.exports = {
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    EMAIL_TO: process.env.EMAIL_TO,
    SECOND_EMAIL: process.env.SECOND_EMAIL,
    PATIENT_RUT: process.env.PATIENT_RUT,
    doctors, // all doctor configurations
};
