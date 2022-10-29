const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const config = require('../config');

const serviceAccount = require(process.env.ACCOUNT_PATH);

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: config.firebase.storageBucket,
});

const bucket = getStorage().bucket();

exports.upload = async (file, fileName) => {
    return await bucket.file(fileName).save(file);
};

exports.download = async (fileName) => {
    return await bucket.file(fileName).download();
};

exports.checkIfExists = async (fileName) => {
    return await bucket.file(fileName).exists();
};

exports.remove = async (fileName) => {
    return await bucket.file(fileName).delete();
};
