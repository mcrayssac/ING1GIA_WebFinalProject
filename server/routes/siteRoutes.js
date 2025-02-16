const express = require('express');
const router = express.Router();

const Site = require('../models/Site');

/**
 * @route GET /.../sites
 * @desc Returns all sites from the database
 * @access Private (requires a valid JWT token in the Authorization header)
 * 
 * @usage Example request:
 * GET /.../sites
 * Headers:
 *  Authorization 
 * 
 * @returns {JSON} Array of site objects
 */
router.get('/', async (req, res) => {
    try {
        const sites = await Site.find();
        res.json(sites);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;