const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Site = require('../models/Site');

const { sites } = require('../data/data');


/**
 * @route GET /.../seed
 * @desc Seeds the database with static data
 * @access Private (requires a valid JWT token in the Authorization header)
 *
 * @usage Example request:
 * GET /.../seed
 * Headers:
 *   Authorization: Bearer <JWT token>
 *
 * @returns {JSON} { success: true, message: "Data seeded successfully" }
 */
router.get('/', async (req, res) => {
    try {
        // Define the static data mappings 
        const mappedData = [
            { key: 'Sites', data: sites, model: Site },
        ];

        // Loop over each mapping and seed the data
        for (const { key, data } of mappedData) {
            // Check if the data is an array and not empty
            if (!data) return res.status(400).json({ error: `No data found for key: ${key}` });
            else if (!Array.isArray(data)) return res.status(400).json({ error: `Data for key: ${key} is not an array` });
            else if (data.length === 0) return res.status(400).json({ error: `Data for key: ${key} is empty` });

            // Check if the model exists
            console.log('Models:', mongoose.models);
            if (!mongoose.models[key]) return res.status(400).json({ error: `Model not found for key: ${key}` });

            // Clear the collection before inserting
            await mongoose.models[key].deleteMany({});
            await mongoose.models[key].insertMany(data);

            console.log(`Data seeded for key: ${key}`);
        }

        return res.json({ success: true, message: "Data seeded successfully" });
    } catch (error) {
        console.error('Error seeding data:', error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
