import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Fix for Node.js on Windows resolving SRV records for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {}

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI is missing in .env');
  process.exit(1);
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  detail: { type: String },
  description: { type: String },
  fabric: { type: String },
  color: { type: String },
  border: { type: String },
  image: { type: String, required: true },
  images: [{ type: String }],
  inStock: { type: Boolean, default: true },
  countInStock: { type: Number, default: 10 },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 5 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const seedProducts = [
  {
    name: 'The Emerald Edit',
    slug: 'emerald',
    category: 'Festive',
    price: 14500,
    originalPrice: 16800,
    detail: 'Deep emerald tones, a graceful drape and an ornate golden border. A celebration of timeless saree style.',
    description: 'Woven with pristine heritage artistry, The Emerald Edit showcases a rich bottle-green base punctuated by intricate floral zari borders and an elaborate pallu.',
    fabric: 'Pure Mulberry Silk with Rich Gold Zari',
    color: 'Emerald Green',
    border: 'Antique Gold Zari Border',
    image: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690711/bamascollections/products/saree-hero.jpg',
    images: [
      'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690711/bamascollections/products/saree-hero.jpg',
    ],
    inStock: true,
    countInStock: 8,
    isFeatured: true,
    rating: 5.0,
    numReviews: 24,
  },
  {
    name: 'Rose Reverie',
    slug: 'rose',
    category: 'Silk',
    price: 12800,
    originalPrice: 14200,
    detail: 'Soft rose hues meet intricate golden motifs in a refined, romantic silhouette.',
    description: 'Delicate yet unforgettable. Rose Reverie merges pastel blush silk with micro-zari motifs across the body.',
    fabric: 'Handloom Kora Silk',
    color: 'Dusty Rose Pink',
    border: 'Rose Gold Floral Weave',
    image: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690712/bamascollections/products/rose-saree.jpg',
    images: [
      'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690712/bamascollections/products/rose-saree.jpg',
    ],
    inStock: true,
    countInStock: 12,
    isFeatured: true,
    rating: 4.9,
    numReviews: 19,
  },
  {
    name: 'Royal Sapphire Silk',
    slug: 'sapphire',
    category: 'Silk',
    price: 17500,
    originalPrice: 19800,
    detail: 'A luminous royal sapphire blue silk saree woven with timeless antique gold zari borders and regal peacock motifs.',
    description: 'Fit for royalty. Hand-spun deep sapphire blue silk paired with opulent pure zari weaving on pallu and borders.',
    fabric: 'Kanchipuram Brocade Silk',
    color: 'Royal Sapphire Blue',
    border: 'Heritage Temple Peacock Border',
    image: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690713/bamascollections/products/sapphire-saree.jpg',
    images: [
      'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690713/bamascollections/products/sapphire-saree.jpg',
    ],
    inStock: true,
    countInStock: 6,
    isFeatured: true,
    rating: 5.0,
    numReviews: 31,
  },
  {
    name: 'Noor Banarasi Bridal',
    slug: 'maroon-bridal',
    category: 'Bridal',
    price: 24500,
    originalPrice: 28000,
    detail: 'Opulent crimson maroon Banarasi bridal saree adorned with intricate golden jaal work and rich royal pallu.',
    description: 'The pinnacle of bridal elegance. Heavy pure silk woven with uncompromised gold zari jaal artistry.',
    fabric: 'Pure Katan Silk Banarasi',
    color: 'Deep Crimson Maroon',
    border: 'Royal Floral Jaal Border',
    image: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690714/bamascollections/products/maroon-saree.jpg',
    images: [
      'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690714/bamascollections/products/maroon-saree.jpg',
    ],
    inStock: true,
    countInStock: 4,
    isFeatured: true,
    rating: 5.0,
    numReviews: 42,
  },
  {
    name: 'Gilded Tissue Elegance',
    slug: 'tissue',
    category: 'Festive',
    price: 15200,
    originalPrice: 17500,
    detail: 'Effortlessly luminous champagne gold tissue silk saree designed with understated lotus motifs and fluid drape.',
    description: 'A contemporary take on metallic luxury. Ultra-lightweight champagne gold tissue threads intertwined with soft spun silk.',
    fabric: 'Champagne Tissue Metallic Silk',
    color: 'Shimmering Champagne Gold',
    border: 'Lotus Temple Zari Weave',
    image: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690716/bamascollections/products/tissue-saree.jpg',
    images: [
      'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690716/bamascollections/products/tissue-saree.jpg',
    ],
    inStock: true,
    countInStock: 10,
    isFeatured: true,
    rating: 4.9,
    numReviews: 18,
  },
  {
    name: 'Lavender Whisper Organza',
    slug: 'lavender',
    category: 'Silk',
    price: 13400,
    originalPrice: 15000,
    detail: 'Ethereal pastel lilac organza saree embellished with delicate silver gota patti work and scalloped borders.',
    description: 'Light as summer mist. Pure organza base washed in subtle pastel lavender, accented with hand-cut scalloped borders.',
    fabric: 'Pure Organza Silk',
    color: 'Pastel Lilac Lavender',
    border: 'Hand-embroidered Scalloped Gota Patti',
    image: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690717/bamascollections/products/lavender-saree.jpg',
    images: [
      'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690717/bamascollections/products/lavender-saree.jpg',
    ],
    inStock: true,
    countInStock: 11,
    isFeatured: true,
    rating: 4.8,
    numReviews: 16,
  },
];

async function seed() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, family: 4 });
    console.log('✅ Connected to MongoDB Atlas');

    for (const p of seedProducts) {
      await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${seedProducts.length} core collection sarees successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

seed();
