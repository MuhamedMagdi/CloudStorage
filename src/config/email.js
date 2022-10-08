const dotenv = require('dotenv');

dotenv.config();

const email = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL,
};

module.exports = email;
