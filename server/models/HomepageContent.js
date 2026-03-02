const mongoose = require('mongoose');

const homepageContentSchema = new mongoose.Schema({
    // Using a singleton ID so we only ever have one homepage document
    singletonId: {
        type: String,
        default: 'homepage_content',
        unique: true
    },
    hero: {
        title: {
            type: String,
            default: 'Moves for every mood.'
        },
        subtitle: {
            type: String,
            default: 'The JM Method is a transformative approach designed to help you feel stronger, longer, and leaner, while releasing both physical and mental tension - so you can move with confidence. One class for every body!'
        },
        backgroundImageUrl: {
            type: String,
            default: 'https://images.unsplash.com/photo-1747239685045-fcbcf98985db?q=80&w=3132&auto=format&fit=crop'
        }
    },
    classesSection: {
        title: {
            type: String,
            default: 'My Classes'
        },
        description: {
            type: String,
            default: 'From high-intensity burn to restorative flows, I have designed something for every energy level.'
        }
    },
    instructorSection: {
        title: {
            type: String,
            default: 'Meet Your Instructor'
        },
        description: {
            type: String,
            default: 'Guiding you through every breath and movement.'
        },
        imageUrl: {
            type: String,
            default: '/jessie_pole.png'
        },
        quote: {
            type: String,
            default: '"My approach combines classical Pilates precision with athletic conditioning. I created The Jessie Moves to help you find strength in softness and power in control."'
        }
    },
    testimonial: {
        quote: {
            type: String,
            default: '"While you can feel the burn the next day, these aren’t the kind of workouts you’ll hate or dread. Instead, they invite you to connect with your body and breath, and simultaneously get the dopamine pumping."'
        },
        author: {
            type: String,
            default: 'Clarissa'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('HomepageContent', homepageContentSchema);
