import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import Product from '../models/Product.js';
import SiteConfig from '../models/SiteConfig.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../../frontend/src/assets');

const imageMappings = [
  { slug: 'emerald', file: 'saree-hero.jpg' },
  { slug: 'rose', file: 'rose-saree.jpg' },
  { slug: 'ivory', file: 'ivory-saree.jpg' },
  { slug: 'wine', file: 'wine-saree.jpg' },
  { slug: 'sapphire', file: 'sapphire-saree.jpg' },
  { slug: 'maroon-bridal', file: 'maroon-saree.jpg' },
  { slug: 'tissue', file: 'tissue-saree.jpg' },
  { slug: 'lavender', file: 'lavender-saree.jpg' },
];

async function syncImages() {
  try {
    await connectDB();
    console.log('📡 Connected to MongoDB Atlas. Syncing saree images to Cloudinary...');

    // 1. Upload Logo & Hero Banner
    const logoPath = path.join(assetsDir, 'bamas-logo.jpg');
    const heroPath = path.join(assetsDir, 'saree-hero.jpg');

    if (fs.existsSync(logoPath)) {
      const logoRes = await cloudinary.uploader.upload(logoPath, {
        folder: 'bamascollections/branding',
        public_id: 'bamas-logo',
        overwrite: true,
      });
      console.log('✅ Uploaded Brand Logo:', logoRes.secure_url);

      await SiteConfig.findOneAndUpdate(
        {},
        { logoUrl: logoRes.secure_url },
        { new: true, upsert: true }
      );
    }

    if (fs.existsSync(heroPath)) {
      const heroRes = await cloudinary.uploader.upload(heroPath, {
        folder: 'bamascollections/branding',
        public_id: 'saree-hero-banner',
        overwrite: true,
      });
      console.log('✅ Uploaded Hero Banner:', heroRes.secure_url);

      await SiteConfig.findOneAndUpdate(
        {},
        { heroBannerUrl: heroRes.secure_url },
        { new: true, upsert: true }
      );
    }

    // 2. Upload each saree image and update MongoDB Product document
    for (const item of imageMappings) {
      const filePath = path.join(assetsDir, item.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        continue;
      }

      console.log(`📤 Uploading ${item.file} for saree "${item.slug}"...`);
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        folder: 'bamascollections/products',
        public_id: path.parse(item.file).name,
        overwrite: true,
      });

      const updatedProduct = await Product.findOneAndUpdate(
        { slug: item.slug },
        {
          image: uploadRes.secure_url,
          images: [uploadRes.secure_url],
        },
        { new: true }
      );

      if (updatedProduct) {
        console.log(`✨ Updated [${updatedProduct.name}] in MongoDB: ${uploadRes.secure_url}`);
      } else {
        console.warn(`⚠️ Could not find product with slug "${item.slug}"`);
      }
    }

    console.log('\n🎉 [COMPLETE]: All saree images successfully stored in Cloudinary and MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncImages();
