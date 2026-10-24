import dns from 'dns';
import mongoose from 'mongoose';

// Fix for Node.js on Windows resolving SRV records for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  console.log('[DNS Config]: Configured Google (8.8.8.8) & Cloudflare (1.1.1.1) DNS servers.');
} catch (e) {
  console.warn('[DNS Warning]: Could not set custom DNS servers:', e.message);
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn(
      '\n⚠️ [MongoDB Notice]: MONGO_URI is not configured in backend/.env.\n' +
      '   Please set your MongoDB Atlas credentials in backend/.env:\n' +
      '   MONGO_URI=mongodb+srv://<username>:<password>@bamascollenctions.uefgz3u.mongodb.net/bamascollections?retryWrites=true&w=majority\n'
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      family: 4,
    });
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    // Do not crash in development so helpful views remain accessible
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
