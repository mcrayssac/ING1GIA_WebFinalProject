const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { authenticateUser, verifyToken, isAdmin } = require('../middlewares/authMiddlewares');

/**
 * @route POST /.../users/login
 * @desc Authenticates a user using their credentials and returns a JWT token.
 * @access Public
 *
 * @usage Example request:
 * POST /.../users/login
 * Content-Type: application/json
 * {
 *   "username": "user",
 *   "password": "password"
 * }
 *
 * @returns {JSON} { token: "JWT token string" }
 */
router.post('/login', authenticateUser, (req, res) => {
    // The authenticateUser middleware validate the credentials and attach the user to req.user
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

/**
 * @route POST /.../users/register
 * @desc Registers a new user, ensuring they are not an admin by default, and returns a JWT token.
 * @access Public
 *
 * @usage Example request:
 * POST /.../users/register
 * Headers:
 *   Authorization: Basic <base64 encoded username:password>
 * Content-Type: application/json
 * 
 * @returns {JSON} { token: "JWT token string" }
 */
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);

        // Set admin to false
        user.admin = false;

        // Verify if user already exists
        const existing = await User.findOne({ username: user.username });
        if (existing) return res.status(409).send('User already exists');

        await user.save();

        // Do login and return JWT and send 201 user created with token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @route GET /.../users/infos
 * @desc Retrieves the information (username and admin status) of the authenticated user.
 * @access Private (requires a valid JWT token in the Authorization header)
 *
 * @usage Example request:
 * GET /.../users/infos
 * Headers:
 *   Authorization: Bearer <JWT token>
 *
 * @returns {JSON} { username: "user", admin: false }
 */
router.get('/infos', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ username: user.username, admin: user.admin });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @route POST /.../users/admin/reset
 * @desc Resets a specified user's password to a randomly generated one.
 *       Only accessible by admin users.
 * @access Private (admin only; requires a valid JWT token with admin privileges)
 *
 * @usage Example request:
 * POST /.../users/admin/reset
 * Headers:
 *   Authorization: Bearer <JWT token>
 * Content-Type: application/json
 * {
 *   "userId": "id_of_user_to_reset"
 * }
 *
 * @returns {JSON} {
 *   message: "Password reset successfully",
 *   user: { ...updatedUserData },
 *   newPassword: "randomlyGeneratedPassword"
 * }
 */
router.post('/admin/reset', verifyToken, isAdmin, async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Generate a random password
        const randomPassword = Math.random().toString(36).slice(-8);

        // Update the user's password
        user.password = randomPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully', user, newPassword: randomPassword });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @route GET /.../users/verify
 * @desc Verifies the provided JWT token and returns the user's admin status.
 * @access Private (requires a valid JWT token in the Authorization header)
 *
 * @usage Example request:
 * GET /.../users/verify
 * Headers:
 *   Authorization: Bearer <JWT token>
 *
 * @returns {JSON} { admin: true } or { admin: false }
 */
router.get('/verify', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.admin) {
            res.status(200).json({ admin: true });
        } else {
            res.status(200).json({ admin: false });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @route GET /.../users/
 * @desc Retrieves a list of all registered users.
 *       This endpoint is restricted to admin users only.
 * @access Private (admin only; requires a valid JWT token with admin privileges)
 *
 * @usage Example request:
 * GET /.../users/
 * Headers:
 *   Authorization: Bearer <JWT token>
 *
 * @returns {JSON} Array of user objects
 */
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
