import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
// Do not throw at import time to allow the Next.js dev server to boot without DB
if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.warn('[mongodb] MONGODB_URI is not set. Database operations will fail until it is configured.');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Set it in .env.local to enable database connectivity.');
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
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
    throw e;
  }

  return cached.conn;
}

// Named export for consistency with imports across the codebase
export { connectDB };

// Default export for backwards compatibility
export default connectDB;