"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./profile.module.css";
import Card from "@/components/card/Card";
import { authFetch } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ProfileContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Active user target email or id (query param or currently logged-in user email)
  const targetEmailParam = searchParams.get("email");
  const targetIdParam = searchParams.get("id");
  const targetEmail = targetEmailParam || (!targetIdParam ? session?.user?.email : null);

  const [activeTab, setActiveTab] = useState("posts"); // 'posts', 'about', 'bookmarks', 'followers', 'following'
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowHovered, setIsFollowHovered] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updating, setUpdating] = useState(false);

  const avatarInputRef = React.useRef(null);

  const handleAvatarUpload = (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    authFetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.url) {
          setEditImage(data.url);
        } else {
          alert("Failed to upload avatar image.");
        }
      })
      .catch((err) => {
        console.error("Avatar upload error:", err);
        alert("Error uploading avatar.");
      })
      .finally(() => setUploadingAvatar(false));
  };

  const activeEmail = targetEmail || profileData?.user?.email;
  const isOwnProfile = Boolean(
    session?.user?.email &&
    activeEmail &&
    session.user.email.toLowerCase() === activeEmail.toLowerCase()
  );

  // Fetch Profile Info
  const fetchProfile = React.useCallback(async () => {
    if (!targetEmail && !targetIdParam) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentEmail = session?.user?.email || "";
      const googlePhoto =
        targetEmail === session?.user?.email && session?.user?.image
          ? session.user.image
          : "";

      const queryParam = targetIdParam
        ? `id=${encodeURIComponent(targetIdParam)}`
        : `email=${encodeURIComponent(targetEmail || "")}`;

      const res = await authFetch(
        `${API_URL}/api/users/profile?${queryParam}&currentUserEmail=${encodeURIComponent(currentEmail)}${
          googlePhoto ? `&image=${encodeURIComponent(googlePhoto)}` : ""
        }`
      );

      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setIsFollowing(data.isFollowing || false);
        setFollowerCount(data.stats?.followerCount || 0);
        setEditName(data.user?.name || "");
        setEditBio(data.user?.bio || "");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  }, [targetEmail, targetIdParam, session?.user?.email, session?.user?.image]);

  // Fetch User Posts
  const fetchPosts = React.useCallback(async () => {
    const emailToUse = targetEmail || profileData?.user?.email;
    if (!emailToUse) return;
    try {
      const res = await authFetch(
        `${API_URL}/api/posts?userEmail=${encodeURIComponent(emailToUse)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }, [targetEmail, profileData?.user?.email]);

  // Fetch Followers
  const fetchFollowersList = React.useCallback(async () => {
    const emailToUse = targetEmail || profileData?.user?.email;
    if (!emailToUse) return;
    try {
      const res = await authFetch(
        `${API_URL}/api/users/followers?email=${encodeURIComponent(emailToUse)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers || []);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  }, [targetEmail, profileData?.user?.email]);

  // Fetch Following
  const fetchFollowingList = React.useCallback(async () => {
    const emailToUse = targetEmail || profileData?.user?.email;
    if (!emailToUse) return;
    try {
      const res = await authFetch(
        `${API_URL}/api/users/following?email=${encodeURIComponent(emailToUse)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || []);
      }
    } catch (err) {
      console.error("Error fetching following list:", err);
    }
  }, [targetEmail, profileData?.user?.email]);

  // Fetch Bookmarks
  const fetchBookmarks = React.useCallback(async () => {
    const emailToUse = targetEmail || profileData?.user?.email;
    if (!emailToUse || !isOwnProfile) return;
    setLoadingBookmarks(true);
    try {
      const res = await authFetch(
        `${API_URL}/api/users/me/bookmarks?userEmail=${encodeURIComponent(emailToUse)}`
      );
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoadingBookmarks(false);
    }
  }, [targetEmail, profileData?.user?.email, isOwnProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileData?.user?.email || targetEmail) {
      fetchPosts();
    }
  }, [fetchPosts, profileData?.user?.email, targetEmail]);

  useEffect(() => {
    if (activeTab === "bookmarks" && isOwnProfile) {
      fetchBookmarks();
    }
  }, [activeTab, fetchBookmarks, isOwnProfile]);

  useEffect(() => {
    if (activeTab === "followers") fetchFollowersList();
    if (activeTab === "following") fetchFollowingList();
  }, [activeTab, fetchFollowersList, fetchFollowingList]);

  // Handle Follow / Unfollow toggle (Optimistic 0ms UI update)
  const handleToggleFollow = async () => {
    if (!session?.user?.email) {
      alert("Please log in to follow creators!");
      return;
    }

    const emailToFollow = targetEmail || profileData?.user?.email;
    const idToFollow = targetIdParam || profileData?.user?.id;
    if (!emailToFollow && !idToFollow) return;

    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    // Instant optimistic update
    setIsFollowing(!previousFollowing);
    setFollowerCount((prev) => (!previousFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await authFetch(`${API_URL}/api/users/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEmail: emailToFollow,
          targetId: idToFollow,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      } else {
        // Rollback on server failure
        setIsFollowing(previousFollowing);
        setFollowerCount(previousCount);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);
    }
  };

  // Handle Update Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await authFetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          name: editName,
          bio: editBio,
          image: editImage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData((prev) => ({
          ...prev,
          user: data.user,
        }));
        setIsEditOpen(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👤</div>
          <p>
            {!targetEmail && !targetIdParam && !session?.user?.email
              ? "Please log in to view your profile, or search for a creator."
              : "User profile not found."}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {!session?.user?.email && (
              <Link href="/login" className={styles.followBtn}>
                🔑 Log In / Sign Up
              </Link>
            )}
            <Link href="/" className={styles.editBtn}>
              🏠 Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, stats } = profileData;
  const username =
    user?.name?.replace(/\s+/g, "").toLowerCase() ||
    user?.email?.split("@")[0] ||
    "user";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className={styles.container}>
        {/* Banner */}
        <div className={styles.bannerContainer}>
          <div className={styles.bannerOverlay} />
        </div>

        {/* Profile Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.topRow}>
            <div className={styles.avatarWrapper}>
              {user?.image || (isOwnProfile && session?.user?.image) ? (
                <img
                  src={user?.image || session?.user?.image}
                  alt={user?.name || "Google Account Profile"}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className={styles.actionButtons}>
              {isOwnProfile ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles.editBtn}
                  onClick={() => {
                    setEditName(profileData?.user?.name || "");
                    setEditBio(profileData?.user?.bio || "");
                    setEditImage(profileData?.user?.image || session?.user?.image || "");
                    setIsEditOpen(true);
                  }}
                >
                  ✏️ Edit Profile
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className={
                    isFollowing ? styles.followingBtn : styles.followBtn
                  }
                  onClick={handleToggleFollow}
                  onMouseEnter={() => setIsFollowHovered(true)}
                  onMouseLeave={() => setIsFollowHovered(false)}
                >
                  {isFollowing
                    ? isFollowHovered
                      ? "✕ Unfollow"
                      : "✓ Following"
                    : "+ Follow"}
                </motion.button>
              )}
            </div>
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.displayName}>{user?.name || user?.email}</h1>
            <span className={styles.userHandle}>@{username}</span>
            <p className={styles.bioText}>
              {user?.bio ||
                (isOwnProfile
                  ? "Welcome to your BotBlogs profile! Click 'Edit Profile' to add your bio."
                  : "No bio shared yet.")}
            </p>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span>🎂 Joined {joinedDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span>📧 {user?.email}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className={styles.statsBar}>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.statCard}
              onClick={() => setActiveTab("posts")}
            >
              <span className={styles.statValue}>{stats?.postCount || 0}</span>
              <span className={styles.statLabel}>Posts</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.statCard}
              onClick={() => setActiveTab("posts")}
            >
              <span className={styles.statValue}>{stats?.totalViews || 0}</span>
              <span className={styles.statLabel}>Post Karma/Views</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.statCard}
              onClick={() => setActiveTab("followers")}
            >
              <span className={styles.statValue}>{followerCount}</span>
              <span className={styles.statLabel}>Followers</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.statCard}
              onClick={() => setActiveTab("following")}
            >
              <span className={styles.statValue}>
                {stats?.followingCount || 0}
              </span>
              <span className={styles.statLabel}>Following</span>
            </motion.div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className={styles.tabsContainer}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            className={`${styles.tabBtn} ${
              activeTab === "posts" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("posts")}
          >
            📝 Posts ({posts.length})
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            className={`${styles.tabBtn} ${
              activeTab === "about" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("about")}
          >
            ℹ️ About
          </motion.button>

          {isOwnProfile && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              className={`${styles.tabBtn} ${
                activeTab === "bookmarks" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("bookmarks")}
            >
              🔖 Saved ({bookmarks.length})
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            className={`${styles.tabBtn} ${
              activeTab === "followers" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("followers")}
          >
            👥 Followers ({followerCount})
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            className={`${styles.tabBtn} ${
              activeTab === "following" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("following")}
          >
            👤 Following ({stats?.followingCount || 0})
          </motion.button>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={styles.tabContent}
          >
            {activeTab === "posts" && (
            <div className={styles.postsList}>
              {posts && posts.length > 0 ? (
                posts.map((item) => <Card item={item} key={item.id} showDelete={isOwnProfile} />)
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <p>No posts published by this user yet.</p>
                  {isOwnProfile && (
                    <Link
                      href="/write"
                      className={styles.followBtn}
                      style={{ marginTop: 12 }}
                    >
                      + Create Your First Post
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "bookmarks" && isOwnProfile && (
            <div className={styles.postsList}>
              {loadingBookmarks ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>⏳</div>
                  <p>Loading saved bookmarks...</p>
                </div>
              ) : bookmarks && bookmarks.length > 0 ? (
                bookmarks.map((item) => <Card item={item} key={item.id || item.slug} />)
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔖</div>
                  <p>No bookmarked posts saved yet.</p>
                  <span style={{ fontSize: "0.85rem", color: "var(--softTextColor)" }}>
                    Click the 🏷️ Bookmark button on any post media to save it here for quick access!
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className={styles.aboutBox}>
              <h2 className={styles.aboutTitle}>About @{username}</h2>
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Display Name:</span>
                <span className={styles.aboutValue}>
                  {user?.name || "Not specified"}
                </span>
              </div>
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>User Email:</span>
                <span className={styles.aboutValue}>{user?.email}</span>
              </div>
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Member Since:</span>
                <span className={styles.aboutValue}>{joinedDate}</span>
              </div>
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Bio:</span>
                <span className={styles.aboutValue}>
                  {user?.bio || "No bio provided."}
                </span>
              </div>
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Total Posts:</span>
                <span className={styles.aboutValue}>
                  {stats?.postCount || 0} articles published
                </span>
              </div>
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Karma / Views:</span>
                <span className={styles.aboutValue}>
                  {stats?.totalViews || 0} total post reads
                </span>
              </div>
            </div>
          )}

          {activeTab === "followers" && (
            <div className={styles.userGrid}>
              {followers && followers.length > 0 ? (
                followers.map((fUser) => (
                  <Link
                    href={fUser.id ? `/profile?id=${encodeURIComponent(fUser.id)}` : `/profile?email=${encodeURIComponent(fUser.email || "")}`}
                    key={fUser.id}
                    className={styles.userCard}
                  >
                    {fUser.image ? (
                      <img
                        src={fUser.image}
                        alt={fUser.name || "User"}
                        className={styles.smallAvatar}
                      />
                    ) : (
                      <div className={styles.smallAvatarFallback}>
                        {(fUser.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className={styles.userCardDetails}>
                      <span className={styles.userCardName}>
                        {fUser.name || "Creator"}
                      </span>
                      <span className={styles.userCardHandle}>
                        @{fUser.name?.replace(/\s+/g, "_").toLowerCase() || "user"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
                  <div className={styles.emptyIcon}>👥</div>
                  <p>No followers yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "following" && (
            <div className={styles.userGrid}>
              {following && following.length > 0 ? (
                following.map((fUser) => (
                  <Link
                    href={fUser.id ? `/profile?id=${encodeURIComponent(fUser.id)}` : `/profile?email=${encodeURIComponent(fUser.email || "")}`}
                    key={fUser.id}
                    className={styles.userCard}
                  >
                    {fUser.image ? (
                      <img
                        src={fUser.image}
                        alt={fUser.name || "User"}
                        className={styles.smallAvatar}
                      />
                    ) : (
                      <div className={styles.smallAvatarFallback}>
                        {(fUser.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className={styles.userCardDetails}>
                      <span className={styles.userCardName}>
                        {fUser.name || "Creator"}
                      </span>
                      <span className={styles.userCardHandle}>
                        @{fUser.name?.replace(/\s+/g, "_").toLowerCase() || "user"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
                  <div className={styles.emptyIcon}>👤</div>
                  <p>Not following anyone yet.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
        </AnimatePresence>

        {/* Edit Profile Modal */}
        {isEditOpen && (
          <div className={styles.modalOverlay}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={styles.modalContent}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Edit Reddit Profile</h3>
                <button
                  className={styles.closeModalBtn}
                  onClick={() => setIsEditOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className={styles.formGroup} style={{ marginBottom: 16 }}>
                  <label className={styles.formLabel}>Profile Photo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: "#334155", border: "2px solid #38bdf8", flexShrink: 0 }}>
                      {editImage ? (
                        <img src={editImage} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24 }}>
                          {(editName || session?.user?.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                      />
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                        >
                          {uploadingAvatar ? "Uploading..." : "📷 Upload New Photo"}
                        </button>
                        {session?.user?.image && editImage !== session.user.image && (
                          <button
                            type="button"
                            className={styles.cancelBtn}
                            style={{ padding: "6px 14px", fontSize: "0.85rem", color: "#38bdf8", borderColor: "#38bdf8" }}
                            onClick={() => setEditImage(session.user.image)}
                          >
                            Google Photo
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Or paste image URL (e.g. https://...)"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        className={styles.formInput}
                        style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={styles.formInput}
                    placeholder="Your Display Name"
                    required
                  />
                </div>

                <div className={styles.formGroup} style={{ marginTop: 16 }}>
                  <label className={styles.formLabel}>About / Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className={styles.formTextarea}
                    placeholder="Tell the BotBlogs community about yourself..."
                    maxLength={300}
                  />
                </div>

                <div className={styles.modalFooter} style={{ marginTop: 24 }}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className={styles.container}><p style={{ padding: 40, textAlign: "center" }}>Loading profile...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
