import fs from 'fs';

import cloudinary from 'cloudinary';

import { User } from '../models/User.js';
import { sendMail } from '../utils/sendMail.js';
import { sendToken } from '../utils/sendToken.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const avatar = req.files.avatar.tempFilePath;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: 'todo-app',
    });

    fs.rmSync('./tmp', {
      recursive: true,
    });

    const otp = Math.floor(Math.random() * 1000000);

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      otp,
      otp_expiry: Date.now() + process.env.OTP_EXPIRY * 60 * 1000, // OTP_EXPIRY is set to 5 minutes
    });

    await sendMail(email, 'Verify your account', `Your OTP is ${otp}`);

    sendToken(
      res,
      user,
      201,
      'OTP Sent to your email, please verify your account.'
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);

    const user = await User.findById(req.user.id);

    if (user.otp !== otp || user.OTP_EXPIRY < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or expired',
      });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendToken(res, user, 200, 'Account verified successfully');
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    sendToken(res, user, 200, 'Login successful');
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token');

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    const user = await User.findById(req.user.id);

    user.tasks.push({
      title,
      description,
      completed: false,
      createdAt: Date.now(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task added successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user.id);

    user.tasks = user.tasks.filter(
      (task) => task._id.toString() !== taskId.toString()
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task removed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user.id);

    user.task = user.tasks.find(
      (task) => task._id.toString() === taskId.toString()
    );

    user.task.completed = !user.task.completed;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    sendToken(res, user, 200, `Welcome Back ${user.name}`);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { name } = req.body;
    if (req.files) {
      const { avatar } = req.files;
    }

    if (name) user.name = name;

    if (avatar) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: 'todo-app',
      });

      fs.rmSync('./tmp', {
        recursive: true,
      });

      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    await user.save();

    sendToken(res, user, 200, `Profile updated successfully`);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Please enter all fields' });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid old password',
      });
    }

    user.password = newPassword;

    await user.save();

    sendToken(res, user, 200, `Password updated successfully`);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email',
      });
    }

    const otp = Math.floor(Math.random() * 1000000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 30 * 60 * 1000;

    const message = `Your OTP to reset your password is ${otp}. This OTP is valid for 30 minutes. If you did not request this, please ignore this email.`;

    await user.save();

    await sendMail(email, 'Reset Password', message);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Please enter all fields' });
    }

    const user = await User.findOne({
      resetPasswordOtp: otp,
      resetPasswordOtpExpiry: {
        $gt: Date.now(),
      },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'OTP is invalid or expired',
      });
    }

    user.password = newPassword;

    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password Changed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
