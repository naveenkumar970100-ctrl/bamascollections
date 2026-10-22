import SiteConfig from '../models/SiteConfig.js';
import { renderSuccess, renderError } from '../views/responseView.js';

/**
 * @desc    Get site branding, logo, and hero configuration
 * @route   GET /api/site-config
 * @access  Public
 */
export const getSiteConfig = async (req, res, next) => {
  try {
    let config = await SiteConfig.findOne();

    if (!config) {
      config = await SiteConfig.create({
        brandName: 'Bamas Collection',
        tagline: 'Timeless Sarees. Modern You.',
        logoUrl: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1/bamascollections/branding/bamas-logo.jpg',
        heroBannerUrl: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1/bamascollections/products/saree-hero.jpg',
        heroHeading: 'Bamas Collection · Timeless sarees. Modern you.',
        heroSubheading: 'For the moments that become memories. Discover sarees as beautifully individual as you.',
      });
    }

    return renderSuccess(res, 200, 'Site configuration retrieved from MongoDB', config);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update site branding, logo, and hero banner
 * @route   PUT /api/site-config
 * @access  Private/Admin
 */
export const updateSiteConfig = async (req, res, next) => {
  try {
    let config = await SiteConfig.findOne();

    if (!config) {
      config = new SiteConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }

    const updated = await config.save();
    return renderSuccess(res, 200, 'Site configuration updated in database', updated);
  } catch (error) {
    next(error);
  }
};
