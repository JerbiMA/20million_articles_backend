const Cart = require('./cart.model');
const Product = require('../product/product.model');
const { ApiError } = require('../../shared/utils');

const cartService = {
  /**
   * Get or create a cart for the current user/session.
   */
  async getCart(userId, sessionId) {
    const filter = userId ? { user: userId } : { sessionId };

    let cart = await Cart.findOne(filter)
      .populate({
        path: 'items.product',
        select: 'name slug price salePrice images sizes isActive',
      })
      .lean({ virtuals: true });

    if (!cart) {
      cart = { items: [], totalItems: 0, subtotal: 0 };
    }

    return cart;
  },

  /**
   * Add an item to the cart.
   */
  async addItem(userId, sessionId, { productId, size, quantity = 1 }) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found or unavailable');
    }

    // Validate size and stock
    const sizeVariant = product.sizes.find((s) => s.size === size);
    if (!sizeVariant) {
      throw ApiError.badRequest(`Size ${size} is not available for this product`);
    }

    const filter = userId ? { user: userId } : { sessionId };
    let cart = await Cart.findOne(filter);

    if (!cart) {
      cart = new Cart({ user: userId || undefined, sessionId: userId ? undefined : sessionId });
    }

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size,
    );

    const effectivePrice =
      product.salePrice != null && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > sizeVariant.stock) {
        throw ApiError.badRequest(
          `Only ${sizeVariant.stock} items available in size ${size}`,
        );
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].priceAtAdd = effectivePrice;
    } else {
      if (quantity > sizeVariant.stock) {
        throw ApiError.badRequest(
          `Only ${sizeVariant.stock} items available in size ${size}`,
        );
      }
      cart.items.push({
        product: productId,
        size,
        quantity,
        priceAtAdd: effectivePrice,
      });
    }

    await cart.save();

    return Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price salePrice images sizes isActive',
      })
      .lean({ virtuals: true });
  },

  /**
   * Update item quantity in cart.
   */
  async updateItem(userId, sessionId, itemId, quantity) {
    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw ApiError.notFound('Item not found in cart');
    }

    // Validate stock
    const product = await Product.findById(item.product);
    if (!product) {
      throw ApiError.notFound('Product no longer exists');
    }

    const sizeVariant = product.sizes.find((s) => s.size === item.size);
    if (sizeVariant && quantity > sizeVariant.stock) {
      throw ApiError.badRequest(
        `Only ${sizeVariant.stock} items available in size ${item.size}`,
      );
    }

    if (quantity <= 0) {
      cart.items.pull({ _id: itemId });
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    return Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price salePrice images sizes isActive',
      })
      .lean({ virtuals: true });
  },

  /**
   * Remove an item from the cart.
   */
  async removeItem(userId, sessionId, itemId) {
    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw ApiError.notFound('Item not found in cart');
    }

    cart.items.pull({ _id: itemId });
    await cart.save();

    return Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price salePrice images sizes isActive',
      })
      .lean({ virtuals: true });
  },

  /**
   * Clear all items from the cart.
   */
  async clearCart(userId, sessionId) {
    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    cart.items = [];
    await cart.save();
    return cart;
  },

  /**
   * Merge a guest cart into a user's cart after login.
   */
  async mergeGuestCart(userId, sessionId) {
    if (!sessionId) {
      return;
    }

    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) {
      return;
    }

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      // Transfer guest cart to user
      guestCart.user = userId;
      guestCart.sessionId = null;
      await guestCart.save();
      return;
    }

    // Merge: add guest items that don't already exist in user cart
    for (const guestItem of guestCart.items) {
      const existingIndex = userCart.items.findIndex(
        (item) =>
          item.product.toString() === guestItem.product.toString() &&
          item.size === guestItem.size,
      );

      if (existingIndex >= 0) {
        // Update quantity (take the higher quantity)
        userCart.items[existingIndex].quantity = Math.max(
          userCart.items[existingIndex].quantity,
          guestItem.quantity,
        );
      } else {
        userCart.items.push(guestItem);
      }
    }

    await userCart.save();
    await Cart.findByIdAndDelete(guestCart._id);
  },
};

module.exports = cartService;
