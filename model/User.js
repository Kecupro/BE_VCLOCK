const mongoose = require('mongoose');
const userSchema = require('./schemaUser');
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;