const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddlewares');
const LogMetric = require('../models/LogMetric');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');
const { ObjectId } = mongoose.Types;

// Get user activity metrics (admin only)
router.get('/:userId/activity', verifyToken, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const query = { userId: new ObjectId(userId) };
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Get basic user info
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get activity metrics
        const [activityResults, loginStats] = await Promise.all([
            LogMetric.aggregate([
                { $match: query },
                { $sort: { timestamp: -1 } },
                {
                    $group: {
                        _id: null,
                        totalRequests: { $sum: 1 },
                        avgResponseTime: { $avg: '$responseTime' },
                        successCount: {
                            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
                        },
                        errorCount: {
                            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
                        },
                        lastActive: { $max: '$timestamp' },
                        topPaths: { 
                            $push: {
                                path: '$path',
                                method: '$method',
                                timestamp: '$timestamp',
                                statusCode: '$statusCode'
                            }
                        }
                    }
                }
            ]),
            LogMetric.aggregate([
                { 
                    $match: { 
                        userId: new ObjectId(userId),
                        path: '/api/users/login',
                        statusCode: { $lt: 400 }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$timestamp' },
                            month: { $month: '$timestamp' },
                            day: { $dayOfMonth: '$timestamp' },
                        },
                        count: { $sum: 1 },
                        date: { $first: '$timestamp' }
                    }
                },
                { $sort: { date: -1 } },
                { $limit: 30 }
            ])
        ]);

        // Format response
        const activity = activityResults[0] || {
            totalRequests: 0,
            avgResponseTime: 0,
            successCount: 0,
            errorCount: 0,
            lastActive: null,
            topPaths: []
        };

        // Limit topPaths to last 100 requests for better performance
        activity.topPaths = activity.topPaths.slice(0, 100);

        res.json({
            user,
            activity: {
                ...activity,
                loginHistory: loginStats,
                successRate: activity.totalRequests 
                    ? (activity.successCount / activity.totalRequests * 100).toFixed(1) 
                    : 0
            }
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ message: 'Error fetching user activity' });
    }
});

// Get users with activity summary (admin only)
router.get('/activity/summary', verifyToken, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Get all users first
        const users = await User.find().select('-password');

        // Build activity query
        const query = {};
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Get activity summary for all users
        const activitySummary = await LogMetric.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$userId',
                    totalRequests: { $sum: 1 },
                    successCount: {
                        $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
                    },
                    errorCount: {
                        $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
                    },
                    lastActive: { $max: '$timestamp' }
                }
            }
        ]);

        // Combine user data with activity data
        const summary = users.map(user => {
            const activity = activitySummary.find(a => a._id?.toString() === user._id.toString()) || {
                totalRequests: 0,
                successCount: 0,
                errorCount: 0,
                lastActive: null
            };

            return {
                ...user.toObject(),
                activity: {
                    ...activity,
                    successRate: activity.totalRequests 
                        ? (activity.successCount / activity.totalRequests * 100).toFixed(1) 
                        : 0
                }
            };
        });

        res.json(summary);
    } catch (error) {
        console.error('Error fetching users activity summary:', error);
        res.status(500).json({ message: 'Error fetching users activity summary' });
    }
});

module.exports = router;
