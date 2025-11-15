/**
 * Simple JSON File Storage (Fallback when MongoDB is not available)
 * This is a basic implementation for testing without MongoDB
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(INQUIRIES_FILE)) {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([]));
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Helper functions
function readJSON(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Inquiry Storage
const InquiryStorage = {
    findAll: (query = {}) => {
        let inquiries = readJSON(INQUIRIES_FILE);
        
        // Apply filters
        if (query.status) {
            inquiries = inquiries.filter(i => i.status === query.status);
        }
        if (query.is_read !== undefined) {
            inquiries = inquiries.filter(i => i.is_read === query.is_read);
        }
        if (query.createdAt_gte) {
            const date = new Date(query.createdAt_gte);
            inquiries = inquiries.filter(i => new Date(i.createdAt) >= date);
        }
        if (query.search) {
            const search = query.search.toLowerCase();
            inquiries = inquiries.filter(i => 
                i.customer_name.toLowerCase().includes(search) ||
                i.email.toLowerCase().includes(search) ||
                i.phone.includes(search)
            );
        }
        
        return inquiries;
    },
    
    findById: (id) => {
        const inquiries = readJSON(INQUIRIES_FILE);
        return inquiries.find(i => i._id === id);
    },
    
    create: (data) => {
        const inquiries = readJSON(INQUIRIES_FILE);
        const newInquiry = {
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        inquiries.push(newInquiry);
        writeJSON(INQUIRIES_FILE, inquiries);
        return newInquiry;
    },
    
    update: (id, updates) => {
        const inquiries = readJSON(INQUIRIES_FILE);
        const index = inquiries.findIndex(i => i._id === id);
        if (index !== -1) {
            inquiries[index] = {
                ...inquiries[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            writeJSON(INQUIRIES_FILE, inquiries);
            return inquiries[index];
        }
        return null;
    },
    
    delete: (id) => {
        const inquiries = readJSON(INQUIRIES_FILE);
        const filtered = inquiries.filter(i => i._id !== id);
        writeJSON(INQUIRIES_FILE, filtered);
        return filtered.length !== inquiries.length;
    },
    
    count: (query = {}) => {
        return InquiryStorage.findAll(query).length;
    }
};

// User Storage
const UserStorage = {
    findAll: () => {
        return readJSON(USERS_FILE);
    },
    
    findByUsername: (username) => {
        const users = readJSON(USERS_FILE);
        return users.find(u => u.username === username || u.email === username);
    },
    
    findById: (id) => {
        const users = readJSON(USERS_FILE);
        return users.find(u => u._id === id);
    },
    
    create: (data) => {
        const users = readJSON(USERS_FILE);
        const userRole = data.role || 'customer';
        const newUser = {
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...data,
            role: userRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        users.push(newUser);
        writeJSON(USERS_FILE, users);
        return newUser;
    },
    
    update: (id, updates) => {
        const users = readJSON(USERS_FILE);
        const index = users.findIndex(u => u._id === id);
        if (index !== -1) {
            users[index] = {
                ...users[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            writeJSON(USERS_FILE, users);
            return users[index];
        }
        return null;
    }
};

module.exports = {
    InquiryStorage,
    UserStorage,
    isAvailable: true
};

