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

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);

// Tags
router.get('/tags', getTags);
router.get('/tags/trending', getTrendingHashtags);

// Posts
router.get('/posts', getPosts);
router.get('/posts/:slug', getPostBySlug);
router.post('/posts', createPost);
router.put('/posts/:slug', updatePost);
router.delete('/posts/:slug', deletePost);
router.post('/posts/:slug/vote', votePost);
router.post('/posts/:slug/bookmark', toggleBookmark);

// Comments
router.get('/comments', getComments);
router.post('/comments', createComment);

// Notifications
router.get('/notifications', getNotifications);
router.post('/notifications/read', markNotificationsRead);
router.post('/notifications/clear', clearNotifications);

// User Profile, Bookmarks & Follows
router.get('/users/search', searchUsers);
router.get('/users/profile', getUserProfile);
router.put('/users/profile', updateUserProfile);
router.post('/users/follow', toggleFollow);
router.get('/users/followers', getFollowers);
router.get('/users/following', getFollowing);
router.get('/users/suggested', getSuggestedUsers);
router.get('/users/me/bookmarks', getUserBookmarks);
router.post('/users/dismiss-welcome', dismissWelcome);

// Cloudinary Media Upload
router.post('/upload', upload.single('file'), uploadMedia);

module.exports = router;
