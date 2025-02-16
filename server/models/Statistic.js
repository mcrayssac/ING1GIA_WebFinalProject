const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
    icon : { type: String, required: true },
    title : { type: String, required: true },
    value : { type: String, required: true },
    iconValue : { type: String, required: true },
    desc : { type: String, required: true },
});

module.exports = mongoose.model(process.env.MONGO_Collection_Statistic, statisticSchema);