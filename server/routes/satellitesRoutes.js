const express = require('express');
const router = express.Router();

const Satellite = require('../models/Satellite');

/**
 * @route GET /.../satellites
 * @desc Returns TLE data for ISS and Starlink satellites
 * @access Public
 * 
 * @usage Example request:
 * GET /.../satellites
 * 
 * @returns {JSON} Array of TLE data for ISS and Starlink satellites
 */
router.get('/', async (req, res) => {
    try {
        const satellites = await Satellite.find().select('-_id name tle1 tle2');
        if (!satellites || satellites.length === 0) {
            return res.status(404).json({ message: 'No satellites found' });
        }

        // Get only 6 Starlink satellites
        const starlinkSatellites = satellites.filter(satellite => satellite.name.startsWith('STARLINK')).slice(0, 18);

        // Filter for ISS and Starlink satellites
        res.json({ 
            iss: satellites.find(satellite => satellite.name === 'ISS (ZARYA)'),
            starlink: starlinkSatellites
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;