import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Access environment variable inside function to ensure it's loaded
  const MONGODB_URI = process.env.MONGODB_URI;
  
  // Do not throw at import time to allow the Next.js dev server to boot without DB
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Set it in .env.local to enable database connectivity.');
  }
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if DB is down
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });
  }

      try {
        cached.conn = await cached.promise;
      } catch (e) {
        cached.promise = null;
        if (e.code === 'ECONNREFUSED' || (e.cause && e.cause.code === 'ECONNREFUSED') || e.name === 'MongooseServerSelectionError') {
          console.error('\n❌ MONGODB CONNECTION FAILED');
          console.error('   The application cannot connect to the database at: ' + MONGODB_URI);
          console.error('   Possible fixes:');
          console.error('   1. Ensure your local MongoDB server is running (run "mongod" in a terminal).');
          console.error('   2. Check if your connection string in .env.local is correct.');
          console.error('   3. If using Docker, ensure the container is up.\n');
        }
        throw e;
      }
  
      return cached.conn;
    }
// Named export for consistency with imports across the codebase
export { connectDB };

// Default export for backwards compatibility
export default connectDB;