const express = require('express');
const router = express.Router();

const HistoryEvent = require('../models/HistoryEvent');

/**
 * @route GET /.../history
 * @desc Returns all history events from the database
 * @access Public
 * 
 * @usage Example request:
 * GET /.../history
 * 
 * @returns {JSON} Array of history event objects
 */
router.get('/', async (req, res) => {
    try {
        const historyEvents = await HistoryEvent.find();
        res.json(historyEvents);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;