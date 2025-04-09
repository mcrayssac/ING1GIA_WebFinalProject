const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');

const warning = chalk.keyword('orange');
const success = chalk.bold.green;

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
    // console.log('Token:', token);
    // console.log('Refresh Token:', refreshToken);

    if (!token) return res.status(401).send('Access token missing');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err && err.name === 'TokenExpiredError') {
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
                        secure: false,
                        maxAge: 15 * 60 * 1000
                    });

                    console.log(success('Access token refreshed'));
                    req.user = userFromDb;
                    next();
                } catch (err) {
                    res.status(500).send('Token refresh failed');
                }
            });
        } else if (err) {
            return res.status(403).send('Invalid token');
        } else {
            req.user = user;
            next();
        }
    });
};

// Admin Middleware
const isAdmin = async (req, res, next) => {
    // Find user by id and check if admin
    const user = await User.findById(req.user._id);
    if (user.admin) next();
    else res.status(403).send('Admin access required');
}

module.exports = {
    authenticateUser,
    verifyToken,
    isAdmin
};