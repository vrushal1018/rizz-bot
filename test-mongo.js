require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('📡 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // Connect without deprecated options
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    process.exit(1);
  }
}

testMongoConnection();
