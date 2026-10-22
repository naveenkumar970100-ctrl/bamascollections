import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: 'Bamas Collection',
    },
    tagline: {
      type: String,
      default: 'Timeless Sarees. Modern You.',
    },
    logoUrl: {
      type: String,
      default: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1/bamascollections/branding/bamas-logo.jpg',
    },
    heroBannerUrl: {
      type: String,
      default: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1/bamascollections/products/saree-hero.jpg',
    },
    heroHeading: {
      type: String,
      default: 'Bamas Collection · Timeless sarees. Modern you.',
    },
    heroSubheading: {
      type: String,
      default: 'For the moments that become memories. Discover sarees as beautifully individual as you.',
    },
    contactEmail: {
      type: String,
      default: 'support@bamascollections.com',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
  },
  {
    timestamps: true,
  }
);

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export default SiteConfig;
