const express = require('express');
const multer = require('multer');
const { getCategories, createCategory } = require('../controllers/categories');
const { getPosts, getPostBySlug, createPost, updatePost, votePost, deletePost } = require('../controllers/posts');
const { getComments, createComment } = require('../controllers/comments');
const { uploadMedia } = require('../controllers/upload');
const { getTags } = require('../controllers/tags');
const {
  getUserProfile,
  updateUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  dismissWelcome,
  searchUsers,
} = require('../controllers/users');

const {
  toggleBookmark,
  getUserBookmarks,
  getTrendingHashtags,
  getSuggestedUsers,
} = require('../controllers/bookmarks');

const {
  getNotifications,
  markNotificationsRead,
  clearNotifications,
} = require('../controllers/notifications');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { authMiddleware } = require('../middleware/auth');

// Categories
router.get('/categories', getCategories);
router.post('/categories', authMiddleware, createCategory);

// Tags
router.get('/tags', getTags);
router.get('/tags/trending', getTrendingHashtags);

// Posts
router.get('/posts', getPosts);
router.get('/posts/:slug', getPostBySlug);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:slug', authMiddleware, updatePost);
router.delete('/posts/:slug', authMiddleware, deletePost);
router.post('/posts/:slug/vote', authMiddleware, votePost);
router.post('/posts/:slug/bookmark', authMiddleware, toggleBookmark);

// Comments
router.get('/comments', getComments);
router.post('/comments', authMiddleware, createComment);

// Notifications
router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/read', authMiddleware, markNotificationsRead);
router.post('/notifications/clear', authMiddleware, clearNotifications);

// User Profile, Bookmarks & Follows
router.get('/users/search', searchUsers);
router.get('/users/profile', getUserProfile);
router.put('/users/profile', authMiddleware, updateUserProfile);
router.post('/users/follow', authMiddleware, toggleFollow);
router.get('/users/followers', getFollowers);
router.get('/users/following', getFollowing);
router.get('/users/suggested', getSuggestedUsers);
router.get('/users/me/bookmarks', authMiddleware, getUserBookmarks);
router.post('/users/dismiss-welcome', authMiddleware, dismissWelcome);

// Cloudinary Media Upload (auth required to prevent anonymous abuse)
router.post('/upload', authMiddleware, upload.single('file'), uploadMedia);

module.exports = router;
