const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddlewares');
const LogMetric = require('../models/LogMetric');

// Get metrics with filters and date range (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { 
            startDate, 
            endDate, 
            methods, 
            statuses, 
            paths, 
            origins 
        } = req.query;

        // Build query
        const query = {};

        // Date range
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Method filter
        if (methods && methods.length) {
            query.method = { $in: methods.split(',') };
        }

        // Status filter
        if (statuses && statuses.length) {
            query.statusCode = { $in: statuses.split(',').map(Number) };
        }

        // Path filter
        if (paths && paths.length) {
            query.path = { $in: paths.split(',') };
        }

        // Origin filter
        if (origins && origins.length) {
            query.origin = { $in: origins.split(',') };
        }

        // Get metrics
        const metrics = await LogMetric.find(query)
            .sort({ timestamp: -1 })
            .limit(1000); // Limit to prevent overwhelming response

        // Calculate statistics
        const stats = await LogMetric.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    avgResponseTime: { $avg: '$responseTime' },
                    maxResponseTime: { $max: '$responseTime' },
                    successCount: {
                        $sum: {
                            $cond: [{ $lt: ['$statusCode', 400] }, 1, 0]
                        }
                    },
                    errorCount: {
                        $sum: {
                            $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Get unique values for filters
        const uniqueValues = await Promise.all([
            LogMetric.distinct('method', query),
            LogMetric.distinct('path', query),
            LogMetric.distinct('statusCode', query),
            LogMetric.distinct('origin', query)
        ]);

        res.json({
            metrics,
            stats: stats[0] || {
                totalRequests: 0,
                avgResponseTime: 0,
                maxResponseTime: 0,
                successCount: 0,
                errorCount: 0
            },
            filters: {
                methods: uniqueValues[0],
                paths: uniqueValues[1],
                statuses: uniqueValues[2],
                origins: uniqueValues[3]
            }
        });
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: 'Error fetching metrics' });
    }
});

// Get time series data for charts (admin only)
router.get('/timeseries', verifyToken, isAdmin, async (req, res) => {
    try {
        const { 
            startDate, 
            endDate,
            interval = 'hour', // hour, day, week
            methods,
            statuses,
            paths,
            origins
        } = req.query;

        const query = {};
        
        // Date range
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Method filter
        if (methods && methods.length) {
            query.method = { $in: methods.split(',') };
        }

        // Status filter
        if (statuses && statuses.length) {
            query.statusCode = { $in: statuses.split(',').map(Number) };
        }

        // Path filter
        if (paths && paths.length) {
            query.path = { $in: paths.split(',') };
        }

        // Origin filter
        if (origins && origins.length) {
            query.origin = { $in: origins.split(',') };
        }

        // Define time grouping based on interval
        let timeGroup;
        switch (interval) {
            case 'hour':
                timeGroup = {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' },
                    hour: { $hour: '$timestamp' }
                };
                break;
            case 'day':
                timeGroup = {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' }
                };
                break;
            case 'week':
                timeGroup = {
                    year: { $year: '$timestamp' },
                    week: { $week: '$timestamp' }
                };
                break;
            default:
                timeGroup = {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' },
                    hour: { $hour: '$timestamp' }
                };
        }

        const timeseries = await LogMetric.aggregate([
            { $match: query },
            {
                $group: {
                    _id: timeGroup,
                    count: { $sum: 1 },
                    avgResponseTime: { $avg: '$responseTime' },
                    successCount: {
                        $sum: {
                            $cond: [{ $lt: ['$statusCode', 400] }, 1, 0]
                        }
                    },
                    errorCount: {
                        $sum: {
                            $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json(timeseries);
    } catch (error) {
        console.error('Error fetching timeseries:', error);
        res.status(500).json({ message: 'Error fetching timeseries data' });
    }
});

module.exports = router;
