import mongoose from 'mongoose';
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import {
  renderSuccess,
  renderError,
  renderProductView,
  renderProductListView,
} from '../views/responseView.js';

/**
 * @desc    Fetch all products with filtering, search, and sorting
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, keyword, sort } = req.query;

    const query = {};

    // Filter by category (flexible case-insensitive match)
    if (category && category !== 'All') {
      const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
    }

    // Search keyword in name or detail
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { detail: { $regex: keyword, $options: 'i' } },
        { fabric: { $regex: keyword, $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'name-asc') sortOptions = { name: 1 };

    const products = await Product.find(query).sort(sortOptions);

    return renderSuccess(
      res,
      200,
      `Found ${products.length} product(s)`,
      renderProductListView(products)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch featured collection edits
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    let products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(10);
    if (!products || products.length === 0) {
      products = await Product.find().sort({ createdAt: -1 }).limit(10);
    }
    return renderSuccess(res, 200, 'Featured sarees', renderProductListView(products));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch single product by ID or Slug
 * @route   GET /api/products/:idOrSlug
 * @access  Public
 */
export const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    }

    if (!product) {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!product) {
      return renderError(res, 404, 'Saree piece not found in collection');
    }

    return renderSuccess(res, 200, 'Product details', renderProductView(product));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    let {
      name,
      category,
      price,
      originalPrice,
      detail,
      description,
      fabric,
      color,
      border,
      image,
      images,
      inStock,
      countInStock,
      isFeatured,
      position,
    } = req.body;

    // Auto-upload base64 to Cloudinary if needed
    if (image && typeof image === 'string' && image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(image, {
          folder: 'bamascollections/products',
        });
        image = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error('[Cloudinary Auto-Upload Error]:', uploadErr);
      }
    }

    const product = await Product.create({
      name,
      category: category || 'Bridal & Heirloom Silks',
      price: price || 0,
      originalPrice: originalPrice || price || 0,
      detail: detail || description || 'Handcrafted luxury silk saree drape.',
      description: description || detail || 'Handcrafted luxury silk saree drape.',
      fabric: fabric || 'Pure Silk & Zari',
      color: color || 'Multi',
      border: border || 'Golden Zari',
      image: image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      images: images || (image ? [image] : []),
      inStock: inStock !== undefined ? inStock : true,
      countInStock: countInStock !== undefined ? countInStock : 10,
      isFeatured: Boolean(isFeatured),
      position: position || '',
    });

    return renderSuccess(res, 201, 'Product created successfully', renderProductView(product));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return renderError(res, 404, 'Product not found');
    }

    const updateData = { ...req.body };

    // Auto-upload base64 to Cloudinary if needed
    if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(updateData.image, {
          folder: 'bamascollections/products',
        });
        updateData.image = uploadRes.secure_url;
        if (updateData.images && Array.isArray(updateData.images)) {
          updateData.images = [uploadRes.secure_url, ...updateData.images.slice(1)];
        }
      } catch (uploadErr) {
        console.error('[Cloudinary Auto-Upload Error]:', uploadErr);
      }
    }

    Object.assign(product, updateData);
    const updatedProduct = await product.save();

    return renderSuccess(res, 200, 'Product updated successfully', renderProductView(updatedProduct));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return renderError(res, 404, 'Product not found');
    }

    await product.deleteOne();
    return renderSuccess(res, 200, 'Product removed from collection', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};
