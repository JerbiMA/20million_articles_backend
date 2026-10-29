const mongoose = require('mongoose');
const slugify = require('slugify');
const { SIZES } = require('../../shared/constants');

/**
 * Size variant sub-schema.
 * Each product has multiple size variants, each with its own stock quantity.
 */
const sizeVariantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: SIZES,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  },
  { _id: false },
);

/**
 * Product image sub-schema.
 */
const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isMain: { type: Boolean, default: false },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true,
    },
    images: [productImageSchema],
    sizes: {
      type: [sizeVariantSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one size variant is required',
      },
    },
    season: {
      type: String,
      trim: true,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ────────────────────────────────────
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ team: 1, isActive: 1 });

// ─── Virtuals ───────────────────────────────────
/**
 * Total stock across all size variants.
 */
productSchema.virtual('totalStock').get(function () {
  return this.sizes.reduce((sum, variant) => sum + variant.stock, 0);
});

/**
 * Whether the product is in stock.
 */
productSchema.virtual('inStock').get(function () {
  return this.sizes.some((variant) => variant.stock > 0);
});

/**
 * Effective price (sale price if available, otherwise regular price).
 */
productSchema.virtual('effectivePrice').get(function () {
  return this.salePrice != null && this.salePrice < this.price
    ? this.salePrice
    : this.price;
});

/**
 * Main image URL (first image marked as main, or the first image).
 */
productSchema.virtual('mainImage').get(function () {
  if (!this.images || this.images.length === 0) {
    return null;
  }
  const main = this.images.find((img) => img.isMain);
  return main ? main.url : this.images[0].url;
});

// ─── Auto-generate slug ─────────────────────────
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
