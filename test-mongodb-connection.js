/**
 * Test MongoDB Connection Script
 * This script helps diagnose MongoDB Atlas connection issues
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function urlEncodePassword(password) {
    return encodeURIComponent(password);
}

async function testConnection() {
    log('\n🔍 Testing MongoDB Atlas Connection...\n', 'cyan');

    // Get connection string from .env
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        log('❌ ERROR: MONGODB_URI not found in .env file!', 'red');
        log('\n📝 Please add MONGODB_URI to your .env file:', 'yellow');
        log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wasana_products?retryWrites=true&w=majority\n', 'yellow');
        process.exit(1);
    }

    // Check connection string format
    log('📋 Checking connection string format...', 'blue');
    
    if (!MONGODB_URI.startsWith('mongodb+srv://')) {
        log('⚠️  WARNING: Connection string should start with mongodb+srv://', 'yellow');
    }

    // Extract username and password from connection string
    try {
        const match = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
        if (match) {
            const username = match[1];
            const password = match[2];
            
            log(`   Username: ${username}`, 'blue');
            log(`   Password: ${password.length > 0 ? '***' + password.slice(-3) : 'NOT FOUND'}`, 'blue');
            
            // Check if password needs URL encoding
            const decodedPassword = decodeURIComponent(password);
            if (decodedPassword !== password || password.includes('%')) {
                log('   ℹ️  Password appears to be URL-encoded', 'blue');
            } else {
                // Check for special characters that need encoding
                const specialChars = /[@#$%&+=\/?;: ]/;
                if (specialChars.test(decodedPassword)) {
                    log('   ⚠️  WARNING: Password contains special characters that may need URL encoding!', 'yellow');
                    log('   Special characters found: @ # $ % & + = / ? : ; (space)', 'yellow');
                    log('   Current password:', 'yellow');
                    log(`      ${decodedPassword}`, 'yellow');
                    log('   URL-encoded password should be:', 'yellow');
                    log(`      ${urlEncodePassword(decodedPassword)}\n`, 'yellow');
                    log('   💡 Try updating your .env file with the URL-encoded password above.', 'yellow');
                }
            }
        } else {
            log('   ⚠️  Could not parse username/password from connection string', 'yellow');
        }
    } catch (error) {
        log('   ⚠️  Error parsing connection string', 'yellow');
    }

    // Check database name
    const dbMatch = MONGODB_URI.match(/\/\/([^?]+)\//);
    if (dbMatch) {
        const afterSlash = dbMatch[1].split('@')[1]?.split('/');
        if (afterSlash && afterSlash.length > 1) {
            const dbName = afterSlash[1];
            log(`   Database: ${dbName}`, 'blue');
        } else {
            log('   ⚠️  WARNING: Database name not found in connection string!', 'yellow');
            log('   Should be: ...mongodb.net/wasana_products?...', 'yellow');
        }
    }

    log('', 'reset');

    // Try to connect
    log('🔌 Attempting to connect...\n', 'cyan');

    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000 // 10 second timeout
        });

        log('✅ SUCCESS! Connected to MongoDB Atlas!', 'green');
        log(`   Connected to: ${mongoose.connection.host}`, 'green');
        log(`   Database: ${mongoose.connection.name}`, 'green');
        log(`   Ready state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`, 'green');

        // Close connection
        await mongoose.connection.close();
        log('\n✅ Connection test completed successfully!\n', 'green');
        process.exit(0);

    } catch (error) {
        log('\n❌ CONNECTION FAILED!\n', 'red');
        
        // Analyze error
        if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
            log('🔍 Error Type: Authentication Failed', 'red');
            log('\n💡 This usually means:', 'yellow');
            log('   1. Username is incorrect', 'yellow');
            log('   2. Password is incorrect', 'yellow');
            log('   3. Password has special characters that need URL encoding', 'yellow');
            log('   4. Password was copied incorrectly (with spaces or extra characters)', 'yellow');
            log('\n📝 Solutions:', 'yellow');
            log('   1. Check username/password in MongoDB Atlas Dashboard', 'yellow');
            log('   2. Reset password in Atlas if needed', 'yellow');
            log('   3. URL-encode special characters in password (@ → %40, # → %23, etc.)', 'yellow');
            log('   4. Make sure no spaces before/after username or password', 'yellow');
        } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
            log('🔍 Error Type: Connection Timeout', 'red');
            log('\n💡 This usually means:', 'yellow');
            log('   1. Network access not configured in Atlas', 'yellow');
            log('   2. Firewall blocking connection', 'yellow');
            log('   3. Internet connection issues', 'yellow');
            log('\n📝 Solutions:', 'yellow');
            log('   1. Go to Atlas Dashboard → Network Access', 'yellow');
            log('   2. Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)', 'yellow');
            log('   3. Wait 2-3 minutes after adding IP', 'yellow');
        } else if (error.message.includes('DNS') || error.message.includes('ENOTFOUND')) {
            log('🔍 Error Type: DNS Resolution Error', 'red');
            log('\n💡 This usually means:', 'yellow');
            log('   1. Cluster URL is incorrect', 'yellow');
            log('   2. Internet connection issues', 'yellow');
            log('   3. DNS problems', 'yellow');
            log('\n📝 Solutions:', 'yellow');
            log('   1. Check cluster URL in Atlas Dashboard', 'yellow');
            log('   2. Copy connection string again from Atlas', 'yellow');
            log('   3. Check internet connection', 'yellow');
        } else {
            log('🔍 Error Type: ' + error.name, 'red');
            log('   Message: ' + error.message, 'red');
        }

        log('\n📋 Full error details:', 'red');
        log(error.message, 'red');
        log('\n', 'reset');
        process.exit(1);
    }
}

// Run the test
testConnection();


