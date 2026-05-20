"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listComments = exports.addComment = exports.toggleReaction = exports.deletePost = exports.createPost = exports.leaveCommunity = exports.joinCommunity = exports.getCommunity = exports.listCommunities = exports.deleteCommunity = exports.updateCommunity = exports.createCommunity = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const community_model_1 = __importDefault(require("./community.model"));
const post_model_1 = __importDefault(require("./post.model"));
const reaction_model_1 = __importDefault(require("./reaction.model"));
const comment_model_1 = __importDefault(require("./comment.model"));
const membership_model_1 = __importDefault(require("./membership.model"));
const cloudinary_config_1 = require("./cloudinary.config");
const toCommunityUploadUrl = (req, fileName) => {
    if (!fileName)
        return "";
    return `${req.protocol}://${req.get("host")}/uploads/community/${fileName}`;
};
const normalizeActiveFlag = (value) => {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string") {
        return value === "true" || value === "1";
    }
    return undefined;
};
const resolveViewerId = (req) => {
    if (req.user?.id)
        return String(req.user.id);
    const accessToken = req.cookies?.accessToken;
    if (!accessToken)
        return null;
    try {
        const payload = jsonwebtoken_1.default.verify(accessToken, process.env.AUTH_SECRET);
        return payload?.id ? String(payload.id) : null;
    }
    catch (_error) {
        return null;
    }
};
const buildMembersPreview = async (communityId) => {
    const memberships = await membership_model_1.default.find({ community: communityId })
        .populate("user", "fullname email profileImage")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    return memberships
        .map((membership) => membership.user)
        .filter(Boolean)
        .map((member) => ({
        _id: member._id,
        fullname: member.fullname,
        email: member.email,
        profileImage: member.profileImage,
    }));
};
const ensureMembership = async (communityId, userId) => {
    const membership = await membership_model_1.default.findOne({
        community: communityId,
        user: userId,
    }).lean();
    return Boolean(membership);
};
const buildCommunityStats = async (communityId) => {
    const posts = await post_model_1.default.find({ community: communityId })
        .select("_id createdAt")
        .sort({ createdAt: -1 })
        .lean();
    const postIds = posts.map((post) => post._id);
    const [commentsCount, reactionsCount, membersCount] = await Promise.all([
        postIds.length ? comment_model_1.default.countDocuments({ post: { $in: postIds } }) : 0,
        postIds.length ? reaction_model_1.default.countDocuments({ post: { $in: postIds } }) : 0,
        membership_model_1.default.countDocuments({ community: communityId }),
    ]);
    return {
        postsCount: posts.length,
        commentsCount,
        reactionsCount,
        membersCount,
        latestPostAt: posts[0]?.createdAt || null,
    };
};
const enrichCommunity = async (communityDoc, viewerId) => {
    const communityId = String(communityDoc._id);
    const [stats, membersPreview, joined] = await Promise.all([
        buildCommunityStats(communityId),
        buildMembersPreview(communityId),
        viewerId ? ensureMembership(communityId, viewerId) : Promise.resolve(false),
    ]);
    return {
        ...communityDoc.toObject(),
        stats,
        membership: {
            joined,
            membersPreview,
        },
    };
};
const enrichPost = async (postDoc) => {
    const [commentsCount, reactionsCount] = await Promise.all([
        comment_model_1.default.countDocuments({ post: postDoc._id }),
        reaction_model_1.default.countDocuments({ post: postDoc._id }),
    ]);
    return {
        ...postDoc.toObject(),
        stats: {
            commentsCount,
            reactionsCount,
        },
    };
};
const buildCommentTree = (comments) => {
    const commentMap = new Map();
    comments.forEach((comment) => {
        commentMap.set(String(comment._id), {
            ...comment.toObject(),
            replies: [],
        });
    });
    const roots = [];
    commentMap.forEach((comment) => {
        if (comment.parentComment) {
            const parent = commentMap.get(String(comment.parentComment));
            if (parent) {
                parent.replies.push(comment);
                return;
            }
        }
        roots.push(comment);
    });
    return roots;
};
// ---------- Community ----------
exports.createCommunity = [
    cloudinary_config_1.upload.single("coverImage"),
    async (req, res) => {
        try {
            const { name, description } = req.body;
            if (!name?.trim()) {
                return res.status(400).json({ message: "Community name is required" });
            }
            const community = await community_model_1.default.create({
                name: name.trim(),
                description: description?.trim() || "",
                creatorId: req.user.id,
                coverImageUrl: toCommunityUploadUrl(req, req.file?.filename),
                active: normalizeActiveFlag(req.body.active) ?? true,
            });
            await membership_model_1.default.create({
                community: community._id,
                user: req.user.id,
            });
            const populatedCommunity = await community_model_1.default.findById(community._id)
                .populate("creatorId", "fullname email profileImage")
                .lean();
            return res.status(201).json({
                message: "Community created successfully",
                community: await enrichCommunity({ toObject: () => populatedCommunity, _id: populatedCommunity?._id }, req.user.id),
            });
        }
        catch (err) {
            console.error("createCommunity error:", err);
            return res.status(500).json({ message: "Failed to create community" });
        }
    },
];
exports.updateCommunity = [
    cloudinary_config_1.upload.single("coverImage"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const updates = {};
            if (typeof req.body.name === "string" && req.body.name.trim()) {
                updates.name = req.body.name.trim();
            }
            if (typeof req.body.description === "string") {
                updates.description = req.body.description.trim();
            }
            const active = normalizeActiveFlag(req.body.active);
            if (active !== undefined) {
                updates.active = active;
            }
            if (req.file?.filename) {
                updates.coverImageUrl = toCommunityUploadUrl(req, req.file.filename);
            }
            const community = await community_model_1.default.findByIdAndUpdate(id, updates, { new: true })
                .populate("creatorId", "fullname email profileImage");
            if (!community) {
                return res.status(404).json({ message: "Community not found" });
            }
            return res.json({
                message: "Community updated successfully",
                community: await enrichCommunity(community),
            });
        }
        catch (err) {
            console.error("updateCommunity error:", err);
            return res.status(500).json({ message: "Failed to update community" });
        }
    },
];
const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await post_model_1.default.find({ community: id }).select("_id");
        const postIds = posts.map((post) => post._id);
        await Promise.all([
            community_model_1.default.findByIdAndDelete(id),
            post_model_1.default.deleteMany({ community: id }),
            membership_model_1.default.deleteMany({ community: id }),
            postIds.length ? reaction_model_1.default.deleteMany({ post: { $in: postIds } }) : Promise.resolve(),
            postIds.length ? comment_model_1.default.deleteMany({ post: { $in: postIds } }) : Promise.resolve(),
        ]);
        return res.json({ message: "Community deleted successfully" });
    }
    catch (err) {
        console.error("deleteCommunity error:", err);
        return res.status(500).json({ message: "Failed to delete community" });
    }
};
exports.deleteCommunity = deleteCommunity;
const listCommunities = async (_req, res) => {
    try {
        const viewerId = resolveViewerId(_req);
        const communities = await community_model_1.default.find()
            .populate("creatorId", "fullname email profileImage")
            .sort({ createdAt: -1 });
        const enrichedCommunities = await Promise.all(communities.map((community) => enrichCommunity(community, viewerId)));
        const summary = enrichedCommunities.reduce((acc, community) => {
            acc.totalCommunities += 1;
            if (community.active)
                acc.activeCommunities += 1;
            acc.totalPosts += community.stats.postsCount;
            acc.totalComments += community.stats.commentsCount;
            acc.totalReactions += community.stats.reactionsCount;
            return acc;
        }, {
            totalCommunities: 0,
            activeCommunities: 0,
            totalPosts: 0,
            totalComments: 0,
            totalReactions: 0,
        });
        return res.json({ communities: enrichedCommunities, summary });
    }
    catch (err) {
        console.error("listCommunities error:", err);
        return res.status(500).json({ message: "Failed to fetch communities" });
    }
};
exports.listCommunities = listCommunities;
const getCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const viewerId = resolveViewerId(req);
        const community = await community_model_1.default.findById(id).populate("creatorId", "fullname email profileImage");
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }
        const posts = await post_model_1.default.find({ community: id })
            .populate("author", "fullname email profileImage")
            .sort({ createdAt: -1 });
        const enrichedPosts = await Promise.all(posts.map(enrichPost));
        return res.json({
            community: await enrichCommunity(community, viewerId),
            posts: enrichedPosts,
        });
    }
    catch (err) {
        console.error("getCommunity error:", err);
        return res.status(500).json({ message: "Failed to fetch community details" });
    }
};
exports.getCommunity = getCommunity;
const joinCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await community_model_1.default.findById(id);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }
        await membership_model_1.default.findOneAndUpdate({ community: id, user: req.user.id }, { community: id, user: req.user.id }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return res.json({
            message: "Joined community successfully",
            community: await enrichCommunity(community, req.user.id),
        });
    }
    catch (err) {
        console.error("joinCommunity error:", err);
        return res.status(500).json({ message: "Failed to join community" });
    }
};
exports.joinCommunity = joinCommunity;
const leaveCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const community = await community_model_1.default.findById(id);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }
        await membership_model_1.default.findOneAndDelete({
            community: id,
            user: req.user.id,
        });
        return res.json({
            message: "Left community successfully",
            community: await enrichCommunity(community, req.user.id),
        });
    }
    catch (err) {
        console.error("leaveCommunity error:", err);
        return res.status(500).json({ message: "Failed to leave community" });
    }
};
exports.leaveCommunity = leaveCommunity;
// ---------- Post ----------
exports.createPost = [
    cloudinary_config_1.upload.single("media"),
    async (req, res) => {
        try {
            const communityId = req.params.id;
            const { content } = req.body;
            const community = await community_model_1.default.findById(communityId);
            if (!community) {
                return res.status(404).json({ message: "Community not found" });
            }
            const joined = await ensureMembership(communityId, req.user.id);
            if (!joined) {
                return res.status(403).json({ message: "Join the community before posting" });
            }
            if (!content?.trim() && !req.file?.path) {
                return res.status(400).json({ message: "Post content or media is required" });
            }
            const post = await post_model_1.default.create({
                community: communityId,
                author: req.user.id,
                content: content?.trim() || "",
                mediaUrl: toCommunityUploadUrl(req, req.file?.filename),
                mediaType: req.file?.mimetype?.startsWith("video")
                    ? "video"
                    : req.file?.mimetype?.startsWith("image")
                        ? "image"
                        : "",
            });
            const populatedPost = await post_model_1.default.findById(post._id).populate("author", "fullname email profileImage");
            return res.status(201).json({
                message: "Post created successfully",
                post: await enrichPost(populatedPost),
            });
        }
        catch (err) {
            console.error("createPost error:", err);
            return res.status(500).json({ message: "Failed to create post" });
        }
    },
];
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (String(post.author) !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        await Promise.all([
            post_model_1.default.findByIdAndDelete(postId),
            reaction_model_1.default.deleteMany({ post: postId }),
            comment_model_1.default.deleteMany({ post: postId }),
        ]);
        return res.json({ message: "Post deleted successfully" });
    }
    catch (err) {
        console.error("deletePost error:", err);
        return res.status(500).json({ message: "Failed to delete post" });
    }
};
exports.deletePost = deletePost;
// ---------- Reaction ----------
const toggleReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { type } = req.body;
        if (!["like", "dislike"].includes(type)) {
            return res.status(400).json({ message: "Reaction type must be like or dislike" });
        }
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const joined = await ensureMembership(String(post.community), req.user.id);
        if (!joined) {
            return res.status(403).json({ message: "Join the community before reacting" });
        }
        const existing = await reaction_model_1.default.findOne({ post: postId, user: req.user.id });
        if (existing) {
            if (existing.type === type) {
                await existing.deleteOne();
            }
            else {
                existing.type = type;
                await existing.save();
            }
        }
        else {
            await reaction_model_1.default.create({ post: postId, user: req.user.id, type });
        }
        const [likes, dislikes] = await Promise.all([
            reaction_model_1.default.countDocuments({ post: postId, type: "like" }),
            reaction_model_1.default.countDocuments({ post: postId, type: "dislike" }),
        ]);
        await post_model_1.default.findByIdAndUpdate(postId, { likesCount: likes, dislikesCount: dislikes });
        return res.json({ likes, dislikes });
    }
    catch (err) {
        console.error("toggleReaction error:", err);
        return res.status(500).json({ message: "Failed to react to post" });
    }
};
exports.toggleReaction = toggleReaction;
// ---------- Comment ----------
const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentCommentId } = req.body;
        if (!content?.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const joined = await ensureMembership(String(post.community), req.user.id);
        if (!joined) {
            return res.status(403).json({ message: "Join the community before commenting" });
        }
        let parentComment = null;
        if (parentCommentId) {
            parentComment = await comment_model_1.default.findOne({
                _id: parentCommentId,
                post: postId,
            });
            if (!parentComment) {
                return res.status(400).json({ message: "Reply target is invalid for this post" });
            }
        }
        const comment = await comment_model_1.default.create({
            post: postId,
            author: req.user.id,
            parentComment: parentComment?._id || null,
            content: content.trim(),
        });
        const populatedComment = await comment_model_1.default.findById(comment._id).populate("author", "fullname email profileImage");
        return res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment,
        });
    }
    catch (err) {
        console.error("addComment error:", err);
        return res.status(500).json({ message: "Failed to add comment" });
    }
};
exports.addComment = addComment;
const listComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await comment_model_1.default.find({ post: postId })
            .populate("author", "fullname email profileImage")
            .sort({ createdAt: 1 });
        return res.json({ comments: buildCommentTree(comments) });
    }
    catch (err) {
        console.error("listComments error:", err);
        return res.status(500).json({ message: "Failed to fetch comments" });
    }
};
exports.listComments = listComments;
