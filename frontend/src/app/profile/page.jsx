"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./profile.module.css";
import Card from "@/components/card/Card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ProfileContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Active user target email (query param or currently logged-in user email)
  const targetEmail = searchParams.get("email") || session?.user?.email;

  const [activeTab, setActiveTab] = useState("posts"); // 'posts', 'about', 'followers', 'following'
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [updating, setUpdating] = useState(false);

  const isOwnProfile =
    session?.user?.email && targetEmail === session?.user?.email;

  // Fetch Profile Info
  const fetchProfile = React.useCallback(async () => {
    if (!targetEmail) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentEmail = session?.user?.email || "";
      const res = await fetch(
        `${API_URL}/api/users/profile?email=${encodeURIComponent(
          targetEmail
        )}&currentUserEmail=${encodeURIComponent(currentEmail)}`
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
  }, [targetEmail, session?.user?.email]);

  // Fetch User Posts
  const fetchPosts = React.useCallback(async () => {
    if (!targetEmail) return;
    try {
      const res = await fetch(
        `${API_URL}/api/posts?userEmail=${encodeURIComponent(targetEmail)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }, [targetEmail]);

  // Fetch Followers
  const fetchFollowersList = React.useCallback(async () => {
    if (!targetEmail) return;
    try {
      const res = await fetch(
        `${API_URL}/api/users/followers?email=${encodeURIComponent(targetEmail)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers || []);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  }, [targetEmail]);

  // Fetch Following
  const fetchFollowingList = React.useCallback(async () => {
    if (!targetEmail) return;
    try {
      const res = await fetch(
        `${API_URL}/api/users/following?email=${encodeURIComponent(targetEmail)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || []);
      }
    } catch (err) {
      console.error("Error fetching following list:", err);
    }
  }, [targetEmail]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  useEffect(() => {
    if (activeTab === "followers") fetchFollowersList();
    if (activeTab === "following") fetchFollowingList();
  }, [activeTab, fetchFollowersList, fetchFollowingList]);

  // Handle Follow / Unfollow toggle
  const handleToggleFollow = async () => {
    if (!session?.user?.email) {
      alert("Please log in to follow creators!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerEmail: session.user.email,
          targetEmail: targetEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  // Handle Update Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          name: editName,
          bio: editBio,
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
      <div className="wrapper">
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!targetEmail || !profileData) {
    return (
      <div className="wrapper">
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <p>Please log in to view your profile, or select a user from any post.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <Link href="/login" className={styles.followBtn}>
                🔑 Log In / Sign Up
              </Link>
              <Link href="/" className={styles.editBtn}>
                🏠 Go Back Home
              </Link>
            </div>
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
    <div className="wrapper">
      <div className={styles.container}>
        {/* Banner */}
        <div className={styles.bannerContainer}>
          <div className={styles.bannerOverlay} />
        </div>

        {/* Profile Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.topRow}>
            <div className={styles.avatarWrapper}>
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
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
                <button
                  className={styles.editBtn}
                  onClick={() => setIsEditOpen(true)}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <button
                  className={
                    isFollowing ? styles.followingBtn : styles.followBtn
                  }
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? "✓ Following" : "+ Follow"}
                </button>
              )}
            </div>
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.displayName}>{user?.name || user?.email}</h1>
            <span className={styles.userHandle}>u/{username}</span>
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
            <div
              className={styles.statCard}
              onClick={() => setActiveTab("posts")}
            >
              <span className={styles.statValue}>{stats?.postCount || 0}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>

            <div
              className={styles.statCard}
              onClick={() => setActiveTab("posts")}
            >
              <span className={styles.statValue}>{stats?.totalViews || 0}</span>
              <span className={styles.statLabel}>Post Karma/Views</span>
            </div>

            <div
              className={styles.statCard}
              onClick={() => setActiveTab("followers")}
            >
              <span className={styles.statValue}>{followerCount}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>

            <div
              className={styles.statCard}
              onClick={() => setActiveTab("following")}
            >
              <span className={styles.statValue}>
                {stats?.followingCount || 0}
              </span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabBtn} ${
              activeTab === "posts" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("posts")}
          >
            📝 Posts ({posts.length})
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "about" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("about")}
          >
            ℹ️ About
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "followers" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("followers")}
          >
            👥 Followers ({followerCount})
          </button>

          <button
            className={`${styles.tabBtn} ${
              activeTab === "following" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("following")}
          >
            👤 Following ({stats?.followingCount || 0})
          </button>
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
                posts.map((item) => <Card item={item} key={item.id} />)
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

          {activeTab === "about" && (
            <div className={styles.aboutBox}>
              <h2 className={styles.aboutTitle}>About u/{username}</h2>
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
                    href={`/profile?email=${encodeURIComponent(fUser.email)}`}
                    key={fUser.id}
                    className={styles.userCard}
                  >
                    {fUser.image ? (
                      <img
                        src={fUser.image}
                        alt={fUser.name}
                        className={styles.smallAvatar}
                      />
                    ) : (
                      <div className={styles.smallAvatarFallback}>
                        {(fUser.name || fUser.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className={styles.userCardDetails}>
                      <span className={styles.userCardName}>
                        {fUser.name || fUser.email}
                      </span>
                      <span className={styles.userCardHandle}>
                        u/
                        {fUser.name?.replace(/\s+/g, "").toLowerCase() ||
                          fUser.email.split("@")[0]}
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
                    href={`/profile?email=${encodeURIComponent(fUser.email)}`}
                    key={fUser.id}
                    className={styles.userCard}
                  >
                    {fUser.image ? (
                      <img
                        src={fUser.image}
                        alt={fUser.name}
                        className={styles.smallAvatar}
                      />
                    ) : (
                      <div className={styles.smallAvatarFallback}>
                        {(fUser.name || fUser.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className={styles.userCardDetails}>
                      <span className={styles.userCardName}>
                        {fUser.name || fUser.email}
                      </span>
                      <span className={styles.userCardHandle}>
                        u/
                        {fUser.name?.replace(/\s+/g, "").toLowerCase() ||
                          fUser.email.split("@")[0]}
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
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="wrapper"><p style={{ padding: 40, textAlign: "center" }}>Loading profile...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
