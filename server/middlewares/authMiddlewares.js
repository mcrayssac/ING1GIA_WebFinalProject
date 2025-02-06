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
    // Get token from Authorization header
    const token = req.headers['authorization'];
    // console.log("Token : ", token);

    // Check if token is present
    if (!token) return res.status(401).send('Token required');
  
    // Verify token
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
        // If token is invalid, return 403
        if (err) {
            console.log(warning('Access denied'));
            return res.status(403).send('Invalid token');
        }

        // If token is valid, log success and call next middleware
        console.log(success('Access granted'));
        req.user = user;
        next();
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