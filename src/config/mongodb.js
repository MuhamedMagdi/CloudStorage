const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    protocol: process.env.MONGODB_PROTOCOL,
    host: process.env.MONGODB_HOST,
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
};
