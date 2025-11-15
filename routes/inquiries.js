const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { body, validationResult } = require('express-validator');

// Product mapping
const productNames = {
    'pure-white': 'Pure White Medicine Envelopes',
    'inside-printed': 'Inside Printed Envelopes',
    'sealed-printed': 'Sealed Printed Envelopes'
};

const productPrices = {
    'pure-white': 2500,
    'inside-printed': 3000,
    'sealed-printed': 3500
};

// Validation rules
const inquiryValidation = [
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('product').isIn(['pure-white', 'inside-printed', 'sealed-printed']).withMessage('Invalid product'),
    body('size').isIn(['S', 'M', 'L']).withMessage('Invalid size'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Create new inquiry (Public endpoint)
router.post('/', require('../middleware/auth').authenticate, inquiryValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { customer_name, phone, email, address, city, product, size, quantity } = req.body;

        // Calculate prices
        const pricePerBundle = productPrices[product] || 0;
        const totalAmount = pricePerBundle * parseInt(quantity);

        // Create inquiry (handle both Mongoose and file storage)
        let inquiry;
        if (typeof Inquiry === 'function' && Inquiry.prototype && Inquiry.prototype.save) {
            // Mongoose
            inquiry = new Inquiry({
                customer_name,
                phone,
                email,
                address,
                city,
                delivery_method: req.body.delivery_method || 'Cash on Delivery',
                product,
                product_name: productNames[product],
                size,
                quantity: parseInt(quantity),
                price_per_bundle: pricePerBundle,
                total_amount: totalAmount,
                status: 'pending'
            });
            await inquiry.save();
        } else {
            // File storage
            inquiry = await Inquiry.create({
                customer_name,
                phone,
                email,
                address,
                city,
                delivery_method: req.body.delivery_method || 'Cash on Delivery',
                product,
                product_name: productNames[product],
                size,
                quantity: parseInt(quantity),
                price_per_bundle: pricePerBundle,
                total_amount: totalAmount,
                status: 'pending'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully',
            data: {
                id: inquiry._id,
                customer_name: inquiry.customer_name,
                product: inquiry.product_name,
                total_amount: inquiry.total_amount
            }
        });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting inquiry',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

module.exports = router;

