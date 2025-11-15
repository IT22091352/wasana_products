const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, libs)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));

// Serve static files from root directory
app.use(express.static(__dirname));

// Database connection
let useFileStorage = false;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wasana_products';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully');
    useFileStorage = false;
    global.useFileStorage = false;
})
.catch(err => {
    console.warn('⚠️  MongoDB Connection Failed:', err.message);
    console.log('💡 Falling back to JSON file storage...');
    console.log('💡 To use MongoDB: Install MongoDB or use MongoDB Atlas (free)');
    console.log('💡 See MONGODB-SETUP.md for instructions\n');
    useFileStorage = true;
    global.useFileStorage = true; // Set global flag for models to use
});

// Routes
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/auth', require('./routes/auth'));

// Root route - serve index.html from root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

