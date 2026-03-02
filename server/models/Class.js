const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: String, required: true },
    categoryId: { type: String, required: true }, // References the id in Category
    thumbnail: { type: String, default: '' },
    videoUrl: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Class', ClassSchema);
