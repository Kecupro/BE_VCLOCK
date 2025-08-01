const mongoose = require('mongoose');
const userSchema = require('./schemaUser');

// xài mongo.connect để chung connect mặc định
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
