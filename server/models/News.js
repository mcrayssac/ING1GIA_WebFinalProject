// models/News.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  imageUrl: { type: String },
  category: { type: String },    
  location: { type: String },      
});

module.exports = mongoose.model('News', newsSchema);

