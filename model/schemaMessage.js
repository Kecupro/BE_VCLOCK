const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderAvatar: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  file: {
    type: String,
    default: '',
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'products'],
    default: 'text',
  },
  products: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      sale_price: { type: Number, default: 0 },
      main_image: {
        image: { type: String, required: true },
        alt: { type: String, default: '' },
      },
      brand: {
        _id: { type: String, required: true },
        name: { type: String, required: true },
      },
    },
  ],
  seenBy: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true,
  collection: "messages"
});

module.exports = MessageSchema;