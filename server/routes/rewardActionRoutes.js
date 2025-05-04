const express = require('express');
const router = express.Router();
const RewardAction = require('../models/RewardAction');
const { verifyToken, isAdmin } = require('../middlewares/authMiddlewares');

// Get all reward actions (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const rewardActions = await RewardAction.find();
        res.json(rewardActions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new reward action (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { path, points, isActive, description } = req.body;
        const rewardAction = new RewardAction({
            path,
            points,
            isActive,
            description
        });
        const newRewardAction = await rewardAction.save();
        res.status(201).json(newRewardAction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a reward action (admin only)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const rewardAction = await RewardAction.findByIdAndUpdate(id, update, { new: true });
        if (!rewardAction) {
            return res.status(404).json({ message: 'Reward action not found' });
        }
        res.json(rewardAction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a reward action (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const rewardAction = await RewardAction.findByIdAndDelete(id);
        if (!rewardAction) {
            return res.status(404).json({ message: 'Reward action not found' });
        }
        res.json({ message: 'Reward action deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
