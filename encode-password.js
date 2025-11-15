/**
 * Password URL Encoder
 * Use this script to URL-encode your MongoDB Atlas password
 * 
 * Usage: node encode-password.js "Your@Password#123"
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔐 MongoDB Atlas Password URL Encoder\n');
console.log('Enter your password to URL-encode it for the connection string.\n');
console.log('⚠️  Note: This password will be displayed on screen. Make sure no one is watching!\n');

rl.question('Enter your MongoDB Atlas password: ', (password) => {
    if (!password) {
        console.log('\n❌ Password cannot be empty!\n');
        rl.close();
        return;
    }

    const encoded = encodeURIComponent(password);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 ENCODED PASSWORD:');
    console.log('='.repeat(60));
    console.log(encoded);
    console.log('='.repeat(60));
    
    console.log('\n📝 Update your .env file:');
    console.log('─'.repeat(60));
    
    // Show what special characters were found
    const specialChars = {
        '@': '%40',
        '#': '%23',
        '%': '%25',
        '$': '%24',
        '&': '%26',
        '+': '%2B',
        '=': '%3D',
        '?': '%3F',
        '/': '%2F',
        ':': '%3A',
        ';': '%3B',
        ' ': '%20'
    };
    
    let foundChars = [];
    for (const [char, encoded] of Object.entries(specialChars)) {
        if (password.includes(char)) {
            foundChars.push(`${char} → ${encoded}`);
        }
    }
    
    if (foundChars.length > 0) {
        console.log('\n⚠️  Special characters found in password:');
        foundChars.forEach(pair => console.log(`   ${pair}`));
    }
    
    console.log('\n✅ Copy this encoded password to your .env file:');
    console.log(`   MONGODB_URI=mongodb+srv://username:${encoded}@cluster.mongodb.net/wasana_products?retryWrites=true&w=majority\n`);
    
    rl.close();
});


