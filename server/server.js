const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // Fallback to default
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./config/logger');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postureRoutes = require('./routes/postureRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes'); // Import newsletter routes


const app = express();
const PORT = process.env.PORT || 5000;

// Routes
// const paymentRoutes = require('./routes/paymentRoutes');

// Stripe Webhook must be before express.json() because it needs raw body
// app.use('/api/payment', paymentRoutes);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Logging Middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// CORS Configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://13.49.69.94'], // Allow frontend domains
    credentials: true // Allow cookies
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/postures', postureRoutes);
app.use('/api/newsletter', newsletterRoutes); // Use newsletter routes


app.get('/', (req, res) => {
    res.send('JessieMoves API is running');
});

// Start Server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
