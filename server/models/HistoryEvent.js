const mongoose = require('mongoose');

const historyEventSchema = new mongoose.Schema({
    date: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
});

module.exports = mongoose.model(process.env.MONGO_Collection_HistoryEvent, historyEventSchema);