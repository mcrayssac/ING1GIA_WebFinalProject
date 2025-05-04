const LogMetric = require('../models/LogMetric');
const chalk = require('chalk');

const datetime = chalk.bold.yellow;
const routes = chalk.bold.magenta;
const info = chalk.bold.cyan;
const debug = chalk.bold.gray;

const loggingMiddleware = async (req, res, next) => {
    // Record start time
    const startTime = Date.now();

    // Store original end function to wrap it
    const originalEnd = res.end;
    let responseBody = '';

    // Override end function to capture response
    res.end = function(chunk, encoding) {
        if (chunk) {
            responseBody += chunk;
        }
        
        originalEnd.apply(res, arguments);

        // Calculate response time
        const responseTime = Date.now() - startTime;

        // Create metric log
        const logMetric = new LogMetric({
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            origin: req.headers.origin,
            userId: req.user?._id,
            params: req.params,
            query: req.query,
            body: req.method !== 'GET' ? req.body : undefined
        });

        // Save metric asynchronously
        setImmediate(async () => {
            try {
                await logMetric.save();

                // Console logging
                console.log("");
                console.log(datetime('DateTime:', new Date().toLocaleString()));
                console.log(routes(`[${req.method}] ${req.originalUrl}`));
                console.log(info(`ip: ${req.ip}, origin: ${req.headers.origin}`));
                console.log(info(`Response Time: ${responseTime}ms, Status: ${res.statusCode}`));

                if (process.env.DEBUG === 'true') {
                    console.log("");
                    console.log(debug(`Params: ${JSON.stringify(req.params)}`));
                    console.log(debug(`Query: ${JSON.stringify(req.query)}`));
                    console.log(debug(`Body: ${JSON.stringify(req.body)}`));
                    console.log(debug(`Headers: ${JSON.stringify(req.headers)}`));
                    console.log("");
                }
            } catch (error) {
                console.error('Error saving log metric:', error);
            }
        });
    };

    // Error handling
    const errorHandler = error => {
        if (error) {
            const logMetric = new LogMetric({
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                responseTime: Date.now() - startTime,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                origin: req.headers.origin,
                userId: req.user?._id,
                error: error.message,
                errorStack: error.stack
            });

            setImmediate(async () => {
                try {
                    await logMetric.save();
                } catch (err) {
                    console.error('Error saving error log metric:', err);
                }
            });
        }
    };

    res.on('error', errorHandler);

    next();
};

module.exports = loggingMiddleware;
