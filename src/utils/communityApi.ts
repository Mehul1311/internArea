import { Post } from '../types/community';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/community` : '/api/community';

export const fetchPosts = async (): Promise<Post[]> => {
    const res = await fetch(`${API_BASE}/posts`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
};

export const createPost = async (userId: number, content: string, mediaUrl?: string) => {
    const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, mediaUrl }),
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create post');
    }
    
    return res.json();
};

export const likePost = async (postId: number, userId: number) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to like post');
    return res.json();
};

export const sharePost = async (postId: number, userId: number) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to share post');
    return res.json();
};
