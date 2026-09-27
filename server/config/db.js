const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.startsWith('mongodb+srv://')) {
      // Atlas connection string provided
      console.log(`Connecting to MongoDB Atlas...`);
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected successfully: ${conn.connection.host}`);
      return conn;
    } else if (uri && !process.env.USE_IN_MEMORY_DB) {
      // Direct local or custom URI
      console.log(`Connecting to MongoDB at ${uri}...`);
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected successfully: ${conn.connection.host}`);
      return conn;
    } else {
      // If USE_IN_MEMORY_DB is true or fallback is needed
      try {
        console.log('Attempting connection to provided MONGODB_URI...');
        const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/campusconnect', {
          serverSelectionTimeoutMS: 2500,
        });
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        return conn;
      } catch (localErr) {
        console.log('Local MongoDB not reachable. Initializing In-Memory MongoDB for immediate zero-config testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`MongoDB connected successfully (In-Memory Instance at ${memUri})`);
        return conn;
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Check if in-memory fallback is possible
    try {
      console.log('Falling back to In-Memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`MongoDB connected successfully (Fallback In-Memory at ${memUri})`);
      return conn;
    } catch (fallbackErr) {
      console.error('Fatal: Could not connect to any MongoDB instance:', fallbackErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
