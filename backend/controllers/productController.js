import mongoose from 'mongoose';
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import { dispatchNotification } from './notificationController.js';
import { emitToAdmins, emitBroadcast } from '../config/socket.js';
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
      query.category = { $regex: new RegExp(escapedCategory, 'i') };
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

    // Process multiple images if provided
    if (images && Array.isArray(images)) {
      const processedImages = [];
      for (let img of images) {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          try {
            const uploadRes = await cloudinary.uploader.upload(img, {
              folder: 'bamascollections/products',
            });
            processedImages.push(uploadRes.secure_url);
          } catch (uploadErr) {
            console.error('[Cloudinary Auto-Upload Error]:', uploadErr);
            processedImages.push(img);
          }
        } else if (img) {
          processedImages.push(img);
        }
      }
      images = processedImages;
    }

    // Auto-upload primary image base64 to Cloudinary if needed
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

    // Consolidate final images array
    const finalImagesList = [];
    if (image) finalImagesList.push(image);
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (img && !finalImagesList.includes(img)) {
          finalImagesList.push(img);
        }
      });
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
      image: image || (finalImagesList.length > 0 ? finalImagesList[0] : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
      images: finalImagesList.length > 0 ? finalImagesList : (image ? [image] : []),
      inStock: inStock !== undefined ? inStock : true,
      countInStock: countInStock !== undefined ? countInStock : 10,
      isFeatured: Boolean(isFeatured),
      position: position || '',
      zariAuthenticity: req.body.zariAuthenticity,
      blousePiece: req.body.blousePiece,
      drapeLength: req.body.drapeLength,
      careInstructions: req.body.careInstructions,
      shippingReturns: req.body.shippingReturns,
      highlights: req.body.highlights,
      customSpecs: req.body.customSpecs,
      taxNotice: req.body.taxNotice,
      certificationNotice: req.body.certificationNotice,
      whatsappText: req.body.whatsappText,
      whatsappNumber: req.body.whatsappNumber,
    });

    const formattedCreated = renderProductView(product);
    emitBroadcast('product:created', formattedCreated);

    return renderSuccess(res, 201, 'Product created successfully', formattedCreated);
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

    // Process multiple images if provided in update
    if (updateData.images && Array.isArray(updateData.images)) {
      const processedImages = [];
      for (let img of updateData.images) {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          try {
            const uploadRes = await cloudinary.uploader.upload(img, {
              folder: 'bamascollections/products',
            });
            processedImages.push(uploadRes.secure_url);
          } catch (uploadErr) {
            console.error('[Cloudinary Auto-Upload Error]:', uploadErr);
            processedImages.push(img);
          }
        } else if (img) {
          processedImages.push(img);
        }
      }
      updateData.images = processedImages;
    }

    // Auto-upload primary base64 to Cloudinary if needed
    if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(updateData.image, {
          folder: 'bamascollections/products',
        });
        updateData.image = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error('[Cloudinary Auto-Upload Error]:', uploadErr);
      }
    }

    // Ensure images and image are synchronized
    if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0) {
      if (!updateData.image) {
        updateData.image = updateData.images[0];
      } else if (!updateData.images.includes(updateData.image)) {
        updateData.images.unshift(updateData.image);
      }
    } else if (updateData.image) {
      updateData.images = [updateData.image];
    }

    Object.assign(product, updateData);
    const updatedProduct = await product.save();
    const formattedUpdated = renderProductView(updatedProduct);

    // ⚡ Real-Time WebSocket Emission: update all connected clients immediately
    emitBroadcast('product:updated', formattedUpdated);

    return renderSuccess(res, 200, 'Product updated successfully', formattedUpdated);
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

    const deletedId = req.params.id;
    const deletedSlug = product.slug;
    await product.deleteOne();

    // ⚡ Real-Time WebSocket Emission: notify all clients of removal
    emitBroadcast('product:deleted', { id: deletedId, slug: deletedSlug });

    return renderSuccess(res, 200, 'Product removed from collection', { id: deletedId, slug: deletedSlug });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update product review with star rating and customer photos
 * @route   POST /api/products/:idOrSlug/reviews
 * @access  Public / Authenticated
 */
export const createProductReview = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let { rating, comment, images, name, orderId } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return renderError(res, 400, 'Please provide a star rating between 1 and 5');
    }

    if (!comment || !comment.trim()) {
      return renderError(res, 400, 'Please write your review thoughts');
    }

    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
    }
    if (!product) {
      return renderError(res, 404, 'Saree product not found in collection');
    }

    // Process customer uploaded review images if any (e.g. data:image base64 upload to Cloudinary)
    let processedImages = [];
    if (images && Array.isArray(images)) {
      for (let img of images) {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          try {
            const uploadRes = await cloudinary.uploader.upload(img, {
              folder: 'bamascollections/reviews',
            });
            processedImages.push(uploadRes.secure_url);
          } catch (uploadErr) {
            console.error('[Cloudinary Review Image Upload Error]:', uploadErr);
            processedImages.push(img);
          }
        } else if (img && typeof img === 'string') {
          processedImages.push(img);
        }
      }
    }

    const reviewerName = name?.trim() || req.user?.name || 'Valued Patron';
    const userId = req.user?._id || null;

    if (!product.reviews) {
      product.reviews = [];
    }

    // Check if user already reviewed this order or product
    if (userId || orderId) {
      const alreadyReviewed = product.reviews.find(
        (r) =>
          (orderId && r.order && r.order.toString() === orderId.toString()) ||
          (userId && r.user && r.user.toString() === userId.toString() && !orderId)
      );
      if (alreadyReviewed) {
        alreadyReviewed.rating = Number(rating);
        alreadyReviewed.comment = comment.trim();
        if (processedImages.length > 0) {
          alreadyReviewed.images = processedImages;
        }
        product.numReviews = product.reviews.length;
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;

        await product.save();
        return renderSuccess(res, 200, 'Review updated successfully', {
          product: renderProductView(product),
          review: alreadyReviewed,
        });
      }
    }

    const review = {
      name: reviewerName,
      rating: Number(rating),
      comment: comment.trim(),
      images: processedImages,
      user: userId,
      order: orderId && mongoose.Types.ObjectId.isValid(orderId) ? orderId : null,
      verifiedPurchase: true,
    };

    product.reviews.unshift(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    // Dispatch real-time notification to Admin
    try {
      await dispatchNotification({
        recipientRole: 'admin',
        sender: userId || null,
        senderName: reviewerName,
        title: `⭐ New ${rating}-Star Customer Review on ${product.name}`,
        message: `${reviewerName} shared a ${rating}★ review with ${processedImages.length} photo(s): "${comment.slice(0, 80)}..."`,
        type: 'review',
        targetUrl: '/admin',
      });
    } catch (notifErr) {
      console.warn('Review notification error:', notifErr.message);
    }

    // ⚡ Real-Time WebSocket Emission: new review
    emitToAdmins('review:new', { productId: product._id, review: product.reviews[0] });
    emitBroadcast('review:new', { productId: product._id, review: product.reviews[0] });

    return renderSuccess(res, 201, 'Review submitted successfully', {
      product: renderProductView(product),
      review: product.reviews[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch all reviews across all products for Admin Dashboard
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
export const getAllReviewsForAdmin = async (req, res, next) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } }).select(
      'name slug image category reviews rating numReviews'
    );

    const allReviews = [];
    products.forEach((p) => {
      (p.reviews || []).forEach((r) => {
        allReviews.push({
          _id: r._id,
          id: r._id,
          productId: p._id,
          productName: p.name,
          productSlug: p.slug,
          productImage: p.image,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          images: r.images || [],
          verifiedPurchase: r.verifiedPurchase,
          createdAt: r.createdAt,
          user: r.user,
          order: r.order,
        });
      });
    });

    // Sort newest reviews first
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return renderSuccess(res, 200, `Found ${allReviews.length} customer reviews`, allReviews);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review from a product
 * @route   DELETE /api/admin/reviews/:productId/:reviewId
 * @access  Private/Admin
 */
export const deleteProductReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return renderError(res, 404, 'Product not found');
    }

    product.reviews = product.reviews.filter((r) => r._id.toString() !== reviewId);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length
        : 5.0;

    await product.save();

    // ⚡ Real-Time WebSocket Emission: deleted review
    emitToAdmins('review:deleted', { productId, reviewId });
    emitBroadcast('review:deleted', { productId, reviewId });

    return renderSuccess(res, 200, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};
