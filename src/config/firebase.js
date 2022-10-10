const dotenv = require('dotenv');

dotenv.config();

const firebase = {
    accountPath: process.env.ACCOUNT_PATH,
    storageBucket: process.env.STORAGE_BUCKET,
};

module.exports = firebase;
