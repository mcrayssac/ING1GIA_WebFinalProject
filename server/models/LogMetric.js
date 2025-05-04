const mongoose = require('mongoose');

const logMetricSchema = new mongoose.Schema({
    // Request details
    method: {
        type: String,
        required: true,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    path: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    responseTime: {
        type: Number,  // in milliseconds
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },

    // Client info
    ip: String,
    userAgent: String,
    origin: String,

    // User context (if authenticated)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Request details
    params: mongoose.Schema.Types.Mixed,
    query: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,

    // Error info (if any)
    error: String,
    errorStack: String
}, {
    timestamps: true
});

// Index for efficient querying
logMetricSchema.index({ timestamp: -1 });
logMetricSchema.index({ method: 1, path: 1 });
logMetricSchema.index({ userId: 1 });
logMetricSchema.index({ statusCode: 1 });

module.exports = mongoose.model(process.env.MONGO_Collection_LogMetric, logMetricSchema);
