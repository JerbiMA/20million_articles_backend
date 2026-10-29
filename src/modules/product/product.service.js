const Product = require('./product.model');
const { ApiError } = require('../../shared/utils');
const { PAGINATION } = require('../../shared/constants');
const { deleteImage } = require('../../config');

const productService = {
  /**
   * Get paginated products with filters.
   */
  async getProducts({
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sort = '-createdAt',
    category,
    team,
    minPrice,
    maxPrice,
    size,
    search,
    isFeatured,
    isActive = true,
    tag,
  } = {}) {
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (category) {
      filter.category = category;
    }
    if (team) {
      filter.team = team;
    }
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }
    if (tag) {
      filter.tags = tag;
    }
    if (size) {
      filter['sizes.size'] = size;
      filter['sizes.stock'] = { $gt: 0 };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const safePage = Math.max(1, parseInt(page, 10));
    const safeLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    // Build sort object
    let sortObj = {};
    if (search && !sort) {
      sortObj = { score: { $meta: 'textScore' } };
    } else {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(safeLimit)
        .populate('category', 'name slug')
        .populate('team', 'name slug logo')
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
    };
  },

  /**
   * Get a single product by ID or slug.
   */
  async getProductByIdOrSlug(identifier) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const filter = isObjectId ? { _id: identifier } : { slug: identifier };

    const product = await Product.findOne(filter)
      .populate('category', 'name slug')
      .populate('team', 'name slug logo type')
      .lean({ virtuals: true });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  },

  /**
   * Create a new product.
   */
  async createProduct(data) {
    const product = await Product.create(data);
    return product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'team', select: 'name slug logo' },
    ]);
  },

  /**
   * Update a product.
   */
  async updateProduct(productId, updateData) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Merge update data
    Object.assign(product, updateData);
    await product.save();

    return product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'team', select: 'name slug logo' },
    ]);
  },

  /**
   * Delete a product and its Cloudinary images.
   */
  async deleteProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Clean up all Cloudinary images
    const deletePromises = product.images
      .filter((img) => img.publicId)
      .map((img) => deleteImage(img.publicId));
    await Promise.allSettled(deletePromises);

    await Product.findByIdAndDelete(productId);
    return product;
  },

  /**
   * Add images to a product.
   */
  async addImages(productId, images) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // If no existing images, mark the first new one as main
    if (product.images.length === 0 && images.length > 0) {
      images[0].isMain = true;
    }

    product.images.push(...images);
    await product.save();
    return product;
  },

  /**
   * Remove an image from a product.
   */
  async removeImage(productId, imageId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const image = product.images.id(imageId);
    if (!image) {
      throw ApiError.notFound('Image not found');
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await deleteImage(image.publicId);
    }

    const wasMain = image.isMain;
    product.images.pull({ _id: imageId });

    // If deleted image was main, set the first remaining image as main
    if (wasMain && product.images.length > 0) {
      product.images[0].isMain = true;
    }

    await product.save();
    return product;
  },

  /**
   * Update stock for a specific size variant.
   */
  async updateStock(productId, size, stock) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const variant = product.sizes.find((s) => s.size === size);
    if (!variant) {
      throw ApiError.badRequest(`Size ${size} not found for this product`);
    }

    variant.stock = stock;
    await product.save();
    return product;
  },

  /**
   * Get featured products.
   */
  async getFeaturedProducts(limit = 8) {
    return Product.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .populate('team', 'name slug logo')
      .lean({ virtuals: true });
  },

  /**
   * Get related products (same category or team).
   */
  async getRelatedProducts(productId, limit = 4) {
    const product = await Product.findById(productId);
    if (!product) {
      return [];
    }

    return Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [{ category: product.category }, { team: product.team }],
    })
      .limit(limit)
      .populate('category', 'name slug')
      .populate('team', 'name slug logo')
      .lean({ virtuals: true });
  },
};

module.exports = productService;
