require('dotenv').config();
const mongoose = require('mongoose');
const GlobalStyle = require('./models/GlobalStyle');

async function fixStyles() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to MongoDB.");

        const style = await GlobalStyle.findOne({ singletonId: 'global_style_v2' });
        if (style) {
            // Revert stuck theme colors for home to standard WebsiteHome colors
            if (style.home && style.home.colors) {
                style.home.colors.backgroundColor = '#ffffff';
                style.home.colors.primaryTextColor = '#1C1C1C';
                style.home.colors.secondaryTextColor = '#4A4A4A';
            }

            await style.save();
            console.log("Successfully reset Home Global Styles to default light mode variables.");
        } else {
            console.log("No global_style_v2 document found. Will use schema defaults on next fetch.");
        }
    } catch (err) {
        console.error("Error fixing styles:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

fixStyles();
