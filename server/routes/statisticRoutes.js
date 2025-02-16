const express = require('express');
const router = express.Router();

const Statistic = require('../models/Statistic');

/**
 * @route GET /.../statistics
 * @desc Returns all stats from the database
 * @access Public
 * 
 * @usage Example request:
 * GET /.../statistics
 * 
 * @returns {JSON} Array of stat objects
 */
router.get('/', async (req, res) => {
    try {
        const statistics = await Statistic.find();
        res.json(statistics);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;