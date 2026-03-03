const mongoose = require('mongoose');

const pageStyleSchema = new mongoose.Schema({
    colors: {
        backgroundColor: {
            type: String,
            default: '#ffffff'
        },
        primaryTextColor: {
            type: String,
            default: '#1C1C1C'
        },
        secondaryTextColor: {
            type: String,
            default: '#4A4A4A'
        },
        accentColor: {
            type: String,
            default: '#ec4899'
        }
    },
    typography: {
        headingFont: {
            type: String,
            default: "'Euclid Circular A', Helvetica, Arial, sans-serif"
        },
        bodyFont: {
            type: String,
            default: "'Euclid Circular A', Helvetica, Arial, sans-serif"
        }
    }
}, { _id: false });

const globalStyleSchema = new mongoose.Schema({
    // Using a new singleton ID for v2 (sectionized styles)
    singletonId: {
        type: String,
        default: 'global_style_v2',
        unique: true
    },
    home: {
        type: pageStyleSchema,
        default: () => ({})
    },
    classes: {
        type: pageStyleSchema,
        default: () => ({})
    }
}, { timestamps: true });

module.exports = mongoose.model('GlobalStyle', globalStyleSchema);
