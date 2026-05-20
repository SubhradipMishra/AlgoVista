import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import CommunityModel from "./community.model";
import PostModel from "./post.model";
import ReactionModel from "./reaction.model";
import CommentModel from "./comment.model";
import CommunityMembershipModel from "./membership.model";
import { upload } from "./cloudinary.config";

const toCommunityUploadUrl = (req: Request, fileName?: string) => {
  if (!fileName) return "";
  return `${req.protocol}://${req.get("host")}/uploads/community/${fileName}`;
};

const normalizeActiveFlag = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value === "true" || value === "1";
  }
  return undefined;
};

const resolveViewerId = (req: any) => {
  if (req.user?.id) return String(req.user.id);

  const accessToken = req.cookies?.accessToken;
  if (!accessToken) return null;

  try {
    const payload = jwt.verify(accessToken, process.env.AUTH_SECRET as string) as {
      id?: string;
    };
    return payload?.id ? String(payload.id) : null;
  } catch (_error) {
    return null;
  }
};

const buildMembersPreview = async (communityId: string) => {
  const memberships = await CommunityMembershipModel.find({ community: communityId })
    .populate("user", "fullname email profileImage")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return memberships
    .map((membership: any) => membership.user)
    .filter(Boolean)
    .map((member: any) => ({
      _id: member._id,
      fullname: member.fullname,
      email: member.email,
      profileImage: member.profileImage,
    }));
};

const ensureMembership = async (communityId: string, userId: string) => {
  const membership = await CommunityMembershipModel.findOne({
    community: communityId,
    user: userId,
  }).lean();

  return Boolean(membership);
};

const buildCommunityStats = async (communityId: string) => {
  const posts = await PostModel.find({ community: communityId })
    .select("_id createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const postIds = posts.map((post) => post._id);
  const [commentsCount, reactionsCount, membersCount] = await Promise.all([
    postIds.length ? CommentModel.countDocuments({ post: { $in: postIds } }) : 0,
    postIds.length ? ReactionModel.countDocuments({ post: { $in: postIds } }) : 0,
    CommunityMembershipModel.countDocuments({ community: communityId }),
  ]);

  return {
    postsCount: posts.length,
    commentsCount,
    reactionsCount,
    membersCount,
    latestPostAt: posts[0]?.createdAt || null,
  };
};

const enrichCommunity = async (communityDoc: any, viewerId?: string | null) => {
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

const enrichPost = async (postDoc: any) => {
  const [commentsCount, reactionsCount] = await Promise.all([
    CommentModel.countDocuments({ post: postDoc._id }),
    ReactionModel.countDocuments({ post: postDoc._id }),
  ]);

  return {
    ...postDoc.toObject(),
    stats: {
      commentsCount,
      reactionsCount,
    },
  };
};

const buildCommentTree = (comments: any[]) => {
  const commentMap = new Map<string, any>();

  comments.forEach((comment) => {
    commentMap.set(String(comment._id), {
      ...comment.toObject(),
      replies: [],
    });
  });

  const roots: any[] = [];

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
export const createCommunity = [
  upload.single("coverImage"),
  async (req: any, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ message: "Community name is required" });
      }

      const community = await CommunityModel.create({
        name: name.trim(),
        description: description?.trim() || "",
        creatorId: req.user.id,
        coverImageUrl: toCommunityUploadUrl(req, req.file?.filename),
        active: normalizeActiveFlag(req.body.active) ?? true,
      });

      await CommunityMembershipModel.create({
        community: community._id,
        user: req.user.id,
      });

      const populatedCommunity = await CommunityModel.findById(community._id)
        .populate("creatorId", "fullname email profileImage")
        .lean();

      return res.status(201).json({
        message: "Community created successfully",
        community: await enrichCommunity(
          { toObject: () => populatedCommunity, _id: populatedCommunity?._id },
          req.user.id
        ),
      });
    } catch (err) {
      console.error("createCommunity error:", err);
      return res.status(500).json({ message: "Failed to create community" });
    }
  },
];

export const updateCommunity = [
  upload.single("coverImage"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates: Record<string, unknown> = {};

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

      if ((req as any).file?.filename) {
        updates.coverImageUrl = toCommunityUploadUrl(req, (req as any).file.filename);
      }

      const community = await CommunityModel.findByIdAndUpdate(id, updates, { new: true })
        .populate("creatorId", "fullname email profileImage");

      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      return res.json({
        message: "Community updated successfully",
        community: await enrichCommunity(community),
      });
    } catch (err) {
      console.error("updateCommunity error:", err);
      return res.status(500).json({ message: "Failed to update community" });
    }
  },
];

export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const posts = await PostModel.find({ community: id }).select("_id");
    const postIds = posts.map((post) => post._id);

    await Promise.all([
      CommunityModel.findByIdAndDelete(id),
      PostModel.deleteMany({ community: id }),
      CommunityMembershipModel.deleteMany({ community: id }),
      postIds.length ? ReactionModel.deleteMany({ post: { $in: postIds } }) : Promise.resolve(),
      postIds.length ? CommentModel.deleteMany({ post: { $in: postIds } }) : Promise.resolve(),
    ]);

    return res.json({ message: "Community deleted successfully" });
  } catch (err) {
    console.error("deleteCommunity error:", err);
    return res.status(500).json({ message: "Failed to delete community" });
  }
};

export const listCommunities = async (_req: Request, res: Response) => {
  try {
    const viewerId = resolveViewerId(_req);
    const communities = await CommunityModel.find()
      .populate("creatorId", "fullname email profileImage")
      .sort({ createdAt: -1 });

    const enrichedCommunities = await Promise.all(
      communities.map((community) => enrichCommunity(community, viewerId))
    );

    const summary = enrichedCommunities.reduce(
      (acc, community) => {
        acc.totalCommunities += 1;
        if (community.active) acc.activeCommunities += 1;
        acc.totalPosts += community.stats.postsCount;
        acc.totalComments += community.stats.commentsCount;
        acc.totalReactions += community.stats.reactionsCount;
        return acc;
      },
      {
        totalCommunities: 0,
        activeCommunities: 0,
        totalPosts: 0,
        totalComments: 0,
        totalReactions: 0,
      }
    );

    return res.json({ communities: enrichedCommunities, summary });
  } catch (err) {
    console.error("listCommunities error:", err);
    return res.status(500).json({ message: "Failed to fetch communities" });
  }
};

export const getCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const viewerId = resolveViewerId(req);

    const community = await CommunityModel.findById(id).populate(
      "creatorId",
      "fullname email profileImage"
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const posts = await PostModel.find({ community: id })
      .populate("author", "fullname email profileImage")
      .sort({ createdAt: -1 });

    const enrichedPosts = await Promise.all(posts.map(enrichPost));

    return res.json({
      community: await enrichCommunity(community, viewerId),
      posts: enrichedPosts,
    });
  } catch (err) {
    console.error("getCommunity error:", err);
    return res.status(500).json({ message: "Failed to fetch community details" });
  }
};

export const joinCommunity = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const community = await CommunityModel.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    await CommunityMembershipModel.findOneAndUpdate(
      { community: id, user: req.user.id },
      { community: id, user: req.user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: "Joined community successfully",
      community: await enrichCommunity(community, req.user.id),
    });
  } catch (err) {
    console.error("joinCommunity error:", err);
    return res.status(500).json({ message: "Failed to join community" });
  }
};

export const leaveCommunity = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const community = await CommunityModel.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    await CommunityMembershipModel.findOneAndDelete({
      community: id,
      user: req.user.id,
    });

    return res.json({
      message: "Left community successfully",
      community: await enrichCommunity(community, req.user.id),
    });
  } catch (err) {
    console.error("leaveCommunity error:", err);
    return res.status(500).json({ message: "Failed to leave community" });
  }
};

// ---------- Post ----------
export const createPost = [
  upload.single("media"),
  async (req: any, res: Response) => {
    try {
      const communityId = req.params.id;
      const { content } = req.body;

      const community = await CommunityModel.findById(communityId);
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

      const post = await PostModel.create({
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

      const populatedPost = await PostModel.findById(post._id).populate(
        "author",
        "fullname email profileImage"
      );

      return res.status(201).json({
        message: "Post created successfully",
        post: await enrichPost(populatedPost),
      });
    } catch (err) {
      console.error("createPost error:", err);
      return res.status(500).json({ message: "Failed to create post" });
    }
  },
];

export const deletePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.author) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Promise.all([
      PostModel.findByIdAndDelete(postId),
      ReactionModel.deleteMany({ post: postId }),
      CommentModel.deleteMany({ post: postId }),
    ]);

    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("deletePost error:", err);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

// ---------- Reaction ----------
export const toggleReaction = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({ message: "Reaction type must be like or dislike" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const joined = await ensureMembership(String(post.community), req.user.id);
    if (!joined) {
      return res.status(403).json({ message: "Join the community before reacting" });
    }

    const existing = await ReactionModel.findOne({ post: postId, user: req.user.id });

    if (existing) {
      if (existing.type === type) {
        await existing.deleteOne();
      } else {
        existing.type = type;
        await existing.save();
      }
    } else {
      await ReactionModel.create({ post: postId, user: req.user.id, type });
    }

    const [likes, dislikes] = await Promise.all([
      ReactionModel.countDocuments({ post: postId, type: "like" }),
      ReactionModel.countDocuments({ post: postId, type: "dislike" }),
    ]);

    await PostModel.findByIdAndUpdate(postId, { likesCount: likes, dislikesCount: dislikes });

    return res.json({ likes, dislikes });
  } catch (err) {
    console.error("toggleReaction error:", err);
    return res.status(500).json({ message: "Failed to react to post" });
  }
};

// ---------- Comment ----------
export const addComment = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const joined = await ensureMembership(String(post.community), req.user.id);
    if (!joined) {
      return res.status(403).json({ message: "Join the community before commenting" });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await CommentModel.findOne({
        _id: parentCommentId,
        post: postId,
      });

      if (!parentComment) {
        return res.status(400).json({ message: "Reply target is invalid for this post" });
      }
    }

    const comment = await CommentModel.create({
      post: postId,
      author: req.user.id,
      parentComment: parentComment?._id || null,
      content: content.trim(),
    });

    const populatedComment = await CommentModel.findById(comment._id).populate(
      "author",
      "fullname email profileImage"
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (err) {
    console.error("addComment error:", err);
    return res.status(500).json({ message: "Failed to add comment" });
  }
};

export const listComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const comments = await CommentModel.find({ post: postId })
      .populate("author", "fullname email profileImage")
      .sort({ createdAt: 1 });

    return res.json({ comments: buildCommentTree(comments) });
  } catch (err) {
    console.error("listComments error:", err);
    return res.status(500).json({ message: "Failed to fetch comments" });
  }
};
