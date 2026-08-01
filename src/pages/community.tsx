import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectuser } from '@/Feature/Userslice';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  Users, UserPlus, Image as ImageIcon, Heart, MessageCircle, Share2, 
  Send, ShieldAlert, Sparkles 
} from 'lucide-react';

export default function CommunityPage() {
  const router = useRouter();
  const reduxUser = useSelector(selectuser);
  const [localUser, setLocalUser] = useState<any>(null);
  
  const [posts, setPosts] = useState<any[]>([]);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      try { setLocalUser(JSON.parse(storedUser)); } catch (e) {}
    } else if (!reduxUser) {
      router.push('/login');
      toast.info('Please login to access Public Space');
    }
  }, [reduxUser, router]);

  const activeUser = reduxUser || localUser;
  const currentUser = activeUser || {}; // Fallback empty object to prevent null access errors before redirect

  useEffect(() => {
    if (activeUser?.id) {
      fetchFriends(activeUser.id);
      fetchPosts();
    }
  }, [activeUser]);

  const fetchFriends = async (userId: number) => {
    try {
      const res = await apiClient.get(`/community/friends?userId=${userId}`);
      setFriendsCount(res.data.count || 2);
    } catch (e) {
      setFriendsCount(2);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get('/community/posts');
      setPosts(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFriend = async () => {
    try {
      const nextFriendId = Math.floor(Math.random() * 1000) + 10;
      const res = await apiClient.post('/community/friends/add', {
        userId: currentUser.id,
        friendId: nextFriendId
      });
      setFriendsCount(res.data.friendCount);
      toast.success(`🎉 Friend added! Total friends now: ${res.data.friendCount}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add friend");
    }
  };

  const getPostLimitDisplay = (count: number) => {
    if (count === 0) return { limitText: "0 posts/day", badge: "No Friends (Blocked)", color: "text-red-600 bg-red-50 border-red-200" };
    if (count === 1) return { limitText: "1 post/day", badge: "1 Friend (1 Post/Day)", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (count === 2) return { limitText: "2 posts/day", badge: "2 Friends (2 Posts/Day)", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (count > 2 && count <= 10) return { limitText: `${count} posts/day`, badge: `${count} Friends (${count} Posts/Day)`, color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    return { limitText: "Unlimited posts/day", badge: `${count} Friends (Unlimited Posts)`, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !mediaUrl) {
      toast.error("Please add text or a photo/video URL");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/community/posts', {
        userId: currentUser.id,
        content,
        mediaUrl
      });
      toast.success("🚀 Post created successfully in Public Space!");
      setContent('');
      setMediaUrl('');
      fetchPosts();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Failed to create post";
      toast.error(`⚠️ ${errMsg}`, { autoClose: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await apiClient.post(`/community/posts/${postId}/like`, { userId: currentUser.id });
      fetchPosts();
    } catch (e) {}
  };

  const handleComment = async (postId: number) => {
    const text = commentInputs[postId];
    if (!text) return;
    try {
      await apiClient.post(`/community/posts/${postId}/comment`, {
        userId: currentUser.id,
        content: text
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (e) {}
  };

  const handleShare = async (postId: number) => {
    try {
      await apiClient.post(`/community/posts/${postId}/share`, { userId: currentUser.id });
      toast.info("🔗 Post link copied to clipboard & shared!");
      fetchPosts();
    } catch (e) {}
  };

  const statusInfo = getPostLimitDisplay(friendsCount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
                <Sparkles size={14} /> Public Space Community
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Connect, Share & Engage</h1>
              <p className="text-sm text-blue-100 mt-1 max-w-lg">
                Upload photos, videos, like, comment, and engage with student peers across InternArea.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[200px]">
              <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Your Connections</div>
              <div className="text-3xl font-extrabold my-1">{friendsCount} Friends</div>
              <button
                onClick={handleAddFriend}
                className="mt-2 bg-white text-indigo-700 hover:bg-blue-50 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 w-full shadow-sm"
              >
                <UserPlus size={14} /> Add Friend (+1 Limit)
              </button>
            </div>
          </div>
        </div>

        {/* Posting Limit Rule Notice */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Posting Rule Status</div>
              <div className="text-xs text-gray-600">
                0 Friends = 0 posts/day | 1 Friend = 1 post/day | 2 Friends = 2 posts/day | &gt;10 Friends = Unlimited
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
            {statusInfo.badge}
          </span>
        </div>

        {/* Create Post Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>Create a Post</span>
          </h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              rows={3}
              placeholder="What's on your mind? Share your thoughts, project updates, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
            ></textarea>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs">
                <ImageIcon size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Photo or Video URL (e.g. https://images.unsplash.com/...)"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-gray-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                <span>{loading ? 'Posting...' : 'Post to Community'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Community Feed Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Public Community Feed</h2>

          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              {/* User Author info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {post.username ? post.username[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{post.username || 'Student User'}</div>
                  <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Content text */}
              {post.content && (
                <p className="text-gray-800 text-sm mb-4 leading-relaxed whitespace-pre-line">{post.content}</p>
              )}

              {/* Media Image / Video */}
              {post.media_url && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 max-h-96 bg-black flex items-center justify-center relative" style={{ minHeight: '300px' }}>
                  <Image src={post.media_url} alt="Community media" fill style={{ objectFit: 'cover' }} className="w-full" />
                </div>
              )}

              {/* Action Buttons: Like, Comment, Share */}
              <div className="flex items-center justify-between border-t border-b border-gray-100 py-3 my-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-500 transition"
                >
                  <Heart size={16} className="text-red-500 fill-red-500" />
                  <span>{post.likes_count || 0} Likes</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <MessageCircle size={16} className="text-blue-500" />
                  <span>{post.comments_count || post.comments?.length || 0} Comments</span>
                </div>

                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 transition"
                >
                  <Share2 size={16} className="text-indigo-500" />
                  <span>{post.shares_count || 0} Share</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-2">
                {post.comments && post.comments.map((c: any) => (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-3 text-xs">
                    <span className="font-bold text-gray-900 mr-2">{c.username}:</span>
                    <span className="text-gray-700">{c.content}</span>
                  </div>
                ))}

                {/* Comment Input */}
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
