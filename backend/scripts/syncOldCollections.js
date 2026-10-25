import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import products from '../data/products.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function syncOldCollections() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    console.log('[Connected to MongoDB Atlas]:', conn.connection.host);

    const oldSlugs = products.map((p) => p.slug);
    console.log('Old collection slugs:', oldSlugs);

    // 1. Delete all products not in the 8 old collections
    const deleteResult = await conn.connection.db.collection('products').deleteMany({
      slug: { $nin: oldSlugs },
    });
    console.log(`Deleted ${deleteResult.deletedCount} non-old / test products from database.`);

    // 2. Upsert each of the 8 old collections so they are all present and fully updated
    for (const prod of products) {
      await conn.connection.db.collection('products').updateOne(
        { slug: prod.slug },
        {
          $set: {
            name: prod.name,
            slug: prod.slug,
            category: prod.category,
            price: prod.price,
            originalPrice: prod.originalPrice || prod.price,
            detail: prod.detail,
            description: prod.description || prod.detail,
            fabric: prod.fabric,
            color: prod.color,
            border: prod.border,
            image: prod.image,
            images: prod.images || [prod.image],
            inStock: prod.inStock !== undefined ? prod.inStock : true,
            countInStock: prod.countInStock || 10,
            isFeatured: true,
            position: prod.position || '',
            rating: prod.rating || 5.0,
            numReviews: prod.numReviews || 20,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`✓ Synced old collection in DB: ${prod.name} (${prod.category} - ₹${prod.price})`);
    }

    const count = await conn.connection.db.collection('products').countDocuments();
    console.log(`\n✅ Database now stores ONLY the ${count} authentic old collections!`);

    const storedProducts = await conn.connection.db.collection('products').find({}).toArray();
    storedProducts.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name} | ${p.category} | ₹${p.price} | Image: ${p.image?.slice(0, 60)}...`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error syncing old collections:', err);
    process.exit(1);
  }
}

syncOldCollections();
