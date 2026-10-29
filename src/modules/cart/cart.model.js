const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    /**
     * Price snapshot — captured at add-to-cart time.
     * Ensures the order total reflects the price the customer saw.
     */
    priceAtAdd: {
      type: Number,
      required: true,
    },
  },
  { _id: true, timestamps: false },
);

const cartSchema = new mongoose.Schema(
  {
    /**
     * If user is logged in, cart is tied to their account.
     * If guest, this is null and sessionId is used instead.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Ensure either user or sessionId is set ─────
cartSchema.pre('validate', function () {
  if (!this.user && !this.sessionId) {
    throw new Error('Cart must be associated with a user or a session');
  }
});

// ─── Virtuals ───────────────────────────────────
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
});

// ─── Indexes ────────────────────────────────────
cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
// Expire guest carts after 7 days of inactivity
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { user: null } });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
