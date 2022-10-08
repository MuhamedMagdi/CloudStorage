const dotenv = require('dotenv');

dotenv.config();

const app = {
    port: process.env.PORT,
    env: process.env.ENV,
    bcryptPaper: process.env.BCRYPT_PAPER,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
};

module.exports = app;
