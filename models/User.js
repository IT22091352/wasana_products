const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { UserStorage } = require('./Storage');

// Check if we should use file storage
const useFileStorage = global.useFileStorage || false;

// File Storage Implementation
if (useFileStorage) {
    const UserModel = {
        findOne: async (query) => {
            let user = null;
            if (query.$or) {
                // Login query: { $or: [{ username: ... }, { email: ... }] }
                const username = query.$or[0].username || query.$or[0].email;
                user = UserStorage.findByUsername(username);
            } else if (query._id) {
                user = UserStorage.findById(query._id);
            } else if (query.username) {
                user = UserStorage.findByUsername(query.username);
            } else if (query.email) {
                user = UserStorage.findByUsername(query.email);
            }
            
            if (user) {
                // Add methods to user object
                user.comparePassword = async function(candidatePassword) {
                    return await bcrypt.compare(candidatePassword, this.password);
                };
                user.save = async function() {
                    const updated = UserStorage.update(this._id, this);
                    return updated || this;
                };
                // Make it work with select
                if (query.select && query.select.includes('-password')) {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                }
            }
            return user;
        },
        findById: async (id) => {
            const user = UserStorage.findById(id);
            if (user) {
                user.comparePassword = async function(candidatePassword) {
                    return await bcrypt.compare(candidatePassword, this.password);
                };
                user.save = async function() {
                    const updated = UserStorage.update(this._id, this);
                    return updated || this;
                };
            }
            return user;
        },
        findByIdAndUpdate: async (id, updates) => {
            const updated = UserStorage.update(id, updates);
            if (updated) {
                updated.comparePassword = async function(candidatePassword) {
                    return await bcrypt.compare(candidatePassword, this.password);
                };
                updated.save = async function() {
                    const updatedUser = UserStorage.update(this._id, this);
                    return updatedUser || this;
                };
            }
            return updated;
        },
        create: async (data) => {
            // Hash password before saving
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);
            const userData = { ...data, password: hashedPassword };
            const user = UserStorage.create(userData);
            if (user) {
                user.comparePassword = async function(candidatePassword) {
                    return await bcrypt.compare(candidatePassword, this.password);
                };
                user.save = async function() {
                    const updated = UserStorage.update(this._id, this);
                    return updated || this;
                };
            }
            return user;
        }
    };
    
    module.exports = UserModel;
} else {
    // MongoDB Implementation
    const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    is_active: {
        type: Boolean,
        default: true
    },
    last_login: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

    // Method to compare password
    userSchema.methods.comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    };

    module.exports = mongoose.model('User', userSchema);
}
