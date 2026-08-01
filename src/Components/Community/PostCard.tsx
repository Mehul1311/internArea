import React, { memo } from 'react';
import Image from 'next/image';
import { Post } from '../../types/community';
import { Heart, MessageCircle, Share2, User } from 'lucide-react';

interface PostCardProps {
    post: Post;
    onLike: (postId: number) => void;
    onShare: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = memo(({ post, onLike, onShare }) => {
    // Format date nicely
    const date = new Date(post.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-lg">
            {/* Header */}
            <div className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {post.profile_picture ? (
                        <Image src={post.profile_picture} alt={post.username} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-blue-500" size={20} />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">{post.username}</h3>
                    <p className="text-xs text-gray-500">{date}</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media */}
            {post.media_url && (
                <div className="w-full max-h-96 bg-gray-100 flex items-center justify-center overflow-hidden relative" style={{ minHeight: '300px' }}>
                    <Image src={post.media_url} alt="Post media" fill style={{ objectFit: 'contain' }} className="w-full max-h-96" />
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-gray-500">
                <button 
                    onClick={() => onLike(post.id)}
                    className="flex items-center space-x-2 hover:text-red-500 transition-colors group"
                >
                    <Heart size={20} className="group-hover:fill-red-100" />
                    <span className="text-sm font-medium">{post.likes_count}</span>
                </button>
                
                <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                    <MessageCircle size={20} />
                    <span className="text-sm font-medium">{post.comments_count}</span>
                </button>

                <button 
                    onClick={() => onShare(post.id)}
                    className="flex items-center space-x-2 hover:text-green-500 transition-colors"
                >
                    <Share2 size={20} />
                    <span className="text-sm font-medium">{post.shares_count}</span>
                </button>
            </div>
        </div>
    );
});
