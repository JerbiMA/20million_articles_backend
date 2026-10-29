const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../../shared/constants');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },       // Snapshot
    price: { type: Number, required: true },       // Snapshot
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },          // Snapshot of main image
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipCode: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    /**
     * Registered user or null for guest checkout.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    /**
     * Guest info — used when user is not registered.
     */
    guestEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    coupon: {
      code: { type: String, default: null },
      discountAmount: { type: Number, default: 0 },
    },
    paymentMethod: {
      type: String,
      enum: ['cod'],
      default: 'cod',
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, enum: Object.values(ORDER_STATUS) },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ────────────────────────────────────
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ guestEmail: 1 }, { sparse: true });

// ─── Auto-generate order number ─────────────────
orderSchema.pre('save', async function () {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }

  // Push initial status to history
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      note: 'Order placed',
    });
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
