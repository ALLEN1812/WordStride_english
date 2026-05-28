const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers, toggleLock, getAchievements } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { avatarUpload } = require('../config/cloudinary');

router.get('/profile',              verifyToken,  getProfile);
router.put('/profile',              verifyToken,  avatarUpload.single('avatar'), updateProfile);
router.get('/achievements',         verifyToken,  getAchievements);

// Admin
router.get('/admin/users',          verifyAdmin,  getAllUsers);
router.put('/admin/users/:id/toggle-lock', verifyAdmin, toggleLock);

module.exports = router;
