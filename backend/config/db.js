import dns from 'dns';
import mongoose from 'mongoose';

// Fix for Node.js on Windows resolving SRV records for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Do not crash in development so helpful views remain accessible
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
