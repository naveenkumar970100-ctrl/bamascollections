import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
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

function getBase64DataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

async function storeAllImagesInDatabase() {
  try {
    await connectDB();
    console.log('📡 Connected to MongoDB Atlas. Storing images directly into database...');

    // 1. Store Brand Logo & Hero Banner in SiteConfig
    const logoPath = path.join(assetsDir, 'bamas-logo.jpg');
    const heroPath = path.join(assetsDir, 'saree-hero.jpg');

    const updateConfig = {};
    if (fs.existsSync(logoPath)) {
      const logoDataUri = getBase64DataUri(logoPath);
      updateConfig.logoUrl = logoDataUri;
      console.log(`📦 Brand Logo converted to Data URI (${Math.round(logoDataUri.length / 1024)} KB)`);
    }

    if (fs.existsSync(heroPath)) {
      const heroDataUri = getBase64DataUri(heroPath);
      updateConfig.heroBannerUrl = heroDataUri;
      console.log(`📦 Hero Banner converted to Data URI (${Math.round(heroDataUri.length / 1024)} KB)`);
    }

    if (Object.keys(updateConfig).length > 0) {
      await SiteConfig.findOneAndUpdate({}, updateConfig, { new: true, upsert: true });
      console.log('✅ SiteConfig successfully updated in MongoDB Atlas with base64 images!');
    }

    // 2. Store each saree image into MongoDB Product document
    for (const item of imageMappings) {
      const filePath = path.join(assetsDir, item.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        continue;
      }

      const dataUri = getBase64DataUri(filePath);
      const sizeKb = Math.round(dataUri.length / 1024);
      console.log(`💾 Storing ${item.file} for saree "${item.slug}" (${sizeKb} KB) in MongoDB...`);

      const updated = await Product.findOneAndUpdate(
        { slug: item.slug },
        {
          image: dataUri,
          images: [dataUri],
        },
        { new: true }
      );

      if (updated) {
        console.log(`✨ [${updated.name}] successfully updated with image in database!`);
      } else {
        console.warn(`⚠️ Could not find product with slug "${item.slug}"`);
      }
    }

    console.log('\n🎉 [SUCCESS]: All saree images & branding stored directly in MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error storing images into database:', err);
    process.exit(1);
  }
}

storeAllImagesInDatabase();
