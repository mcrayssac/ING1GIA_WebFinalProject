const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Grade = require('../models/Grades');
const router = express.Router();

// --- Helpers pour les photos ---
function dataURLToBuffer(dataURL) {
    const matches = dataURL.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    return { buffer, contentType };
}

function bufferToDataURL(buffer, contentType) {
    return `data:${contentType};base64,${buffer.toString("base64")}`;
}

// --- LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
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
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.send('Logged out');
});

// --- REGISTER ---
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        user.admin = false;

        const existing = await User.findOne({ username: user.username });
        if (existing) return res.status(409).send('User already exists');

        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// --- INFOS (désécurisé) ---
router.get('/infos', async (req, res) => {
    try {
        let user = await User.findOne().populate('grade').select('-password -__v');
        if (!user) return res.status(404).json({ error: 'User not found' });

        user = user.toObject();
        if (user.urls && user.urls instanceof Map) {
            user.urls = Object.fromEntries(user.urls);
        }
        if (user.photo?.data && user.photo?.contentType) {
            user.photo = bufferToDataURL(user.photo.data, user.photo.contentType);
        }

        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// --- RESET PASSWORD (désécurisé) ---
router.post('/admin/reset', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found');

        const randomPassword = Math.random().toString(36).slice(-8);
        user.password = randomPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully', user, newPassword: randomPassword });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// --- VERIFY (désécurisé) ---
router.get('/verify', async (req, res) => {
    try {
        const user = await User.findOne();
        res.status(200).json({ admin: user?.admin || false });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// --- GET ALL USERS (désécurisé) ---
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password -__v');
        const usersData = users.map(user => {
            const obj = user.toObject();
            if (obj.urls && obj.urls instanceof Map) obj.urls = Object.fromEntries(obj.urls);
            if (obj.photo?.data && obj.photo?.contentType) {
                obj.photo = bufferToDataURL(obj.photo.data, obj.photo.contentType);
            }
            return obj;
        });

        res.json(usersData);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// --- UPDATE USER (désécurisé) ---
router.put("/infos/:id", async (req, res) => {
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
        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- UPDATE PASSWORD (désécurisé) ---
router.put("/password", async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Both old and new passwords are required" });
    }

    try {
        const user = await User.findOne();
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Old password is incorrect" });

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- USERS COUNT BY GRADE (désécurisé) ---
router.get('/counts-by-grade', async (req, res) => {
    try {
        const grades = await Grade.find();
        const users = await User.find().populate('grade');
        const counts = {};

        grades.forEach(grade => counts[grade.name] = 0);
        users.forEach(user => {
            if (user.grade) {
                counts[user.grade.name] = (counts[user.grade.name] || 0) + 1;
            }
        });

        res.json(counts);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
