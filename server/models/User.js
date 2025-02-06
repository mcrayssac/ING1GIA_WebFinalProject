const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, required: false, default: false }
});

userSchema.pre('save', async function(next) {
  // If password is not modified, call next middleware
  if (!this.isModified('password')) return next();

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model(process.env.MONGO_Collection_User, userSchema);
