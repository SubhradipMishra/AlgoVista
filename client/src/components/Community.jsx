import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  DislikeOutlined,
  EditOutlined,
  LikeOutlined,
  LoginOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined,
  SendOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Empty, Input, Skeleton, Tag, Upload, message } from "antd";
import { motion } from "framer-motion";
import Context from "../util/context";

const API_BASE_URL = "http://localhost:4000";

const formatDateTime = (value) => new Date(value).toLocaleString();

const Community = () => {
  const navigate = useNavigate();
  const { id: routeCommunityId } = useParams();
  const { session } = useContext(Context);
  const [communities, setCommunities] = useState([]);
  const [summary, setSummary] = useState({
    totalCommunities: 0,
    activeCommunities: 0,
    totalPosts: 0,
    totalComments: 0,
    totalReactions: 0,
  });
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postMedia, setPostMedia] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyTargets, setReplyTargets] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  const canInteract =
    session &&
    (session.role === "user" || session.role === "admin" || session.role === "super-admin");
  const isDetailPage = Boolean(routeCommunityId);
  const isJoined = Boolean(selectedCommunity?.membership?.joined);
  const joinedMembers = selectedCommunity?.membership?.membersPreview || [];
  const featuredCommunities = communities.slice(0, 3);
  const totalMembers = useMemo(
    () =>
      communities.reduce(
        (count, community) => count + (Number(community.stats?.membersCount) || 0),
        0
      ),
    [communities]
  );
  const statTiles = useMemo(
    () => [
      { label: "Communities", value: summary.totalCommunities },
      { label: "Joined Members", value: totalMembers },
      { label: "Live Posts", value: summary.totalPosts },
      { label: "Replies", value: summary.totalComments },
    ],
    [summary, totalMembers]
  );

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (!routeCommunityId) {
      setSelectedCommunity(null);
      setPosts([]);
      setShowComposer(false);
      setCommentInputs({});
      setCommentDrafts({});
      return;
    }

    fetchCommunityDetails(routeCommunityId);
  }, [routeCommunityId]);

  const fetchCommunities = async () => {
    try {
      setLoadingCommunities(true);
      const { data } = await axios.get(`${API_BASE_URL}/community`, {
        withCredentials: true,
      });

      setCommunities(data.communities || []);
      setSummary(
        data.summary || {
          totalCommunities: 0,
          activeCommunities: 0,
          totalPosts: 0,
          totalComments: 0,
          totalReactions: 0,
        }
      );
    } catch (error) {
      console.error("Failed to fetch communities:", error);
      message.error("Failed to load communities");
    } finally {
      setLoadingCommunities(false);
    }
  };

  const fetchCommunityDetails = async (communityId) => {
    try {
      setLoadingDetails(true);
      const { data } = await axios.get(`${API_BASE_URL}/community/${communityId}`, {
        withCredentials: true,
      });
      setSelectedCommunity(data.community || null);
      setPosts(data.posts || []);
      setShowComposer(false);
      setCommentInputs({});
      setCommentDrafts({});
      setReplyDrafts({});
      setReplyTargets({});
    } catch (error) {
      console.error("Failed to fetch community details:", error);
      message.error("Failed to load community details");
      navigate("/community");
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchCommentsForPost = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      const { data } = await axios.get(`${API_BASE_URL}/community/posts/${postId}/comments`, {
        withCredentials: true,
      });
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: data.comments || [],
      }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      message.error("Failed to load comments");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const refreshSelectedCommunity = async () => {
    if (!routeCommunityId) return;
    await Promise.all([fetchCommunityDetails(routeCommunityId), fetchCommunities()]);
  };

  const openCommunity = (communityId) => {
    navigate(`/community/${communityId}`);
  };

  const ensureSignedIn = (reason) => {
    if (canInteract) return true;
    message.info(`Please log in to ${reason}`);
    navigate("/login");
    return false;
  };

  const ensureJoinedCommunity = (reason) => {
    if (!ensureSignedIn(reason)) return false;
    if (!isJoined) {
      message.info(`Join ${selectedCommunity?.name || "this community"} before you ${reason}`);
      return false;
    }
    if (!selectedCommunity?.active) {
      message.warning("This community is currently paused by the admin");
      return false;
    }
    return true;
  };

  const handleJoinCommunity = async () => {
    if (!selectedCommunity) return;
    if (!ensureSignedIn("join communities")) return;

    try {
      setJoiningCommunity(true);
      await axios.post(
        `${API_BASE_URL}/community/${selectedCommunity._id}/join`,
        {},
        { withCredentials: true }
      );
      message.success(`You joined ${selectedCommunity.name}`);
      await refreshSelectedCommunity();
    } catch (error) {
      console.error("Failed to join community:", error);
      message.error(error.response?.data?.message || "Failed to join community");
    } finally {
      setJoiningCommunity(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!selectedCommunity) return;
    if (!ensureSignedIn("manage membership")) return;

    try {
      setJoiningCommunity(true);
      await axios.delete(`${API_BASE_URL}/community/${selectedCommunity._id}/join`, {
        withCredentials: true,
      });
      message.success(`You left ${selectedCommunity.name}`);
      setPostContent("");
      setPostMedia(null);
      setShowComposer(false);
      await refreshSelectedCommunity();
    } catch (error) {
      console.error("Failed to leave community:", error);
      message.error(error.response?.data?.message || "Failed to leave community");
    } finally {
      setJoiningCommunity(false);
    }
  };

  const handleCreatePost = async () => {
    if (!ensureJoinedCommunity("post")) return;

    if (!postContent.trim() && !postMedia) {
      message.warning("Write something or attach media before posting");
      return;
    }

    try {
      setCreatingPost(true);
      const formData = new FormData();
      formData.append("content", postContent.trim());
      if (postMedia) {
        formData.append("media", postMedia);
      }

      await axios.post(`${API_BASE_URL}/community/${routeCommunityId}/posts`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPostContent("");
      setPostMedia(null);
      setShowComposer(false);
      message.success("Post published successfully");
      await refreshSelectedCommunity();
    } catch (error) {
      console.error("Failed to create post:", error);
      message.error(error.response?.data?.message || "Failed to publish post");
    } finally {
      setCreatingPost(false);
    }
  };

  const handleReaction = async (postId, type) => {
    if (!ensureJoinedCommunity("react")) return;

    try {
      await axios.post(
        `${API_BASE_URL}/community/posts/${postId}/reaction`,
        { type },
        { withCredentials: true }
      );
      await refreshSelectedCommunity();
    } catch (error) {
      console.error("Failed to react to post:", error);
      message.error(error.response?.data?.message || "Failed to update reaction");
    }
  };

  const handleToggleComments = async (postId) => {
    const isOpen = Boolean(commentInputs[postId]);
    if (isOpen) {
      setCommentInputs((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }

    await fetchCommentsForPost(postId);
  };

  const handleAddComment = async (postId) => {
    if (!ensureJoinedCommunity("reply")) return;

    const content = commentDrafts[postId]?.trim();
    if (!content) {
      message.warning("Comment cannot be empty");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/community/posts/${postId}/comments`,
        { content },
        { withCredentials: true }
      );

      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      await Promise.all([fetchCommentsForPost(postId), refreshSelectedCommunity()]);
    } catch (error) {
      console.error("Failed to add comment:", error);
      message.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const handleReplyTarget = (postId, commentId) => {
    setReplyTargets((prev) => ({
      ...prev,
      [postId]: prev[postId] === commentId ? null : commentId,
    }));
  };

  const handleAddReply = async (postId, commentId) => {
    if (!ensureJoinedCommunity("reply")) return;

    const content = replyDrafts[commentId]?.trim();
    if (!content) {
      message.warning("Reply cannot be empty");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/community/posts/${postId}/comments`,
        { content, parentCommentId: commentId },
        { withCredentials: true }
      );

      setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
      setReplyTargets((prev) => ({ ...prev, [postId]: null }));
      await Promise.all([fetchCommentsForPost(postId), refreshSelectedCommunity()]);
    } catch (error) {
      console.error("Failed to add reply:", error);
      message.error(error.response?.data?.message || "Failed to add reply");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${API_BASE_URL}/community/posts/${postId}`, {
        withCredentials: true,
      });
      message.success("Post removed");
      await refreshSelectedCommunity();
    } catch (error) {
      console.error("Failed to delete post:", error);
      message.error("Failed to delete post");
    }
  };

  const handleComposerToggle = () => {
    if (!ensureSignedIn("post")) return;
    if (!isJoined) {
      message.info(`Join ${selectedCommunity?.name || "this community"} before posting`);
      return;
    }
    if (!selectedCommunity?.active) {
      message.warning("This community is currently paused by the admin");
      return;
    }
    setShowComposer((prev) => !prev);
  };

  const renderCommentThread = (postId, comments, depth = 0) =>
    comments.map((comment) => {
      const isReplying = replyTargets[postId] === comment._id;
      const nestedReplies = comment.replies || [];

      return (
        <div
          key={comment._id}
          className={`${depth > 0 ? "ml-8 border-l border-white/10 pl-4" : ""}`}
        >
          <div className="rounded-3xl bg-white/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <Avatar
                src={comment.author?.profileImage}
                size={34}
                className="border border-white/10 bg-[#09090b]"
              >
                {comment.author?.fullname?.slice(0, 1) || "U"}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="rounded-3xl bg-white/10 px-4 py-3">
                  <p className="text-[11px] font-semibold text-white">
                    {comment.author?.fullname || "Community Member"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">{comment.content}</p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 pl-2 text-[10px] font-semibold text-gray-500">
                  <span>{formatDateTime(comment.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => handleReplyTarget(postId, comment._id)}
                    className="transition hover:text-[var(--primary)]"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isReplying ? (
            <div className="mt-3 ml-4 flex flex-col gap-3 sm:flex-row">
              <Input
                value={replyDrafts[comment._id] || ""}
                onChange={(event) =>
                  setReplyDrafts((prev) => ({
                    ...prev,
                    [comment._id]: event.target.value,
                  }))
                }
                placeholder={`Reply to ${comment.author?.fullname || "member"}...`}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleAddReply(postId, comment._id)}
                className="!rounded-xl !border-none !bg-[var(--primary)] !px-4 !font-semibold !text-black hover:!bg-[var(--primary-hover)]"
              >
                Send
              </Button>
            </div>
          ) : null}

          {nestedReplies.length ? (
            <div className="mt-3 space-y-3">{renderCommentThread(postId, nestedReplies, depth + 1)}</div>
          ) : null}
        </div>
      );
    });

  const renderHeader = () => (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fde047,#f59e0b)] text-lg font-bold text-black shadow-[0_0_30px_rgba(250,204,21,0.25)]"
          >
            A
          </Link>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--primary)]">
              AlgoVista Social Layer
            </p>
            <h1 className="text-lg font-bold text-white">
              Community
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={isDetailPage ? "/community" : "/"}
            className="hidden rounded-xl border border-white/10 px-4 py-2 text-[10px] font-bold text-gray-300 transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:inline-flex"
          >
            <ArrowLeftOutlined className="mr-2" />
            {isDetailPage ? "All Communities" : "Back Home"}
          </Link>

          {session ? (
            <Button
              onClick={() =>
                navigate(session.role === "admin" ? "/admin/dashboard" : "/dashboard")
              }
              className="!h-11 !rounded-xl !border-none !bg-[var(--primary)] !px-5 !font-bold !text-black hover:!bg-[var(--primary-hover)]"
            >
              Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              icon={<LoginOutlined />}
              className="!h-11 !rounded-xl !border-white/10 !bg-[#09090b] !px-5 !font-bold !text-[var(--primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary-hover)]"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );

  const renderCommunityCard = (community, featured = false) => (
    <motion.button
      key={community._id}
      type="button"
      whileHover={{ y: -4 }}
      onClick={() => openCommunity(community._id)}
      className={`w-full rounded-[28px] border p-5 text-left transition-all duration-300 ${
        featured
          ? "border-white/10 bg-white/5 backdrop-blur-xl"
          : "border-white/10 bg-white/5 backdrop-blur-lg hover:border-white/10"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          {community.coverImageUrl ? (
            <img
              src={community.coverImageUrl}
              alt={community.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[var(--primary)]">
              {community.name?.slice(0, 1)?.toUpperCase() || "C"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {community.name}
            </h3>
            <Tag
              color={community.active ? "gold" : "default"}
              className="!m-0 !rounded-full !px-3 !py-1 !font-sans !text-[9px] !font-semibold"
            >
              {community.active ? "Active" : "Paused"}
            </Tag>
            {community.membership?.joined ? (
              <Tag className="!m-0 !rounded-full !border-none !bg-[rgba(250,204,21,0.12)] !px-3 !py-1 !font-sans !text-[9px] !font-semibold !text-[var(--primary)]">
                Joined
              </Tag>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            {community.description || "No description available for this room yet."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              `Members ${community.stats?.membersCount || 0}`,
              `Posts ${community.stats?.postsCount || 0}`,
              `Comments ${community.stats?.commentsCount || 0}`,
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold text-gray-500"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar.Group>
                {(community.membership?.membersPreview || []).slice(0, 3).map((member) => (
                  <Avatar
                    key={member._id}
                    src={member.profileImage}
                    className="border border-white/10 bg-[#09090b]"
                  >
                    {member.fullname?.slice(0, 1) || "M"}
                  </Avatar>
                ))}
              </Avatar.Group>
              <span className="text-[10px] font-semibold text-gray-500">
                Open room page
              </span>
            </div>
            <ArrowRightOutlined className="text-[var(--primary)]" />
          </div>
        </div>
      </div>
    </motion.button>
  );

  const renderBrowsePage = () => (
    <>
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_24px_90px_rgba(0,0,0,0.38)] md:p-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-lg px-4 py-2 text-[10px] font-bold tracking-wide uppercase text-[var(--primary)]">
            <MessageOutlined />
            Room directory
          </span>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold text-white md:text-5xl">
            Explore communities, then open a dedicated room page for each one.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400 md:text-base">
            Every card now leads to its own `community/:id` page where members can join, post,
            react, and reply inside a focused feed.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {statTiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-4"
              >
                <p className="text-[9px] font-bold text-gray-500">
                  {tile.label}
                </p>
                <p className="mt-3 text-2xl font-bold text-white">{tile.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
        >
          <p className="text-[10px] font-bold tracking-wide uppercase text-[var(--primary)]">
            Access model
          </p>
          <h3 className="mt-4 text-2xl font-semibold text-white">
            Browse first. Join next. Contribute after that.
          </h3>
          <p className="mt-4 text-sm leading-7 text-gray-400">
            Guests can discover rooms. Logged-in users can join a room. Joined members unlock the
            full social feed for that specific community page.
          </p>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-lg p-5">
            <p className="text-[10px] font-bold text-gray-500">
              Session Status
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="border border-white/10 bg-[#09090b]">
                {session?.fullname?.slice(0, 1) || "G"}
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">
                  {session?.fullname || "Guest Visitor"}
                </p>
                <p className="text-[10px]  text-gray-500">
                  {session?.role || "Read-only visitor"}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Community Rooms
            </h3>
            <p className="mt-2 text-[10px]  text-gray-500">
              Click a card to open its full room page
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {loadingCommunities ? (
            [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-lg p-5"
              >
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ))
          ) : communities.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 backdrop-blur-lg p-12 lg:col-span-2">
              <Empty
                description={
                  <span className="text-xs  text-gray-500">
                    No communities available yet
                  </span>
                }
              />
            </div>
          ) : (
            communities.map((community, index) => renderCommunityCard(community, index < 2))
          )}
        </div>
      </section>

      {featuredCommunities.length ? (
        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {featuredCommunities.map((community) => (
            <div
              key={community._id}
              className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-5"
            >
              <p className="text-[10px] font-bold text-[var(--primary)]">
                Featured room
              </p>
              <h4 className="mt-3 text-lg font-semibold text-white">
                {community.name}
              </h4>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                {community.description || "A focused room for discussion and peer learning."}
              </p>
              <Button
                onClick={() => openCommunity(community._id)}
                className="!mt-5 !h-11 !rounded-xl !border-none !bg-[var(--primary)] !px-5 !font-semibold !text-black hover:!bg-[var(--primary-hover)]"
              >
                Open Community Page
              </Button>
            </div>
          ))}
        </section>
      ) : null}
    </>
  );

  const renderDetailPage = () => {
    return (
      <section>
          {loadingDetails ? (
            <div className="rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-lg p-6">
              <Skeleton active paragraph={{ rows: 16 }} />
            </div>
          ) : !selectedCommunity ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 backdrop-blur-lg p-12">
              <Empty
                description={
                  <span className="text-xs  text-gray-500">
                    Community not found
                  </span>
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-[34px] border border-white/10 bg-transparent shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
                <div className="relative h-72 bg-[linear-gradient(135deg,rgba(250,204,21,0.14),rgba(0,0,0,0.15))]">
                  {selectedCommunity.coverImageUrl ? (
                    <img
                      src={selectedCommunity.coverImageUrl}
                      alt={selectedCommunity.name}
                      className="h-full w-full object-cover opacity-75"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.2),rgba(3,3,3,0.95))]" />
                  <div className="absolute right-5 top-5 flex items-center gap-3">
                    {isJoined ? (
                      <Button
                        onClick={handleLeaveCommunity}
                        loading={joiningCommunity}
                        className="!h-10 !rounded-full !border-white/10 !bg-[#09090b]/65 !px-4 !font-semibold !text-gray-200 hover:!border-[var(--primary)] hover:!text-[var(--primary)]"
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        icon={<TeamOutlined />}
                        onClick={handleJoinCommunity}
                        loading={joiningCommunity}
                        className="!h-10 !rounded-full !border-none !bg-[var(--primary)] !px-4 !font-semibold !text-black hover:!bg-[var(--primary-hover)]"
                      >
                        Join
                      </Button>
                    )}
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={handleComposerToggle}
                      className="!h-11 !w-11 !border-none !bg-[var(--primary)] !text-black hover:!bg-[var(--primary-hover)]"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <h2 className="text-3xl font-semibold text-white md:text-5xl">
                            {selectedCommunity.name}
                          </h2>
                          <Tag
                            color={selectedCommunity.active ? "gold" : "default"}
                            className="!rounded-full !px-3 !py-1 !font-sans !text-[9px] !font-semibold"
                          >
                            {selectedCommunity.active ? "Live Room" : "Paused Room"}
                          </Tag>
                          {isJoined ? (
                            <Tag className="!rounded-full !border-none !bg-[rgba(250,204,21,0.16)] !px-3 !py-1 !font-sans !text-[9px] !font-semibold !text-[var(--primary)]">
                              Joined Member
                            </Tag>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg px-4 py-3">
                        <p className="text-[9px] font-bold text-gray-500">
                          All Posts
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {selectedCommunity.stats?.postsCount || 0} published
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-500">
                        Joined Member Preview
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {joinedMembers.length ? (
                          <>
                            <Avatar.Group>
                              {joinedMembers.map((member) => (
                                <Avatar
                                  key={member._id}
                                  src={member.profileImage}
                                  className="border border-white/10 bg-[#09090b]"
                                >
                                  {member.fullname?.slice(0, 1) || "M"}
                                </Avatar>
                              ))}
                            </Avatar.Group>
                            <span className="text-xs  text-gray-400">
                              {joinedMembers.map((member) => member.fullname).join(" • ")}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs  text-gray-500">
                            No joined members to preview yet
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {isJoined ? (
                        <Button
                          onClick={handleLeaveCommunity}
                          loading={joiningCommunity}
                          className="!h-11 !rounded-xl !border-white/10 !bg-[#09090b] !px-5 !font-bold !text-gray-200 hover:!border-[var(--primary)] hover:!text-[var(--primary)]"
                        >
                          Leave Room
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          icon={<TeamOutlined />}
                          onClick={handleJoinCommunity}
                          loading={joiningCommunity}
                          className="!h-11 !rounded-xl !border-none !bg-[var(--primary)] !px-5 !font-bold !text-black hover:!bg-[var(--primary-hover)]"
                        >
                          Join Community
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    {[
                      { label: "Members", value: selectedCommunity.stats?.membersCount || 0 },
                      { label: "Posts", value: selectedCommunity.stats?.postsCount || 0 },
                      { label: "Comments", value: selectedCommunity.stats?.commentsCount || 0 },
                      { label: "Reactions", value: selectedCommunity.stats?.reactionsCount || 0 },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4"
                      >
                        <p className="text-[9px] font-bold text-gray-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {showComposer ? (
                <div className="border-t border-white/10 bg-transparent px-5 py-5">
                  {isJoined ? (
                    <div className="rounded-[28px] border border-white/10 bg-[#09090b]/45 p-4">
                    <Input.TextArea
                      value={postContent}
                      onChange={(event) => setPostContent(event.target.value)}
                      rows={4}
                      placeholder="What are you building, learning, or stuck on today?"
                    />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Upload
                        beforeUpload={(file) => {
                          setPostMedia(file);
                          return false;
                        }}
                        maxCount={1}
                        onRemove={() => setPostMedia(null)}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          className="!rounded-xl !border-white/10 !bg-[#09090b] !text-[var(--primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary-hover)]"
                        >
                          {postMedia ? "Change Media" : "Attach Media"}
                        </Button>
                      </Upload>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowComposer(false)}
                          className="!h-11 !rounded-xl !border-white/10 !bg-[#09090b] !px-4 !font-semibold !text-gray-200 hover:!border-[var(--primary)] hover:!text-[var(--primary)]"
                        >
                          Close
                        </Button>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          loading={creatingPost}
                          onClick={handleCreatePost}
                          className="!h-11 !rounded-xl !border-none !bg-[var(--primary)] !px-5 !font-bold !text-black hover:!bg-[var(--primary-hover)]"
                        >
                          Publish
                        </Button>
                      </div>
                    </div>

                    {postMedia ? (
                      <p className="mt-3 text-[10px]  text-gray-500">
                        Selected file: {postMedia.name}
                      </p>
                    ) : null}
                    </div>
                  ) : !canInteract ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 backdrop-blur-lg p-6">
                    <p className="text-sm leading-7 text-gray-400">
                      Sign in first, then join this room to publish posts, react, and reply.
                    </p>
                    <Button
                      onClick={() => navigate("/login")}
                      icon={<LoginOutlined />}
                      className="!mt-4 !rounded-xl !border-none !bg-[var(--primary)] !px-5 !font-bold !text-black hover:!bg-[var(--primary-hover)]"
                    >
                      Login To Continue
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 backdrop-blur-lg p-6">
                    <p className="text-sm leading-7 text-gray-400">
                      You are browsing this room in read-only mode. Join the community first to
                      unlock posting, likes, and replies.
                    </p>
                    <Button
                      type="primary"
                      icon={<TeamOutlined />}
                      onClick={handleJoinCommunity}
                      loading={joiningCommunity}
                      className="!mt-4 !rounded-xl !border-none !bg-[var(--primary)] !px-5 !font-bold !text-black hover:!bg-[var(--primary-hover)]"
                    >
                      Join This Room
                    </Button>
                  </div>
                )}
                </div>
              ) : null}

              <div className="max-h-[calc(100vh-15rem)] overflow-y-auto border-t border-white/10 bg-transparent px-5 py-5">
                <div className="space-y-5">
                {posts.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 backdrop-blur-lg p-12">
                    <Empty
                      description={
                        <span className="text-xs  text-gray-500">
                          No posts published in this room yet
                        </span>
                      }
                    />
                  </div>
                ) : (
                  posts.map((post) => {
                    const isAuthor =
                      session && (session.id === post.author?._id || session.role === "admin");
                    const comments = commentInputs[post._id] || [];

                    return (
                      <motion.article
                        key={post._id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-[30px] border border-white/10 bg-transparent shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={post.author?.profileImage}
                                size={46}
                                className="border border-white/10 bg-[#09090b]"
                              >
                                {post.author?.fullname?.slice(0, 1) || "U"}
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold text-white">
                                  {post.author?.fullname || "Community Member"}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {formatDateTime(post.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isAuthor ? (
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeletePost(post._id)}
                                  className="!text-red-400 hover:!bg-red-500/10"
                                />
                              ) : null}
                              <Button
                                type="text"
                                icon={<MoreOutlined />}
                                className="!text-gray-400 hover:!bg-white/5"
                              />
                            </div>
                          </div>

                          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-gray-200">
                            {post.content || "Shared media update"}
                          </p>

                          {post.mediaUrl ? (
                            <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-[#09090b]">
                              {post.mediaType === "video" ? (
                                <video
                                  src={post.mediaUrl}
                                  controls
                                  className="max-h-[520px] w-full bg-[#09090b]"
                                />
                              ) : (
                                <img
                                  src={post.mediaUrl}
                                  alt="Community upload"
                                  className="max-h-[560px] w-full object-cover"
                                />
                              )}
                            </div>
                          ) : null}

                          <div className="mt-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-[11px] text-gray-500">
                            <div className="flex items-center gap-3">
                              <span>{post.likesCount || 0} likes</span>
                              <span>{post.dislikesCount || 0} dislikes</span>
                            </div>
                            <span>{post.stats?.commentsCount || 0} comments</span>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <Button
                              icon={<LikeOutlined />}
                              onClick={() => handleReaction(post._id, "like")}
                              className="!h-11 !rounded-2xl !border-none !bg-transparent !font-bold !text-gray-300 hover:!bg-white/5 hover:!text-[var(--primary)]"
                            >
                              Like
                            </Button>
                            <Button
                              icon={<MessageOutlined />}
                              onClick={() => handleToggleComments(post._id)}
                              className="!h-11 !rounded-2xl !border-none !bg-transparent !font-bold !text-gray-300 hover:!bg-white/5 hover:!text-[var(--primary)]"
                            >
                              Comment
                            </Button>
                            <Button
                              icon={<DislikeOutlined />}
                              onClick={() => handleReaction(post._id, "dislike")}
                              className="!h-11 !rounded-2xl !border-none !bg-transparent !font-bold !text-gray-300 hover:!bg-white/5 hover:!text-[var(--primary)]"
                            >
                              Dislike
                            </Button>
                          </div>
                        </div>

                        {!isJoined ? (
                          <div className="border-t border-white/10 bg-transparent px-5 py-3 text-[10px] font-semibold text-gray-500">
                            Join this room to react, comment, and reply
                          </div>
                        ) : null}

                        {loadingComments[post._id] ? (
                          <div className="border-t border-white/10 p-5">
                            <Skeleton active paragraph={{ rows: 2 }} />
                          </div>
                        ) : commentInputs[post._id] ? (
                          <div className="border-t border-white/10 bg-transparent p-5">
                            <div className="space-y-4">
                              {comments.length === 0 ? (
                                <p className="text-[11px]  text-gray-500">
                                  No comments yet. Start the thread.
                                </p>
                              ) : (
                                renderCommentThread(post._id, comments)
                              )}
                            </div>

                            {isJoined ? (
                              <div className="mt-5 flex items-start gap-3">
                                <Avatar
                                  src={session?.profileImage}
                                  className="border border-white/10 bg-[#09090b]"
                                >
                                  {session?.fullname?.slice(0, 1) || "Y"}
                                </Avatar>
                                <div className="flex-1 rounded-[28px] bg-[#171a1f] p-2">
                                  <Input
                                    value={commentDrafts[post._id] || ""}
                                    onChange={(event) =>
                                      setCommentDrafts((prev) => ({
                                        ...prev,
                                        [post._id]: event.target.value,
                                      }))
                                    }
                                    bordered={false}
                                    className="!bg-transparent"
                                    placeholder="Write a public comment..."
                                  />
                                  <div className="mt-2 flex justify-end">
                                    <Button
                                      type="primary"
                                      icon={<SendOutlined />}
                                      onClick={() => handleAddComment(post._id)}
                                      className="!rounded-xl !border-none !bg-[var(--primary)] !px-4 !font-semibold !text-black hover:!bg-[var(--primary-hover)]"
                                    >
                                      Comment
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-lg p-4">
                                <p className="text-[11px]  text-gray-500">
                                  Join this community first to reply inside the thread.
                                </p>
                                <Button
                                  onClick={handleJoinCommunity}
                                  loading={joiningCommunity}
                                  className="!mt-3 !rounded-xl !border-none !bg-[var(--primary)] !px-4 !font-semibold !text-black hover:!bg-[var(--primary-hover)]"
                                >
                                  Join To Reply
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </motion.article>
                    );
                  })
                )}
                </div>
              </div>
            </>
          )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-200 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(120,119,198,0.08),transparent_20%)] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-[rgba(250,204,21,0.07)] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-96 w-96 rounded-full bg-[rgba(251,191,36,0.05)] blur-[180px] pointer-events-none" />

      {renderHeader()}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {isDetailPage ? renderDetailPage() : renderBrowsePage()}
      </main>
    </div>
  );
};

export default Community;
