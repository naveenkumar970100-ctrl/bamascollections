import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Inquiry from './models/Inquiry.js';
import SiteConfig from './models/SiteConfig.js';
import products from './data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, '../frontend/src/assets');

function getBase64DataUri(fileName) {
  const filePath = path.join(assetsDir, fileName);
  if (!fs.existsSync(filePath)) return null;
  const ext = path.extname(fileName).toLowerCase().replace('.', '');
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Fix for Node.js on Windows resolving SRV records for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore if not permitted
}

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.error('❌ [Seeder Error]: MONGO_URI is missing or unconfigured in backend/.env.');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      family: 4,
    });
    console.log(`[MongoDB Connected for Seeding]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Reset seed users, orders, inquiries and site config (Preserve all admin-created products in DB)
    await Order.deleteMany();
    await User.deleteMany();
    await Inquiry.deleteMany();
    await SiteConfig.deleteMany();

    console.log('[Seeder]: Refreshed admin auth and site config (products in database preserved).');

    // Seed brand and logo metadata in MongoDB Atlas
    const logoDataUri = getBase64DataUri('bamas-logo.jpg');
    const heroDataUri = getBase64DataUri('saree-hero.jpg');

    await SiteConfig.create({
      brandName: 'Bamas Collection',
      tagline: 'Timeless Sarees. Modern You.',
      logoUrl: logoDataUri || '/assets/bamas-logo.jpg',
      heroBannerUrl: heroDataUri || '/assets/saree-hero.jpg',
      heroHeading: 'Bamas Collection · Timeless sarees. Modern you.',
      heroSubheading: 'For the moments that become memories. Discover sarees as beautifully individual as you.',
      contactEmail: 'support@bamascollections.com',
      contactPhone: '+91 98765 43210',
    });
    console.log('[Seeder]: Seeded brand logo and site configuration in MongoDB Atlas.');

    // Create demo users
    const createdUsers = await User.create([
      {
        name: 'Bamas Admin',
        email: 'admin@bamas.com',
        password: 'admin@123',
        role: 'admin',
        phone: '+91 98765 43210',
        address: {
          street: '12 Heritage Boulevard',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500034',
          country: 'India',
        },
      },
      {
        name: 'Bama Customer',
        email: 'bama@bamas.com',
        password: 'Bama123!',
        role: 'customer',
        phone: '+91 91234 56789',
        address: {
          street: '45 Silk Loom Residency',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
        },
      },
    ]);

    console.log(`[Seeder]: Created ${createdUsers.length} seed user(s) (Admin & Customer).`);

    // Seed ONLY the authentic old collections in MongoDB
    await Product.deleteMany();
    const insertedProducts = await Product.insertMany(products);
    console.log(`[Seeder]: Seeded ${insertedProducts.length} authentic Bamas old collections in MongoDB Atlas.`);

    console.log('✅ [Seeder Complete]: Old collections and Admin account ready in MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ [Seeder Failed]: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Inquiry.deleteMany();

    console.log('🗑️ [Seeder]: All data destroyed from MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ [Seeder Destroy Failed]: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
