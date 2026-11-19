import dns from 'dns';
import mongoose from 'mongoose';

// Fix for Node.js resolving SRV records for MongoDB Atlas on Windows/Vercel
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // Ignore in restricted environments
}

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb+srv://Bama123:Bama123@bamascollenctions.uefgz3u.mongodb.net/bamascollections?retryWrites=true&w=majority';

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable in .env or Vercel Settings');
}

/**
 * Global is used here to maintain a cached connection across hot reloads in development
 * and across serverless function invocations in production (Vercel).
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
      console.log(`✅ [MongoDB Atlas Connected]: ${m.connection.host} (DB: ${m.connection.name})`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error(`❌ [MongoDB Connection Error]:`, e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
