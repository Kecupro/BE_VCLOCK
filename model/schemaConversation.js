const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true,
  },
  participants:{
    type: [
      {
        userId: String,
        userName: String,
        userAvatar: String,
        role: { type: String, enum: ['user', 'admin', 'bot'], default: 'user' },
        unreadCount: { type: Number, default: 0 }
      }
    ],
    default: [] 
  }
  ,
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  lastMessageSenderId: {
    type: String,
    default: '',
  },
  lastTime: {
    type: Date,
    default: Date.now,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
}, { 
    timestamps: true,
    collection: "conversations"
 });

module.exports = ConversationSchema;