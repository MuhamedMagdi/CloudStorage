const config = require('./../config');
const { connect, connection } = require('mongoose');

module.exports = async () => {
    await connect(
        `${config.mongodb.protocol}://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}`
    );
    console.log('Connected to the database.');
    process.on('exit', function () {
        connection.close();
    });
};
