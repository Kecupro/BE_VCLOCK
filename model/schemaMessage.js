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
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  seenBy: {
    type: [String],  // Danh sách userId đã xem
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
