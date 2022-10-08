const config = require('./../config');
const { connect, connection } = require('mongoose');

module.exports = async () => {
    await connect(
        `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}`
    );
    console.log('Connected to the database.');
    process.on('exit', function () {
        connection.close();
    });
};
