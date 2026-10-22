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
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
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

    // Clear existing collection data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Inquiry.deleteMany();
    await SiteConfig.deleteMany();

    console.log('[Seeder]: Cleared existing database records.');

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

    console.log(`[Seeder]: Created ${createdUsers.length} seed users (Admin & Customer).`);

    // Attach base64 images to products
    const slugToFile = {
      emerald: 'saree-hero.jpg',
      rose: 'rose-saree.jpg',
      ivory: 'ivory-saree.jpg',
      wine: 'wine-saree.jpg',
      sapphire: 'sapphire-saree.jpg',
      'maroon-bridal': 'maroon-saree.jpg',
      tissue: 'tissue-saree.jpg',
      lavender: 'lavender-saree.jpg',
    };

    const productsWithImages = products.map((prod) => {
      const fileName = slugToFile[prod.slug];
      const dataUri = fileName ? getBase64DataUri(fileName) : null;
      return {
        ...prod,
        image: dataUri || prod.image,
        images: dataUri ? [dataUri] : prod.images,
      };
    });

    // Insert products
    const insertedProducts = await Product.insertMany(productsWithImages);
    console.log(`[Seeder]: Successfully inserted ${insertedProducts.length} Bamas Collection sarees with images in MongoDB!`);

    // Create sample inquiry
    await Inquiry.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 99887 76655',
      subject: 'Custom Bridal Blouse Matching',
      message: 'I adore The Emerald Edit saree! Can this be paired with a contrast magenta unstitched blouse piece?',
      sareeInterest: 'The Emerald Edit',
      status: 'New',
    });

    console.log('[Seeder]: Sample inquiry created.');
    console.log('✅ [Seeder Complete]: All initial data imported to MongoDB Atlas!');
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
