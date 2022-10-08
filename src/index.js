const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const mongodb = require('./database');
const config = require('./config');
const routes = require('./routes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});

const app = express();
const port = config.app.port || 3000;

mongodb();

app.use(helmet());

if (config.app.env === 'dev') {
    app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());

app.use('/api/v1', routes);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
