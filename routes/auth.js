const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const JWT_EXPIRES_IN = '7d';

// Validation rules
const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Login
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Find user (works with both Mongoose and file storage)
        const userQuery = User.findOne({ 
            $or: [
                { username: username.toLowerCase() },
                { email: username.toLowerCase() }
            ]
        });
        const user = await (typeof userQuery.then === 'function' ? userQuery : Promise.resolve(userQuery));

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Update last login
        user.last_login = new Date();
        if (typeof user.save === 'function') {
            await user.save();
        } else {
            // File storage - update directly using findByIdAndUpdate
            if (typeof User.findByIdAndUpdate === 'function') {
                await User.findByIdAndUpdate(user._id, { last_login: user.last_login });
            }
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// Registration validation rules
const registerValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
// Register
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { username, email, password } = req.body;
        // Check for existing user
        const existing = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already in use'
            });
        }
        const user = new User({ username: username.toLowerCase(), email: email.toLowerCase(), password });
        await user.save();
        // Create token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Error during registration' });
    }
});

// Verify token
router.get('/verify', require('../middleware/auth').authenticate, async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email
            }
        }
    });
});

// Change password (Protected)
router.post('/change-password', require('../middleware/auth').authenticate, [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { current_password, new_password } = req.body;
        const user = await User.findById(req.user._id);

        // Verify current password
        const isMatch = await user.comparePassword(current_password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (hash will be done in model)
        if (typeof user.save === 'function') {
            user.password = new_password;
            await user.save();
        } else {
            // File storage - hash and update directly
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);
            await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

module.exports = router;

