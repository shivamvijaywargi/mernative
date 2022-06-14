import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  verify,
  addTask,
  removeTask,
  updateTask,
  getMyProfile,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);

router.route('/verify').post(isAuthenticated, verify);

router.route('/newtask').post(isAuthenticated, addTask);
router.route('/me').get(isAuthenticated, getMyProfile);

router
  .route('/task/:taskId')
  .put(isAuthenticated, updateTask)
  .delete(isAuthenticated, removeTask);

router.route('/updateProfile').put(isAuthenticated, updateProfile);
router.route('/updatePassword').put(isAuthenticated, updatePassword);

router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword').put(resetPassword);

export default router;
