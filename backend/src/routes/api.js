const express = require('express');
const multer = require('multer');
const { getCategories } = require('../controllers/categories');
const { getPosts, getPostBySlug, createPost } = require('../controllers/posts');
const { getComments, createComment } = require('../controllers/comments');
const { uploadMedia } = require('../controllers/upload');
const {
  getUserProfile,
  updateUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
} = require('../controllers/users');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Categories
router.get('/categories', getCategories);

// Posts
router.get('/posts', getPosts);
router.get('/posts/:slug', getPostBySlug);
router.post('/posts', createPost);

// Comments
router.get('/comments', getComments);
router.post('/comments', createComment);

// User Profile & Follows
router.get('/users/profile', getUserProfile);
router.put('/users/profile', updateUserProfile);
router.post('/users/follow', toggleFollow);
router.get('/users/followers', getFollowers);
router.get('/users/following', getFollowing);

// Cloudinary Media Upload
router.post('/upload', upload.single('file'), uploadMedia);

module.exports = router;
