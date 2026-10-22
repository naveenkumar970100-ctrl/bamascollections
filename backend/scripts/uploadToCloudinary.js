import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../../frontend/src/assets');

const imageFiles = [
  { name: 'logo', file: 'bamas-logo.jpg', folder: 'bamascollections/branding' },
  { name: 'emerald', file: 'saree-hero.jpg', folder: 'bamascollections/products' },
  { name: 'sapphire', file: 'sapphire-saree.jpg', folder: 'bamascollections/products' },
  { name: 'maroon-bridal', file: 'maroon-saree.jpg', folder: 'bamascollections/products' },
  { name: 'tissue', file: 'tissue-saree.jpg', folder: 'bamascollections/products' },
  { name: 'rose', file: 'rose-saree.jpg', folder: 'bamascollections/products' },
  { name: 'lavender', file: 'lavender-saree.jpg', folder: 'bamascollections/products' },
  { name: 'ivory', file: 'ivory-saree.jpg', folder: 'bamascollections/products' },
  { name: 'wine', file: 'wine-saree.jpg', folder: 'bamascollections/products' },
];

async function uploadAll() {
  console.log('🚀 Starting Cloudinary upload using credentials...');
  const uploadedUrls = {};

  for (const item of imageFiles) {
    const fullPath = path.join(assetsDir, item.file);
    try {
      console.log(`Uploading ${item.file} to Cloudinary folder ${item.folder}...`);
      const result = await cloudinary.uploader.upload(fullPath, {
        folder: item.folder,
        public_id: item.name,
        overwrite: true,
        resource_type: 'image',
      });
      uploadedUrls[item.name] = result.secure_url;
      console.log(`✅ Uploaded ${item.name}: ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ Failed to upload ${item.file}:`, err.message);
    }
  }

  console.log('\n--- UPLOAD SUMMARY ---');
  console.log(JSON.stringify(uploadedUrls, null, 2));
}

uploadAll();
