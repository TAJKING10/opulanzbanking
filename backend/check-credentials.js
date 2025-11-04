/**
 * Check Credential Format
 *
 * This script helps verify your .env credentials are formatted correctly
 */

require('dotenv').config();

console.log('\n=== Current .env Configuration ===\n');

console.log('DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
console.log('DB_USER:', process.env.DB_USER || '❌ NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || '❌ NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || '❌ NOT SET');

// Show password (masked)
if (process.env.DB_PASSWORD) {
  const pwd = process.env.DB_PASSWORD;
  console.log('DB_PASSWORD length:', pwd.length, 'characters');
  console.log('DB_PASSWORD (masked):', '*'.repeat(pwd.length - 4) + pwd.slice(-4));
  console.log('DB_PASSWORD starts with:', pwd.substring(0, 3) + '...');
  console.log('DB_PASSWORD ends with:', '...' + pwd.slice(-3));

  // Check for special characters
  const specialChars = ['?', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
  const foundSpecial = specialChars.filter(char => pwd.includes(char));

  if (foundSpecial.length > 0) {
    console.log('⚠️  Special characters found:', foundSpecial.join(', '));
    console.log('💡 If connection fails, try one of these formats:');
    console.log('   1. Wrap in quotes: DB_PASSWORD="' + pwd + '"');
    console.log('   2. URL encode: DB_PASSWORD=' + encodeURIComponent(pwd));
    console.log('   3. Escape special chars: DB_PASSWORD=' + pwd.replace(/([?!@#$%^&*()])/g, '\\$1'));
  }
} else {
  console.log('DB_PASSWORD: ❌ NOT SET');
}

console.log('\n=== Azure Connection String Format ===\n');

if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
  const urlEncoded = encodeURIComponent(process.env.DB_PASSWORD);
  console.log('Standard format:');
  console.log(`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`);
  console.log('\nURL-encoded password format:');
  console.log(`postgresql://${process.env.DB_USER}:${urlEncoded}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`);
}

console.log('\n=== Next Steps ===\n');
console.log('1. Verify password in Azure Portal:');
console.log('   → https://portal.azure.com');
console.log('   → Go to: opulanz-pg → Settings → Authentication');
console.log('   → Check the admin username and reset password if needed');
console.log('');
console.log('2. Update .env with correct password');
console.log('');
console.log('3. Run: node test-connection.js');
console.log('');
