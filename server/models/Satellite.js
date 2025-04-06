const mongoose = require('mongoose');

const satelliteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tle1: { type: String, required: true },
    tle2: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model(process.env.MONGO_Collection_Satellite, satelliteSchema);