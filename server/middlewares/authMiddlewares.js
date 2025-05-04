const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');
const RewardAction = require('../models/RewardAction');

const warning = chalk.keyword('orange');
const success = chalk.bold.green;

// Process reward points asynchronously
const processReward = async (userId, path) => {
    try {
        const user = await User.findById(userId).populate('grade');
        if (!user || !user.grade || user.grade.name !== 'Apprentice') {
            return;
        }

        const rewardAction = await RewardAction.findOne({
            path,
            isActive: true
        });

        if (!rewardAction) {
            return;
        }

        // Add points to user
        user.points += rewardAction.points;
        await user.save();
        console.log(`Reward processed for user ${userId}: +${rewardAction.points} points`);
    } catch (error) {
        console.error('Error processing reward:', error);
    }
};

// Basic Authentication Middleware
const authenticateUser = async (req, res, next) => {
    // Get Authorization header
    const authHeader = req.headers['authorization'];

    // Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).send('Basic authentication required');
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    try {
        // Find user by username
        const user = await User.findOne({ username });

        // Check if user exists and password is correct
        if (user && await bcrypt.compare(password, user.password)) {
            setImmediate(() => {
                // Process reward after successful authentication
                processReward(user._id, "login");
            });

            console.log(success('Authentication successful'));
            req.user = user;
            next();
        } else {
            console.log(warning('Invalid Authentication'));
            res.status(401).send('Invalid Authentication');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// JWT Authentication Middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (!token) return res.status(401).send('Access token missing');

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            // Try refreshing token
            if (!refreshToken) return res.status(401).send('Refresh token missing');

            jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
                if (err) {
                    console.log(warning('Refresh token invalid'));
                    return res.status(403).send('Invalid refresh token');
                }

                try {
                    const userFromDb = await User.findById(decoded._id);
                    if (!userFromDb) return res.status(403).send('User not found');

                    // Generate new access token
                    const newAccessToken = jwt.sign({ _id: userFromDb._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
                    res.cookie('token', newAccessToken, {
                        httpOnly: true,
                        sameSite: 'Lax',
                        secure: false
                    });

                    console.log(success('Access token refreshed'));
                    req.user = userFromDb;
                    
                    // Process reward after successful token refresh
                    setImmediate(() => {
                        processReward(userFromDb._id, req.originalUrl.split('/')[2]);
                    });
                    
                    next();
                } catch (err) {
                    res.status(500).send('Token refresh failed');
                }
            });
        } else if (err) {
            return res.status(403).send('Invalid token');
        } else {
            try {
                // Fetch user from database to get complete user data including admin status
                const userFromDb = await User.findById(user._id);
                if (!userFromDb) return res.status(403).send('User not found');
                req.user = userFromDb;
                
                // Process reward after successful token verification
                setImmediate(() => {
                    processReward(userFromDb._id, req.originalUrl.split('/')[2]);
                });
                
                next();
            } catch (err) {
                res.status(500).send('Error fetching user data');
            }
        }
    });
};

// Admin Middleware
const isAdmin = async (req, res, next) => {
    // Find user by id and check if admin
    const user = await User.findById(req.user._id);
    if (user.admin) next();
    else res.status(403).send('Admin access required');
};

module.exports = {
    authenticateUser,
    verifyToken,
    isAdmin
};
