import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { createPost } from '../../utils/communityApi';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
    currentUserId: number;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
    isOpen, onClose, onPostCreated, currentUserId 
}) => {
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!content.trim() && !mediaUrl.trim()) {
            setError("Post must contain text or a media URL.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createPost(currentUserId, content, mediaUrl);
            setContent('');
            setMediaUrl('');
            onPostCreated(); // Refresh feed
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create post. You might have reached your daily limit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col transform transition-all">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <h2 className="text-xl font-bold text-gray-800">Create a Post</h2>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 flex flex-col space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start">
                            <span className="font-semibold mr-2">Error:</span>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <textarea
                        placeholder="What's on your mind?"
                        className="w-full min-h-[120px] p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    
                    <div className="flex items-center space-x-2">
                        <ImageIcon className="text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Media URL (Photo or Video Link)"
                            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                        />
                    </div>
                    
                    <div className="pt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-3 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || (!content.trim() && !mediaUrl.trim())}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
