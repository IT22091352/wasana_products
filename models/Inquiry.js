const mongoose = require('mongoose');
const { InquiryStorage } = require('./Storage');

// Check if we should use file storage (set by server.js when MongoDB fails)
const useFileStorage = global.useFileStorage || false;

// File Storage Implementation
if (useFileStorage) {
    // Create a mock model that mimics Mongoose API
    function createMockQuery(results) {
        const query = {
            sort: (sort) => {
                if (sort && sort.createdAt === -1) {
                    results = [...results].sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                }
                return createMockQuery(results);
            },
            skip: (n) => {
                return createMockQuery(results.slice(n));
            },
            limit: (n) => {
                return Promise.resolve(results.slice(0, n));
            },
            then: (resolve) => Promise.resolve(results).then(resolve)
        };
        return query;
    }
    
    const InquiryModel = function(data) {
        // Constructor for creating new inquiries
        Object.assign(this, data);
        this.save = async function() {
            return InquiryStorage.create(this);
        };
    };
    
    InquiryModel.find = (query = {}) => {
        // Convert Mongoose query to simple object
        const simpleQuery = {};
        if (query.status) simpleQuery.status = query.status;
        if (query.is_read !== undefined) simpleQuery.is_read = query.is_read;
        if (query.createdAt) {
            const createdAt = query.createdAt;
            if (createdAt.$gte) {
                simpleQuery.createdAt_gte = createdAt.$gte;
            }
        }
        if (query.$or) {
            simpleQuery.search = query.$or[0].customer_name?.$regex || 
                                 query.$or[0].email?.$regex || 
                                 query.$or[0].phone?.$regex;
        }
        
        const results = InquiryStorage.findAll(simpleQuery);
        return createMockQuery(results);
    };
    
    InquiryModel.findById = (id) => Promise.resolve(InquiryStorage.findById(id));
    InquiryModel.create = (data) => Promise.resolve(InquiryStorage.create(data));
    InquiryModel.findByIdAndUpdate = (id, updates, options) => {
        const updated = InquiryStorage.update(id, updates);
        return Promise.resolve(updated);
    };
    InquiryModel.findByIdAndDelete = (id) => {
        const deleted = InquiryStorage.delete(id);
        return Promise.resolve(deleted ? { _id: id } : null);
    };
    InquiryModel.deleteOne = (query) => {
        if (query._id) {
            const deleted = InquiryStorage.delete(query._id);
            return Promise.resolve({ deletedCount: deleted ? 1 : 0 });
        }
        return Promise.resolve({ deletedCount: 0 });
    };
    InquiryModel.countDocuments = (query = {}) => {
        const simpleQuery = {};
        if (query.status) simpleQuery.status = query.status;
        if (query.is_read !== undefined) simpleQuery.is_read = query.is_read;
        if (query.createdAt && query.createdAt.$gte) {
            simpleQuery.createdAt_gte = query.createdAt.$gte;
        }
        return Promise.resolve(InquiryStorage.count(simpleQuery));
    };
    InquiryModel.aggregate = async (pipeline) => {
        const inquiries = InquiryStorage.findAll();
        const results = [];
        
        // Group by status
        const groupByStatus = pipeline.find(p => p.$group && p.$group._id === '$status');
        if (groupByStatus) {
            const statusGroups = {};
            inquiries.forEach(i => {
                statusGroups[i.status] = (statusGroups[i.status] || 0) + 1;
            });
            return Object.keys(statusGroups).map(status => ({
                _id: status,
                count: statusGroups[status]
            }));
        }
        
        // Group by product
        const groupByProduct = pipeline.find(p => p.$group && p.$group._id === '$product');
        if (groupByProduct) {
            const productGroups = {};
            inquiries.forEach(i => {
                productGroups[i.product] = (productGroups[i.product] || 0) + 1;
            });
            return Object.keys(productGroups).map(product => ({
                _id: product,
                count: productGroups[product]
            }));
        }
        
        // Sum revenue
        const revenueGroup = pipeline.find(p => 
            p.$match && p.$group && p.$group.total
        );
        if (revenueGroup) {
            const match = revenueGroup.$match;
            const filtered = inquiries.filter(i => 
                match.status && match.status.$in && match.status.$in.includes(i.status)
            );
            const total = filtered.reduce((sum, i) => sum + (i.total_amount || 0), 0);
            return [{ _id: null, total }];
        }
        
        // Revenue stats with multiple fields
        const revenueStatsGroup = pipeline.find(p => 
            p.$match && p.$group && p.$group.totalRevenue
        );
        if (revenueStatsGroup) {
            const match = revenueStatsGroup.$match;
            const filtered = inquiries.filter(i => 
                match.status && match.status.$in && match.status.$in.includes(i.status)
            );
            const total = filtered.reduce((sum, i) => sum + (i.total_amount || 0), 0);
            const avg = filtered.length > 0 ? total / filtered.length : 0;
            return [{
                _id: null,
                totalRevenue: total,
                totalOrders: filtered.length,
                avgOrderValue: avg
            }];
        }
        
        // Monthly stats
        const monthlyGroup = pipeline.find(p => 
            p.$group && p.$group._id && p.$group._id.year
        );
        if (monthlyGroup) {
            const match = pipeline.find(p => p.$match);
            let filtered = inquiries;
            if (match && match.createdAt && match.createdAt.$gte) {
                const date = new Date(match.createdAt.$gte);
                filtered = inquiries.filter(i => new Date(i.createdAt) >= date);
            }
            
            const monthly = {};
            filtered.forEach(i => {
                const date = new Date(i.createdAt);
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                if (!monthly[key]) {
                    monthly[key] = { count: 0, revenue: 0 };
                }
                monthly[key].count++;
                monthly[key].revenue += i.total_amount || 0;
            });
            
            return Object.keys(monthly).map(key => {
                const [year, month] = key.split('-');
                return {
                    _id: { year: parseInt(year), month: parseInt(month) },
                    count: monthly[key].count,
                    revenue: monthly[key].revenue
                };
            }).sort((a, b) => {
                if (a._id.year !== b._id.year) return a._id.year - b._id.year;
                return a._id.month - b._id.month;
            });
        }
        
        return results;
    };
    
    module.exports = InquiryModel;
} else {
    // MongoDB Implementation
    const inquirySchema = new mongoose.Schema({
        customer_name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        delivery_method: {
            type: String,
            default: 'Cash on Delivery'
        },
        product: {
            type: String,
            required: true,
            enum: ['pure-white', 'inside-printed', 'sealed-printed']
        },
        product_name: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true,
            enum: ['S', 'M', 'L']
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price_per_bundle: {
            type: Number,
            required: true
        },
        total_amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'confirmed', 'delivered', 'cancelled'],
            default: 'pending'
        },
        notes: {
            type: String,
            default: ''
        },
        is_read: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    });

    // Index for faster queries
    inquirySchema.index({ createdAt: -1 });
    inquirySchema.index({ status: 1 });
    inquirySchema.index({ is_read: 1 });

    module.exports = mongoose.model('Inquiry', inquirySchema);
}
