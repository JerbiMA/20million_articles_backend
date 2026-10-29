const mongoose = require('mongoose');
const slugify = require('slugify');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    type: {
      type: String,
      enum: ['club', 'national'],
      required: [true, 'Team type is required'],
    },
    league: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Auto-generate slug ─────────────────────────
teamSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

teamSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update && update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
});

// ─── Virtual: product count ─────────────────────
teamSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'team',
  count: true,
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
