const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    categories: { type: [String], required: true },
    badges: { type: [String], required: true },
    isNew: { type: Boolean, required: true },
});

module.exports = mongoose.model(process.env.MONGO_Collection_Product, productSchema);