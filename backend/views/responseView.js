/**
 * Response View (MVC - View Layer)
 * Formats, transforms, and sanitizes data before sending responses to the client.
 */

export const renderSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const renderError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

export const renderUserView = (user, token = null) => {
  const formatted = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || {},
    addresses: user.addresses || [],
    createdAt: user.createdAt,
  };

  if (token) {
    formatted.token = token;
  }

  return formatted;
};

export const renderProductView = (product) => {
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    formattedPrice: product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Price on inquiry',
    detail: product.detail,
    description: product.description || product.detail,
    fabric: product.fabric,
    color: product.color,
    border: product.border,
    image: product.image,
    images: product.images && product.images.length ? product.images : [product.image],
    inStock: product.inStock && product.countInStock > 0,
    countInStock: product.countInStock,
    isFeatured: product.isFeatured,
    position: product.position || '',
    // Dynamic Product Detail Page (PDP) specifications & tabs
    zariAuthenticity: product.zariAuthenticity || 'Certified Tested Gold Zari',
    blousePiece: product.blousePiece || 'Included (Matching Unstitched Pure Silk, 0.8m)',
    drapeLength: product.drapeLength || '6.3 Metres (including blouse)',
    careInstructions:
      product.careInstructions ||
      '• Care: Strictly dry clean only to maintain silk texture and zari brilliance.\n• Storage: Store draped in clean, unbleached cotton muslin cloth. Avoid direct sunlight and moisture.\n• Caution: Do not spray deodorants, perfumes or harsh alcohol directly onto metallic zari.',
    shippingReturns:
      product.shippingReturns ||
      '• Insured Shipping: Complimentary express air delivery across all pin codes in India within 3–5 business days.\n• Packaging: Dispatched in our signature Bamas Collection presentation gift box with tamper-evident security seal.\n• Hassle-Free Returns: 7-day doorstep return and exchange support for any manufacturing discrepancy.',
    highlights:
      Array.isArray(product.highlights) && product.highlights.length > 0
        ? product.highlights
        : ['Tested Gold Zari', 'Free Delivery in 3–5 Days', 'Blouse Piece Included'],
    customSpecs: product.customSpecs || [],
    taxNotice: product.taxNotice || 'Taxes Included · Free Insured Dispatch',
    certificationNotice: product.certificationNotice || 'Silk Mark Certified · 100% Pure Silk',
    whatsappText: product.whatsappText || 'Questions? Chat with Bamas Stylist on WhatsApp',
    whatsappNumber: product.whatsappNumber || '919876543210',
    rating: product.rating,
    numReviews: product.numReviews,
    reviews: product.reviews || [],
    createdAt: product.createdAt,
  };
};

export const renderProductListView = (products) => {
  return products.map(renderProductView);
};
