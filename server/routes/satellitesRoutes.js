const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

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
    // Paths for ISS and Starlink TLE data
    const ISS_TLE_PATH = path.join(__dirname, '../data/stations.txt');
    const STARLINK_TLE_PATH = path.join(__dirname, '../data/starlink.txt');

    try {
        // Read TLE text data from local files
        const [stationsText, starlinkText] = await Promise.all([
            fs.readFile(ISS_TLE_PATH, 'utf-8'),
            fs.readFile(STARLINK_TLE_PATH, 'utf-8')
        ]);

        // Helper to parse a specific satellite's TLE from a text block by name
        function extractTLE(tleText, satName) {
            const lines = tleText.trim().split(/[\r\n]+/);
            const index = lines.findIndex(line => line.trim().startsWith(satName));
            if (index !== -1 && index + 2 < lines.length) {
                const tle1 = lines[index + 1].trim();
                const tle2 = lines[index + 2].trim();
                return { name: satName, tle1, tle2 };
            }
            return null;
        }

        // Extract ISS (ZARYA) TLE – ISS is identified by the name "ISS (ZARYA)"
        const issTLE = extractTLE(stationsText, "ISS (ZARYA)");

        // Extract Starlink satellites TLE
        const starlinkLines = starlinkText.trim().split(/[\r\n]+/);
        const starlinkTLEs = [];
        for (let i = 0; i < /*starlinkLines.length*/ 2; i += 3) {
            if (i + 2 < starlinkLines.length) {
                const name = starlinkLines[i].trim();
                const tle1 = starlinkLines[i + 1].trim();
                const tle2 = starlinkLines[i + 2].trim();
                starlinkTLEs.push({ name, tle1, tle2 });
            }
        }

        // Return the TLE data as JSON
        res.json({
            iss: issTLE,
            starlink: starlinkTLEs
        });
    } catch (err) {
        console.error("Failed to fetch TLE data:", err);
        res.status(500).json({ error: "Failed to fetch TLE data" });
    }
});

module.exports = router;