const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g. 'essentials'
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    duration: { type: String, required: true },
    intensity: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
