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
    rating: product.rating,
    numReviews: product.numReviews,
    createdAt: product.createdAt,
  };
};

export const renderProductListView = (products) => {
  return products.map(renderProductView);
};
