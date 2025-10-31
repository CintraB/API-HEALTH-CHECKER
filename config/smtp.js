require('dotenv').config();

const SMTP_CONFIG = {
    host: process.env.SMTPHOST,
    port: process.env.SMTPPORT,
    user: process.env.SMTPUSER,
    pass: process.env.SMTPPASS
};

module.exports = SMTP_CONFIG;
