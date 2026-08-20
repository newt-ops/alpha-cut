import { config } from '../config/env.js';
export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';
    const isProd = config.nodeEnv === 'production';
    // Mongoose CastError (Invalid ObjectId parameter format)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid format for field '${err.path}': ${err.value}`;
    }
    // Mongoose ValidationError
    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        const firstErrorKey = Object.keys(err.errors)[0];
        message = err.errors[firstErrorKey]?.message || 'Validation failed';
    }
    // MongoDB Duplicate Key Error (E11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `An account or record with that ${field} already exists.`;
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(isProd ? {} : { stack: err.stack }),
    });
};
