'use client';
import React, { useEffect, useState } from 'react';
import { Post } from '../../types/community';
import { fetchPosts, likePost, sharePost } from '../../utils/communityApi';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { PlusCircle, Users } from 'lucide-react';

// For demonstration purposes, hardcode a test userId.
// In a real app, this would come from a user context or redux store.
const TEST_USER_ID = 1;

export const CommunityFeed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const data = await fetchPosts();
            setPosts(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load posts", err);
            setError("Failed to load community feed. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleLike = async (postId: number) => {
        try {
            await likePost(postId, TEST_USER_ID);
            // Optimistic update
            setPosts(posts.map(p => 
                p.id === postId 
                    ? { ...p, likes_count: Number(p.likes_count) + 1 } 
                    : p
            ));
        } catch (err) {
            console.error("Failed to like post", err);
        }
    };

    const handleShare = async (postId: number) => {
        try {
            await sharePost(postId, TEST_USER_ID);
            // Optimistic update
            setPosts(posts.map(p => 
                p.id === postId 
                    ? { ...p, shares_count: Number(p.shares_count) + 1 } 
                    : p
            ));
        } catch (err) {
            console.error("Failed to share post", err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Community Space</h1>
                        <p className="text-gray-500 text-sm">See what your friends are up to</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
                >
                    <PlusCircle size={20} />
                    <span>Create Post</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center border border-red-100">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onLike={handleLike} 
                            onShare={handleShare} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
                    <p className="text-gray-500">Be the first to share something with the community!</p>
                </div>
            )}

            <CreatePostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onPostCreated={loadPosts}
                currentUserId={TEST_USER_ID}
            />
        </div>
    );
};
