// @ts-nocheck
import { Router } from 'express';
import {
  createCommunity,
  updateCommunity,
  deleteCommunity,
  listCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  createPost,
  deletePost,
  toggleReaction,
  addComment,
  listComments,
} from './community.controller';
import { AdminGuard, UserGuard } from '../middleware/gaurd.middleware';

const router = Router();

// Community CRUD (admin only)
router.post('/', AdminGuard, createCommunity);
router.put('/:id', AdminGuard, updateCommunity);
router.delete('/:id', AdminGuard, deleteCommunity);
router.get('/', listCommunities);
router.get('/:id', getCommunity);
router.post('/:id/join', UserGuard, joinCommunity);
router.delete('/:id/join', UserGuard, leaveCommunity);

// Posts within a community (authenticated users)
router.post('/:id/posts', UserGuard, createPost); // :id = communityId
router.delete('/posts/:postId', UserGuard, deletePost);

// Reactions (like/dislike)
router.post('/posts/:postId/reaction', UserGuard, toggleReaction);

// Comments
router.post('/posts/:postId/comments', UserGuard, addComment);
router.get('/posts/:postId/comments', listComments);

export default router;
