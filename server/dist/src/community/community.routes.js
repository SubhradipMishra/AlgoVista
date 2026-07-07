"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const community_controller_1 = require("./community.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const router = (0, express_1.Router)();
// Community CRUD (admin only)
router.post('/', gaurd_middleware_1.AdminGuard, community_controller_1.createCommunity);
router.put('/:id', gaurd_middleware_1.AdminGuard, community_controller_1.updateCommunity);
router.delete('/:id', gaurd_middleware_1.AdminGuard, community_controller_1.deleteCommunity);
router.get('/', community_controller_1.listCommunities);
router.get('/:id', community_controller_1.getCommunity);
router.post('/:id/join', gaurd_middleware_1.UserGuard, community_controller_1.joinCommunity);
router.delete('/:id/join', gaurd_middleware_1.UserGuard, community_controller_1.leaveCommunity);
// Posts within a community (authenticated users)
router.post('/:id/posts', gaurd_middleware_1.UserGuard, community_controller_1.createPost); // :id = communityId
router.delete('/posts/:postId', gaurd_middleware_1.UserGuard, community_controller_1.deletePost);
// Reactions (like/dislike)
router.post('/posts/:postId/reaction', gaurd_middleware_1.UserGuard, community_controller_1.toggleReaction);
// Comments
router.post('/posts/:postId/comments', gaurd_middleware_1.UserGuard, community_controller_1.addComment);
router.get('/posts/:postId/comments', community_controller_1.listComments);
exports.default = router;
