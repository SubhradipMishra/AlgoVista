import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MessageOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Skeleton,
  Switch,
  Tag,
  Upload,
} from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Context from "../../util/context";
import AdminSidebar from "./AdminSidebar";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const statCards = [
  { key: "totalCommunities", label: "Communities", icon: <AppstoreOutlined /> },
  { key: "activeCommunities", label: "Active Rooms", icon: <EyeOutlined /> },
  { key: "totalPosts", label: "Posts", icon: <MessageOutlined /> },
  { key: "totalComments", label: "Comments", icon: <EditOutlined /> },
];

const AdminCommunity = () => {
  const navigate = useNavigate();
  const { session, sessionLoading } = useContext(Context);
  const [open, setOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [summary, setSummary] = useState({
    totalCommunities: 0,
    activeCommunities: 0,
    totalPosts: 0,
    totalComments: 0,
    totalReactions: 0,
  });
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!sessionLoading) {
      if (!session) {
        navigate("/login");
      } else if (session.role !== "admin") {
        message.error("Access denied! Admins only.");
        navigate("/");
      }
    }
  }, [navigate, session, sessionLoading]);

  useEffect(() => {
    if (session?.role === "admin") {
      fetchCommunities();
    }
  }, [session]);

  useEffect(() => {
    if (selectedCommunityId) {
      fetchCommunityDetails(selectedCommunityId);
    }
  }, [selectedCommunityId]);

  const selectedSummary = useMemo(() => {
    if (!selectedCommunity) {
      return {
        postsCount: 0,
        commentsCount: 0,
        reactionsCount: 0,
      };
    }

    return selectedCommunity.stats || {
      postsCount: 0,
      commentsCount: 0,
      reactionsCount: 0,
    };
  }, [selectedCommunity]);

  const fetchCommunities = async (preferredCommunityId) => {
    try {
      setLoadingList(true);
      const { data } = await axios.get(`${API_BASE_URL}/community`, {
        withCredentials: true,
      });

      const nextCommunities = data.communities || [];
      setCommunities(nextCommunities);
      setSummary(
        data.summary || {
          totalCommunities: 0,
          activeCommunities: 0,
          totalPosts: 0,
          totalComments: 0,
          totalReactions: 0,
        }
      );

      const fallbackCommunityId =
        preferredCommunityId ||
        (nextCommunities.find((community) => community._id === selectedCommunityId)?._id ??
          nextCommunities[0]?._id ??
          "");

      setSelectedCommunityId(fallbackCommunityId);

      if (!nextCommunities.length) {
        setSelectedCommunity(null);
        setSelectedPosts([]);
      } else if (fallbackCommunityId === selectedCommunityId || preferredCommunityId) {
        fetchCommunityDetails(fallbackCommunityId);
      }
    } catch (error) {
      console.error("Failed to fetch communities:", error);
      message.error("Failed to load communities");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchCommunityDetails = async (communityId) => {
    try {
      setLoadingDetails(true);
      const { data } = await axios.get(`${API_BASE_URL}/community/${communityId}`, {
        withCredentials: true,
      });
      setSelectedCommunity(data.community || null);
      setSelectedPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch community details:", error);
      message.error("Failed to load community details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const resetModalState = () => {
    form.resetFields();
    setCoverFile(null);
    setEditingCommunity(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingCommunity(null);
    setCoverFile(null);
    form.setFieldsValue({
      name: "",
      description: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (community) => {
    setEditingCommunity(community);
    setCoverFile(null);
    form.setFieldsValue({
      name: community.name,
      description: community.description,
      active: community.active,
    });
    setIsModalOpen(true);
  };

  const handleSaveCommunity = async (values) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("description", values.description?.trim() || "");
      formData.append("active", String(values.active));

      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      if (editingCommunity?._id) {
        await axios.put(`${API_BASE_URL}/community/${editingCommunity._id}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Community updated successfully");
        await fetchCommunities(editingCommunity._id);
      } else {
        const { data } = await axios.post(`${API_BASE_URL}/community`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Community created successfully");
        await fetchCommunities(data.community?._id);
      }

      resetModalState();
    } catch (error) {
      console.error("Failed to save community:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save community"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommunity = (community) => {
    Modal.confirm({
      title: "Delete community?",
      content: `This will remove ${community.name} and all related posts, reactions, and comments.`,
      okText: "Delete",
      okButtonProps: {
        danger: true,
        className: "!bg-red-500 !border-red-500 hover:!bg-red-600",
      },
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/community/${community._id}`, {
            withCredentials: true,
          });
          message.success("Community deleted successfully");

          const nextSelectedId =
            community._id === selectedCommunityId
              ? communities.find((item) => item._id !== community._id)?._id || ""
              : selectedCommunityId;

          await fetchCommunities(nextSelectedId);
        } catch (error) {
          console.error("Failed to delete community:", error);
          message.error("Failed to delete community");
        }
      },
    });
  };

  if (sessionLoading || !session) {
    return (
      <div className="flex min-h-screen bg-black text-white font-mono overflow-hidden">
        <aside className="w-64 bg-gray-900 border-r border-gray-700 p-6 flex flex-col gap-6">
          <Skeleton.Avatar active size={64} shape="circle" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </aside>
        <main className="flex-1 px-8 md:px-16 py-10 overflow-y-auto">
          <Skeleton.Input active size="large" style={{ width: "40%", marginBottom: "1.5rem" }} />
          <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg"
              >
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-gray-200 font-mono relative overflow-hidden pb-20">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-[rgba(250,204,21,0.08)] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-16 h-72 w-72 rounded-full bg-[rgba(250,204,21,0.05)] blur-[160px] pointer-events-none" />

      <AdminSidebar session={session} open={open} setOpen={setOpen} />

      <main className="flex-1 p-6 md:p-10 relative z-10 font-mono overflow-y-auto max-h-screen">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 border-b border-gray-900 pb-6">
          <div>
            <span className="section-kicker">
              <MessageOutlined />
              Community Control
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-black uppercase tracking-[0.18em] text-white">
              Community Console
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-gray-400 leading-7">
              Launch and moderate discussion spaces from the admin dashboard. This panel keeps
              creation, activation, and post visibility inside the same black-and-gold control
              surface as the rest of AlgoVista.
            </p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            className="!h-12 !rounded-xl !border-none !bg-[var(--primary)] !px-6 !font-black !uppercase !tracking-[0.2em] !text-black hover:!bg-[var(--primary-hover)]"
          >
            New Community
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {statCards.map((card, index) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="feature-card rounded-3xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500 font-black">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-black text-white">
                    {summary[card.key] || 0}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(250,204,21,0.15)] bg-[rgba(250,204,21,0.06)] text-xl text-[var(--primary)]">
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-8">
          <section className="feature-panel rounded-[28px] border border-[rgba(250,204,21,0.12)] p-6 md:p-7">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Community Registry
                </h2>
                <p className="mt-2 text-xs text-gray-500 uppercase tracking-[0.16em]">
                  {communities.length} configured spaces
                </p>
              </div>
            </div>

            {loadingList ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-[rgba(250,204,21,0.08)] bg-[#050505] p-5"
                  >
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </div>
                ))}
              </div>
            ) : communities.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[rgba(250,204,21,0.15)] bg-[#050505] p-12">
                <Empty
                  description={
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      No communities created yet
                    </span>
                  }
                />
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {communities.map((community) => {
                  const isSelected = selectedCommunityId === community._id;

                  return (
                    <button
                      key={community._id}
                      type="button"
                      onClick={() => setSelectedCommunityId(community._id)}
                      className={`text-left rounded-[28px] border p-5 transition-all duration-300 ${
                        isSelected
                          ? "border-[rgba(250,204,21,0.45)] bg-[linear-gradient(145deg,rgba(250,204,21,0.08),rgba(5,5,5,0.96))] shadow-[0_0_0_1px_rgba(250,204,21,0.08),0_24px_50px_rgba(0,0,0,0.45)]"
                          : "border-[rgba(250,204,21,0.08)] bg-[#050505] hover:border-[rgba(250,204,21,0.22)] hover:-translate-y-1"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[rgba(250,204,21,0.18)] bg-[#111]">
                            {community.coverImageUrl ? (
                              <img
                                src={community.coverImageUrl}
                                alt={community.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg font-black text-[var(--primary)]">
                                {community.name?.slice(0, 1)?.toUpperCase() || "C"}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                                {community.name}
                              </h3>
                              <Tag
                                color={community.active ? "gold" : "default"}
                                className="!m-0 !rounded-full !border-none !px-3 !py-1 !font-mono !text-[9px] !font-black !uppercase !tracking-[0.15em]"
                              >
                                {community.active ? "Active" : "Paused"}
                              </Tag>
                            </div>
                            <p className="mt-2 text-xs text-gray-400 line-clamp-2">
                              {community.description || "No description added yet."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {[
                          { label: "Posts", value: community.stats?.postsCount || 0 },
                          { label: "Comments", value: community.stats?.commentsCount || 0 },
                          { label: "Reactions", value: community.stats?.reactionsCount || 0 },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-[rgba(250,204,21,0.08)] bg-black/60 px-3 py-3"
                          >
                            <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500 font-black">
                              {item.label}
                            </p>
                            <p className="mt-2 text-lg font-black text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[rgba(250,204,21,0.08)] pt-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={community.creatorId?.profileImage}
                            size={34}
                            className="border border-[rgba(250,204,21,0.15)] bg-black"
                          >
                            {community.creatorId?.fullname?.slice(0, 1)}
                          </Avatar>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                              Created By
                            </p>
                            <p className="text-xs text-white">
                              {community.creatorId?.fullname || "Admin"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditModal(community);
                            }}
                            className="!text-[var(--primary)] hover:!bg-[rgba(250,204,21,0.08)]"
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteCommunity(community);
                            }}
                            className="!text-red-400 hover:!bg-red-500/10"
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="feature-panel rounded-[28px] border border-[rgba(250,204,21,0.12)] p-6 md:p-7">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Activity Snapshot
                </h2>
                <p className="mt-2 text-xs text-gray-500 uppercase tracking-[0.16em]">
                  selected community intelligence
                </p>
              </div>

              {selectedCommunity && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(selectedCommunity)}
                  className="!rounded-xl !border-[rgba(250,204,21,0.15)] !bg-black !text-[var(--primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary-hover)]"
                >
                  Edit
                </Button>
              )}
            </div>

            {loadingDetails ? (
              <Skeleton active paragraph={{ rows: 10 }} />
            ) : !selectedCommunity ? (
              <div className="rounded-[28px] border border-dashed border-[rgba(250,204,21,0.15)] bg-[#050505] p-10">
                <Empty
                  description={
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Select a community to inspect it
                    </span>
                  }
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-[28px] border border-[rgba(250,204,21,0.12)] bg-[#050505]">
                  <div className="relative h-44 w-full bg-[linear-gradient(135deg,rgba(250,204,21,0.14),rgba(0,0,0,0.2))]">
                    {selectedCommunity.coverImageUrl ? (
                      <img
                        src={selectedCommunity.coverImageUrl}
                        alt={selectedCommunity.name}
                        className="h-full w-full object-cover opacity-80"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(3,3,3,0.9))]" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black uppercase tracking-[0.18em] text-white">
                              {selectedCommunity.name}
                            </h3>
                            <Tag
                              color={selectedCommunity.active ? "gold" : "default"}
                              className="!rounded-full !px-3 !py-1 !font-mono !text-[9px] !font-black !uppercase !tracking-[0.15em]"
                            >
                              {selectedCommunity.active ? "Live" : "Paused"}
                            </Tag>
                          </div>
                          <p className="mt-3 max-w-xl text-sm text-gray-300">
                            {selectedCommunity.description || "No description available."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-5">
                    {[
                      { label: "Posts", value: selectedSummary.postsCount },
                      { label: "Comments", value: selectedSummary.commentsCount },
                      { label: "Reactions", value: selectedSummary.reactionsCount },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-[rgba(250,204,21,0.08)] bg-black/70 p-4"
                      >
                        <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500 font-black">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[rgba(250,204,21,0.08)] bg-[#050505] p-5">
                  <div className="flex items-center justify-between gap-4 border-b border-[rgba(250,204,21,0.08)] pb-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white">
                        Latest Posts
                      </h4>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                        Live preview of current community activity
                      </p>
                    </div>
                    <span className="rounded-full border border-[rgba(250,204,21,0.12)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--primary)]">
                      {selectedPosts.length} visible
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 max-h-[560px] overflow-y-auto pr-1">
                    {selectedPosts.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-[rgba(250,204,21,0.12)] bg-black/50 p-8">
                        <Empty
                          description={
                            <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                              No posts inside this community yet
                            </span>
                          }
                        />
                      </div>
                    ) : (
                      selectedPosts.map((post) => (
                        <div
                          key={post._id}
                          className="rounded-3xl border border-[rgba(250,204,21,0.08)] bg-black/60 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={post.author?.profileImage}
                              size={38}
                              className="border border-[rgba(250,204,21,0.15)] bg-black"
                            >
                              {post.author?.fullname?.slice(0, 1)}
                            </Avatar>
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.16em] text-white">
                                {post.author?.fullname || "Community Member"}
                              </p>
                              <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
                                {new Date(post.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-gray-300 whitespace-pre-wrap">
                            {post.content || "Media-only post"}
                          </p>

                          {post.mediaUrl ? (
                            <a
                              href={post.mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex rounded-full border border-[rgba(250,204,21,0.15)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--primary)] hover:border-[var(--primary)]"
                            >
                              Open Attached {post.mediaType || "media"}
                            </a>
                          ) : null}

                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[rgba(250,204,21,0.08)] pt-4">
                            {[
                              { label: "Likes", value: post.likesCount || 0 },
                              { label: "Dislikes", value: post.dislikesCount || 0 },
                              { label: "Comments", value: post.stats?.commentsCount || 0 },
                            ].map((item) => (
                              <span
                                key={item.label}
                                className="rounded-full border border-[rgba(250,204,21,0.12)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400"
                              >
                                {item.label}: {item.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Modal
        open={isModalOpen}
        title={
          <span className="font-mono text-sm font-black uppercase tracking-[0.2em] text-white">
            {editingCommunity ? "Edit Community" : "Create Community"}
          </span>
        }
        onCancel={resetModalState}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editingCommunity ? "Save Changes" : "Create"}
        cancelText="Cancel"
        className="community-admin-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveCommunity}
          initialValues={{ active: true }}
          className="pt-4"
        >
          <Form.Item
            name="name"
            label="Community Name"
            rules={[{ required: true, message: "Community name is required" }]}
          >
            <Input placeholder="System Design Guild" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={4}
              placeholder="What kind of conversations should happen in this space?"
            />
          </Form.Item>

          <Form.Item label="Cover Image">
            <Upload
              beforeUpload={(file) => {
                setCoverFile(file);
                return false;
              }}
              maxCount={1}
              onRemove={() => setCoverFile(null)}
            >
              <Button
                icon={<UploadOutlined />}
                className="!rounded-xl !border-[rgba(250,204,21,0.15)] !bg-black !text-[var(--primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary-hover)]"
              >
                Upload Cover
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item name="active" label="Community Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Paused" />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .community-admin-modal .ant-modal-content {
          background: rgba(5, 5, 5, 0.98) !important;
          border: 1px solid rgba(250, 204, 21, 0.12) !important;
          border-radius: 24px !important;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5) !important;
        }

        .community-admin-modal .ant-modal-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(250, 204, 21, 0.08) !important;
          padding-bottom: 16px !important;
        }

        .community-admin-modal .ant-modal-close {
          color: #999 !important;
        }

        .community-admin-modal .ant-modal-footer {
          border-top: 1px solid rgba(250, 204, 21, 0.08) !important;
          padding-top: 16px !important;
        }

        .community-admin-modal .ant-btn-primary {
          background: var(--primary) !important;
          color: #000 !important;
          border: none !important;
          font-family: var(--font-mono) !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.16em !important;
        }

        .community-admin-modal .ant-btn-default {
          background: transparent !important;
          color: #d4d4d4 !important;
          border: 1px solid rgba(250, 204, 21, 0.12) !important;
          font-family: var(--font-mono) !important;
        }
      `}</style>
    </div>
  );
};

export default AdminCommunity;
