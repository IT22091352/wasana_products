const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies?.token || 
                     req.query?.token;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
        
        // Get user (works with both Mongoose and file storage)
        const findQuery = User.findById(decoded.userId);
        let user = await (typeof findQuery.then === 'function' ? findQuery : Promise.resolve(findQuery));
        
        // Handle password removal for file storage
        if (user && user.password) {
            const { password, ...userWithoutPassword } = user;
            user = userWithoutPassword;
        }

        if (!user || !user.is_active) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or inactive user.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
    }
};

module.exports = { authenticate };

