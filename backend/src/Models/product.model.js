import mongoose from 'mongoose';

function arrayLimit(val) {
    return val.length > 0;
  }

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  price: {
    type: Number,
    required: true,
  },

  images: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'At least one image is required'],
  },

  category: {
    type: String,
    required: true,
  },

  location: String,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  condition: {
    type: String,
    enum: ['new', 'used'],
    default: 'used',
  },
  negotiable: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
