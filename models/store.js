const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    username: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zip: {
        type: String,
        required: true,
        match: /^[0-9]{5}(?:-[0-9]{4})?$/,
      },
      country: { type: String, required: true, trim: true },
    },
    contact: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/, 
    },
    createdAt: { type: Date, default: Date.now },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Store', storeSchema);
