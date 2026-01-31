// Simple test to verify QStash setup
const { getQstashClient, QSTASH_ENDPOINTS } = require('./src/lib/qstash.ts');

async function testQStash() {
  try {
    console.log('Testing QStash setup...');
    
    // Check if environment variables are set
    if (!process.env.QSTASH_TOKEN) {
      console.log('❌ QSTASH_TOKEN not set');
      return;
    }
    
    if (!process.env.QSTASH_CURRENT_SIGNING_KEY) {
      console.log('❌ QSTASH_CURRENT_SIGNING_KEY not set');
      return;
    }
    
    if (!process.env.QSTASH_NEXT_SIGNING_KEY) {
      console.log('❌ QSTASH_NEXT_SIGNING_KEY not set');
      return;
    }
    
    console.log('✅ All QStash environment variables are set');
    console.log('✅ QStash endpoints:', QSTASH_ENDPOINTS);
    
    // Test client initialization (without actually sending a message)
    const client = getQstashClient();
    console.log('✅ QStash client initialized successfully');
    
  } catch (error) {
    console.error('❌ Error testing QStash:', error.message);
  }
}

testQStash();
