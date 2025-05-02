const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Grade = require('../models/Grade');
const Employee = require('../models/Employee');
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
    res.json({ message: "Logged out successfully" });
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
        if (existing) return res.status(409).json({ error: "User already exists" });

        await user.save();

        // Do login and return JWT and send 201 user created with token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        let user = await User.findById(req.user._id)
            .populate('grade')
            .populate({
                path: 'employee',
                populate: {
                    path: 'site'
                }
            })
            .select('-password -__v');
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
        res.status(500).json({ error: error.message || "An unexpected error occurred" });
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
        const user = await User.findById(userId).populate('grade');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate a random password
        const randomPassword = Math.random().toString(36).slice(-8);

        // Update the user's password
        user.password = randomPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully', user, newPassword: randomPassword });
    } catch (error) {
        res.status(500).json({ error: error.message || "An unexpected error occurred" });
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
// Get user counts by grade (admin only)
router.get('/counts-by-grade', verifyToken, isAdmin, async (req, res) => {
    try {
        const grades = await Grade.find();
        const userCounts = {};

        // Initialize counts for all grades to 0
        grades.forEach(grade => {
            userCounts[grade.name] = 0;
        });

        // Create query based on user role and exclude current user
        const query = {
            _id: { $ne: req.user._id }, // Exclude current user
            ...(req.user.admin ? {} : { admin: false }) // Add admin filter if not admin
        };
        const users = await User.find(query).populate('grade');

        // Count users for each grade
        users.forEach(user => {
            if (user.grade) {
                userCounts[user.grade.name] = (userCounts[user.grade.name] || 0) + 1;
            }
        });

        res.json(userCounts);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch user counts" });
    }
});

router.get('/verify', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('grade');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ admin: !!user.admin });
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to verify user status" });
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
        // Create query based on user role and exclude current user
        const query = {
            _id: { $ne: req.user._id }, // Exclude current user
            ...(req.user.admin ? {} : { admin: false }) // Add admin filter if not admin
        };
        const users = await User.find(query)
            .populate('grade')
            .populate({
                path: 'employee',
                populate: {
                    path: 'site'
                }
            })
            .select('-password -__v');

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
        res.status(500).json({
            error: error.message || "Failed to fetch users",
            details: error.name === "MongooseError" ? "Database error occurred" : undefined
        });
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

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('grade');
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

// Delete user (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        // Prevent deleting own account
        if (req.user._id.toString() === req.params.id) {
            return res.status(403).json({ error: "Cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: `User ${user.username} deleted successfully` });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        res.status(500).json({ error: error.message || "Failed to delete user" });
    }
});

/**
 * @route POST /.../users/create-with-existing-employee
 * @desc Creates a new user and links it to an existing employee
 * @access Private (admin only)
 */
router.post('/create-with-existing-employee', verifyToken, isAdmin, async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            admin = false,
            location,
            bio,
            grade,
            employeeId
        } = req.body;

        // Validate required fields
        if (!username || !email || !password || !employeeId) {
            return res.status(400).json({
                error: "Missing required fields",
                details: "Username, email, password, and employee ID are required"
            });
        }

        // Verify employee exists and isn't already linked
        const employee = await Employee.findById(employeeId).populate('site');
        if (!employee) {
            return res.status(404).json({
                error: "Employee not found",
                details: "The specified employee does not exist"
            });
        }

        const existingUser = await User.findOne({ employee: employeeId });
        if (existingUser) {
            return res.status(409).json({
                error: "Employee already linked",
                details: "This employee is already linked to a user account"
            });
        }

        // Create the user
        try {
            const selectedGrade = grade ?
                await Grade.findById(grade) :
                await Grade.findOne({ name: "Apprentice" });

            if (grade && !selectedGrade) {
                throw new Error("Invalid grade selected");
            }

            const user = new User({
                username,
                email,
                password,
                admin,
                location,
                bio,
                employee: employee._id,
                grade: selectedGrade ? selectedGrade._id : null
            });

            await user.save();

            // Fetch the complete user data with populated fields
            const createdUser = await User.findById(user._id)
                .populate('grade')
                .populate({
                    path: 'employee',
                    populate: {
                        path: 'site'
                    }
                });

            res.status(201).json(createdUser);
        } catch (err) {
            if (err.code === 11000) {
                // Duplicate key error
                const field = Object.keys(err.keyPattern)[0];
                return res.status(409).json({
                    error: "Duplicate user data",
                    details: `A user with this ${field} already exists`,
                    field
                });
            }
            throw err;
        }
    } catch (error) {
        res.status(500).json({
            error: "Failed to create user",
            details: error.message,
            code: error.code
        });
    }
});

/**
 * @route POST /.../users/create-with-employee
 * @desc Creates a new user along with their employee record
 * @access Private (admin only)
 */
router.post('/create-with-employee', verifyToken, isAdmin, async (req, res) => {
    try {
        const {
            // User data
            username,
            email,
            password,
            admin = false,
            location,
            bio,
            grade,
            // Employee data
            employeeId,
            department,
            position,
            office,
            contractType,
            site,
            hireDate
        } = req.body;

        // Validate required fields
        if (!username || !email || !password || !employeeId || !department || !position || !office || !site) {
            return res.status(400).json({
                error: "Missing required fields",
                details: "All fields are required except hire date"
            });
        }

        // Create employee first
        let employee;
        try {
            employee = new Employee({
                employeeId,
                email,
                department,
                position,
                office,
                contractType,
                site,
                hireDate: hireDate || new Date()
            });
            await employee.save();
        } catch (err) {
            // Handle employee-specific errors
            if (err.code === 11000) {
                // Duplicate key error
                const field = Object.keys(err.keyPattern)[0];
                return res.status(409).json({
                    error: "Duplicate employee data",
                    details: `An employee with this ${field} already exists`,
                    field
                });
            }
            throw err;
        }

        // Then create the user
        try {
            const selectedGrade = grade ?
                await Grade.findById(grade) :
                await Grade.findOne({ name: "Apprentice" });

            if (grade && !selectedGrade) {
                throw new Error("Invalid grade selected");
            }

            const user = new User({
                username,
                email,
                password,
                admin,
                location,
                bio,
                employee: employee._id,
                grade: selectedGrade ? selectedGrade._id : null
            });

            await user.save();

            // Fetch the complete user data with populated fields
            const createdUser = await User.findById(user._id)
                .populate('grade')
                .populate({
                    path: 'employee',
                    populate: {
                        path: 'site'
                    }
                });

            res.status(201).json(createdUser);
        } catch (err) {
            // If user creation fails, delete the employee
            await Employee.findByIdAndDelete(employee._id);

            if (err.code === 11000) {
                // Duplicate key error
                const field = Object.keys(err.keyPattern)[0];
                return res.status(409).json({
                    error: "Duplicate user data",
                    details: `A user with this ${field} already exists`,
                    field
                });
            }
            throw err;
        }
    } catch (error) {
        res.status(500).json({
            error: "Failed to create user and employee",
            details: error.message,
            code: error.code
        });
    }
});

// Get employees without users
router.get('/unlinked-employees', verifyToken, isAdmin, async (req, res) => {
    try {
        // Find all users and get their employee IDs
        const users = await User.find({}, 'employee');
        const linkedEmployeeIds = users.map(user => user.employee).filter(id => id);

        // Find employees that are not linked to any user
        const unlinkedEmployees = await Employee.find({
            _id: { $nin: linkedEmployeeIds }
        }).populate('site');

        res.json(unlinkedEmployees);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch unlinked employees",
            details: error.message
        });
    }
});

// Get single user
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('grade')
            .populate({
                path: 'employee',
                populate: {
                    path: 'site'
                }
            })
            .select('-password -__v');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Convert to plain object and handle special fields
        const userData = user.toObject();

        if (userData.urls && userData.urls instanceof Map) {
            userData.urls = Object.fromEntries(userData.urls);
        }

        if (userData.photo && userData.photo.data && userData.photo.contentType) {
            userData.photo = bufferToDataURL(userData.photo.data, userData.photo.contentType);
        }

        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch user" });
    }
});

// Update user information
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { username, email, location, grade, bio, urls, dob, points, photo } = req.body;

        const updateData = {
            username,
            email,
            location,
            grade,
            bio,
            urls,
            dob,
            points
        };

        // Handle photo update
        if (photo) {
            const photoData = dataURLToBuffer(photo);
            if (photoData) {
                updateData.photo = {
                    data: photoData.buffer,
                    contentType: photoData.contentType
                };
            }
        } else {
            updateData.photo = null;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate('grade')
            .populate({
                path: 'employee',
                populate: {
                    path: 'site'
                }
            });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Convert the updated user's photo back to data URL for response
        const responseData = updatedUser.toObject();
        if (responseData.photo && responseData.photo.data) {
            responseData.photo = bufferToDataURL(responseData.photo.data, responseData.photo.contentType);
        }

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to update user" });
    }
});

// Update employee information
router.put('/:id/employee', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.employee) {
            // Create new employee if it doesn't exist
            const employee = new Employee(req.body);
            await employee.save();
            user.employee = employee._id;
            await user.save();
        } else {
            // Update existing employee
            await Employee.findByIdAndUpdate(user.employee, req.body);
        }

        const updatedUser = await User.findById(req.params.id)
            .populate('grade')
            .populate({
                path: 'employee',
                populate: {
                    path: 'site'
                }
            });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to update employee information" });
    }
});

module.exports = router;