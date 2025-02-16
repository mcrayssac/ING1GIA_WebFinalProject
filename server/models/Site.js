const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    coordinates: { type: [Number], required: true },
    description: { type: String, required: true },
    openHours: { type: String, required: true },
    geometry: { type: [[Number]], required: true },
    markerType: { type: String, required: true },
});

module.exports = mongoose.model(process.env.MONGO_Collection_Site, siteSchema);
