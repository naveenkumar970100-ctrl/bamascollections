import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
      default: 'Bridal & Heirloom Silks',
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    detail: {
      type: String,
      required: [true, 'Please provide short detail'],
    },
    description: {
      type: String,
      default: '',
    },
    fabric: {
      type: String,
      default: 'Pure Silk & Zari',
    },
    color: {
      type: String,
      default: 'Multi',
    },
    border: {
      type: String,
      default: 'Golden Zari Border',
    },
    image: {
      type: String,
      required: [true, 'Please provide image path or URL'],
    },
    images: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    countInStock: {
      type: Number,
      default: 15,
      min: [0, 'Stock cannot be negative'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving if not supplied
productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    const cleanSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.slug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
