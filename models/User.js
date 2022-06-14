import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tasks: [
    {
      title: String,
      description: String,
      completed: Boolean,
      createdAt: Date,
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
  otp: Number,
  otp_expiry: Date,
  resetPasswordOtp: Number,
  resetPasswordOtpExpiry: Date,
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model('User', userSchema);
