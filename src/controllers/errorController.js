const config = require('../config');
const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path}: ${error.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateKeyDB = (error) => {
    const key = Object.keys(error.keyValue)[0];
    const value = error.keyValue[key];
    const message = `Duplicate ${key} value: ${value} already exists. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
    return new AppError(error.message, 400);
};

const handleJWTError = () => {
    return new AppError('Invalid token. Please login again!', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please login again.', 401);
};

const sendDevError = (err, req, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendProdError = (err, req, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (config.app.env === 'dev') {
        sendDevError(err, req, res);
    } else if (config.app.env === 'prod') {
        let error = { ...err };
        error.message = err.message;
        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (err.code === 11000) {
            error = handleDuplicateKeyDB(error);
        }
        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        sendProdError(error, req, res);
    }
};
