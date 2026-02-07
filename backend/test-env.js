// Quick test to verify FRONTEND_URL is loaded
require('dotenv').config();

console.log('=================================');
console.log('Environment Variable Check:');
console.log('=================================');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('Expected: https://www.wanderlankatours.com');
console.log('Match:', process.env.FRONTEND_URL === 'https://www.wanderlankatours.com' ? '✅ YES' : '❌ NO');
console.log('=================================');
