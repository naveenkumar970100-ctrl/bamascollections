import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Please provide reviewer name'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
    },
    images: {
      type: [String],
      default: [],
    },
    verifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

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
    // Dynamic Product Detail Page (PDP) specifications & tabs
    zariAuthenticity: {
      type: String,
      default: 'Certified Tested Gold Zari',
    },
    blousePiece: {
      type: String,
      default: 'Included (Matching Unstitched Pure Silk, 0.8m)',
    },
    drapeLength: {
      type: String,
      default: '6.3 Metres (including blouse)',
    },
    careInstructions: {
      type: String,
      default:
        '• Care: Strictly dry clean only to maintain silk texture and zari brilliance.\n• Storage: Store draped in clean, unbleached cotton muslin cloth. Avoid direct sunlight and moisture.\n• Caution: Do not spray deodorants, perfumes or harsh alcohol directly onto metallic zari.',
    },
    shippingReturns: {
      type: String,
      default:
        '• Insured Shipping: Complimentary express air delivery across all pin codes in India within 3–5 business days.\n• Packaging: Dispatched in our signature Bamas Collection presentation gift box with tamper-evident security seal.\n• Hassle-Free Returns: 7-day doorstep return and exchange support for any manufacturing discrepancy.',
    },
    highlights: {
      type: [String],
      default: ['Tested Gold Zari', 'Free Delivery in 3–5 Days', 'Blouse Piece Included'],
    },
    customSpecs: [
      {
        label: { type: String, default: '' },
        value: { type: String, default: '' },
      },
    ],
    taxNotice: {
      type: String,
      default: 'Taxes Included · Free Insured Dispatch',
    },
    certificationNotice: {
      type: String,
      default: 'Silk Mark Certified · 100% Pure Silk',
    },
    whatsappText: {
      type: String,
      default: 'Questions? Chat with Bamas Stylist on WhatsApp',
    },
    whatsappNumber: {
      type: String,
      default: '919876543210',
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
    reviews: [reviewSchema],
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
