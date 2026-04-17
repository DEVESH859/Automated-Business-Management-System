const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String, default: '#3b82f6' },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
