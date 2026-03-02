const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Class = require('../models/Class');
const HomepageContent = require('../models/HomepageContent');

// --- HOMEPAGE CONTENT ---

// @route   GET /api/content/homepage
// @desc    Get homepage content singleton
// @access  Public
router.get('/homepage', async (req, res) => {
    try {
        let content = await HomepageContent.findOne({ singletonId: 'homepage_content' });
        // If it doesn't exist yet, return the default schema outline without saving (it will save on first PUT)
        if (!content) {
            content = new HomepageContent();
        }
        res.json(content);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/content/homepage
// @desc    Update homepage content (Admin only)
// @access  Private
router.put('/homepage', async (req, res) => {
    try {
        const content = await HomepageContent.findOneAndUpdate(
            { singletonId: 'homepage_content' },
            { $set: req.body },
            { new: true, upsert: true } // Upsert creates it if it doesn't exist
        );
        res.json(content);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- CATEGORIES ---

// @route   GET /api/content/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/content/categories
// @desc    Create a new category (Admin only)
// @access  Private
router.post('/categories', async (req, res) => {
    const category = new Category(req.body);
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/content/categories/:id
// @desc    Update a category (Admin only)
// @access  Private
router.put('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/content/categories/:id
// @desc    Delete a category (Admin only)
// @access  Private
router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- CLASSES ---

// @route   GET /api/content/classes
// @desc    Get all classes 
// @access  Public
router.get('/classes', async (req, res) => {
    try {
        const classes = await Class.find();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/content/class/:id
// @desc    Get a single class by its ID
// @access  Public
router.get('/class/:id', async (req, res) => {
    try {
        const singleClass = await Class.findById(req.params.id);
        if (!singleClass) return res.status(404).json({ message: 'Class not found' });
        res.json(singleClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/content/classes/:categoryId
// @desc    Get all classes for a category
// @access  Public
router.get('/classes/:categoryId', async (req, res) => {
    try {
        const classes = await Class.find({ categoryId: req.params.categoryId });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/content/classes
// @desc    Create a new class (Admin only)
// @access  Private
router.post('/classes', async (req, res) => {
    const newClass = new Class(req.body);
    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/content/classes/:id
// @desc    Delete a class (Admin only)
// @access  Private
router.delete('/classes/:id', async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
