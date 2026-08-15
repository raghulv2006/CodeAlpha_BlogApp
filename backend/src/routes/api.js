const express = require('express');
const multer = require('multer');
const { getCategories, createCategory } = require('../controllers/categories');
const { getPosts, getPostBySlug, createPost, updatePost, votePost } = require('../controllers/posts');
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
} = require('../controllers/users');

const {
  toggleBookmark,
  getUserBookmarks,
  getTrendingHashtags,
  getSuggestedUsers,
} = require('../controllers/bookmarks');

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
router.post('/posts/:slug/vote', votePost);
router.post('/posts/:slug/bookmark', toggleBookmark);

// Comments
router.get('/comments', getComments);
router.post('/comments', createComment);

// User Profile, Bookmarks & Follows
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
