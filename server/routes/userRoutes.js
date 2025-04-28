const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const { authenticateUser, verifyToken, isAdmin } = require('../middlewares/authMiddlewares');

// Helper to convert data URL to Buffer and extract content type
function dataURLToBuffer(dataURL) {
    const matches = dataURL.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    return { buffer, contentType };
}

// Helper to convert Buffer to data URL
function bufferToDataURL(buffer, contentType) {
    return `data:${contentType};base64,${buffer.toString("base64")}`;
}

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
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);
    // console.log("REFRESH_SECRET:", process.env.REFRESH_SECRET);

    // The authenticateUser middleware validate the credentials and attach the user to req.user
    const accessToken = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ _id: req.user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('token', accessToken, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
        maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true });
});

/**
 * @route POST /.../users/logout
 * @desc Logs out the user by clearing the JWT token and refresh token cookies.
 * @access Public
 *
 * @usage Example request:
 * POST /.../users/logout
 *
 * @returns {JSON} { message: "Logged out" }
 */
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.send('Logged out');
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
        let user = await User.findById(req.user._id).populate('grade').select('-password -__v');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Convert Mongoose document to plain object
        user = user.toObject();

        // Convert the Map to a plain object
        if (user.urls && user.urls instanceof Map) {
            user.urls = Object.fromEntries(user.urls);
        }

        // If a photo exists, convert the Buffer to a base64 string with the proper data URL prefix
        if (user.photo && user.photo.data && user.photo.contentType) {
            user.photo = bufferToDataURL(user.photo.data, user.photo.contentType);
        }

        res.json(user);
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
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find().select('-password -__v');

        if (!users) {
            return res.status(404).json({ error: 'No users found' });
        }

        // Convert Mongoose documents to plain objects
        const usersData = users.map(user => user.toObject());

        // Convert the Map to a plain object for each user
        usersData.forEach(user => {
            if (user.urls && user.urls instanceof Map) {
                user.urls = Object.fromEntries(user.urls);
            }
            // If a photo exists, convert the Buffer to a base64 string with the proper data URL prefix
            if (user.photo && user.photo.data && user.photo.contentType) {
                user.photo = bufferToDataURL(user.photo.data, user.photo.contentType);
            }
        });

        res.json(usersData);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @route PUT /.../users/:id
 * @desc Updates the specified user's information.
 *       This endpoint is restricted to admin users or the user themselves.
 * @access Private (user or admin; requires a valid JWT token)
 * 
 * @usage Example request:
 * PUT /.../users/:id
 * Headers:
 *   Authorization: Bearer <JWT token>
 * 
 * @returns {JSON} Updated user object
 */
router.put("/infos/:id", verifyToken, async (req, res) => {
    // Check if the user is an admin or the user themselves
    if (req.user._id.toString() !== req.params.id && !req.user.admin) {
        return res.status(403).json({ error: "Forbidden" });
    }

    // Proceed with the update
    try {
        const { username, email, bio, urls, dob, location, photo } = req.body;

        const updateData = { username, email, bio, urls, dob, location };

        if (photo) {
            const photoData = dataURLToBuffer(photo);
            if (photoData) {
                updateData.photo = {
                    data: photoData.buffer,
                    contentType: photoData.contentType,
                };
            }
        } else {
            updateData.photo = null;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route PUT /.../users/update-password
 * @desc Updates the authenticated user's password.
 * @access Private (requires a valid JWT token)
 *
 * @usage Example request:
 * PUT /.../users/update-password
 * Headers:
 *   Authorization: Bearer <JWT token>
 * Content-Type: application/json
 * {
 *   "oldPassword": "oldpassword",
 *   "newPassword": "newpassword"
 * }
 *
 * @returns {JSON} { message: "Password updated successfully" }
 */
router.put("/password", verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Both old and new passwords are required" });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Compare old password with the hashed password in DB
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Old password is incorrect" });
        }
        // Set new password – pre-save hook will hash it automatically
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
