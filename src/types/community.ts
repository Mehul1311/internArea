export interface User {
    id: number;
    username: string;
    profile_picture?: string;
}

export interface Post {
    id: number;
    user_id: number;
    username: string;
    profile_picture?: string;
    content: string;
    media_url?: string;
    created_at: string;
    likes_count: string | number;
    comments_count: string | number;
    shares_count: string | number;
}

export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    username: string;
    content: string;
    created_at: string;
}
