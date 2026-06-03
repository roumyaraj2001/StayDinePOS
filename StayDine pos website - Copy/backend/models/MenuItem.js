const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['food', 'beverages', 'combos', 'sides', 'desserts', 'appetizers'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountedPrice: Number,
  image: String,
  isVegetarian: {
    type: Boolean,
    default: false,
  },
  isSpigy: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'none'],
    default: 'none',
  },
  prepTime: {
    type: Number,
    default: 15, // in minutes
  },
  availability: {
    type: Boolean,
    default: true,
  },
  ingredients: [String],
  allergens: [String],
  station: {
    type: String,
    enum: ['main_kitchen', 'beverages', 'counter'],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
