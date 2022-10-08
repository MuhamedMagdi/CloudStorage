const config = require('../config');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        auth: config.email.auth,
    });
    const mailOptions = {
        from: config.email.from,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
