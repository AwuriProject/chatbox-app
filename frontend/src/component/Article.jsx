import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Edit, Trash2, Save, X } from 'lucide-react';
import { makeAuthenticatedRequest } from '../component/TokenAuth.js'
import { deletePostId } from './DeletePost.js';
import { handleLike } from './Love.js';
import { handleComment } from './Comment.js';

const Article = ({ refreshTrigger }) => {
    const [commentText, setCommentText] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        imageFile: null
    });
    const [editLoading, setEditLoading] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            // http://localhost:8000/feed/posts
            const res = await makeAuthenticatedRequest(`${process.env.VITE_API_URL}/feed/posts`);
            
            if(!res) return

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            setResult(
                data.posts.map(post => ({
                    ...post,
                    imagePath: post.imageUrl
                }))
            )
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshTrigger]);

   

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Start editing a post
    const startEditing = (post) => {
        setEditingPostId(post._id);
        setEditForm({
            title: post.title || '',
            content: post.content || '',
            imageFile: null
        });
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingPostId(null);
        setEditForm({ title: '', content: '', imageFile: null });
    };

    // Handle form input changes
    const handleEditFormChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setEditForm(prev => ({ ...prev, imageFile: file }));
    };

    // Helper function to handle response processing
    const handleResponse = async (res, postId) => {
        try {
            // Get response text first to see what we're actually receiving
            const responseText = await res.text();
            if (!res.ok) {
                // Try to parse as JSON, but handle HTML responses
                let errorMessage = `Server error: ${res.status}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    // If it's HTML, extract useful info
                    if (responseText.includes('<!DOCTYPE')) {
                        errorMessage = `Server returned HTML instead of JSON. Status: ${res.status}. Check if the API endpoint exists.`;
                    } else {
                        errorMessage = `Server response: ${responseText.substring(0, 100)}...`;
                    }
                }
                throw new Error(errorMessage);
            }

            // Parse the JSON response
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Server returned invalid JSON response');
            }
            
            // Check if the response has the expected structure
            if (!data || !data.post) {
                throw new Error('Server response missing post data');
            }
            
            // Update the post in the local state
            const updatedPost = data.post;
            setResult(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { 
                            ...post, 
                            ...updatedPost, 
                            imagePath: updatedPost.imageUrl || post.imagePath 
                        }
                        : post
                )
            );

            // Exit editing mode
            setEditingPostId(null);
            setEditForm({ title: '', content: '', imageFile: null });
            
        } catch (error) {
            throw error; // Re-throw to be handled by the calling function
        }
    };

    // Save edited post
    const saveEditedPost = async (postId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found');
            return;
        }

        setEditLoading(true);
        
        try {
            let res;
            if (editForm.imageFile) {
                const formData = new FormData();
                formData.append('title', editForm.title);
                formData.append('content', editForm.content);
                formData.append('image', editForm.imageFile);
                
                res = await fetch(`${process.env.VITE_API_URL}/feed/post/${postId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                });
            } else {
                res = await fetch(`${process.env.VITE_API_URL}/feed/post/${postId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: editForm.title,
                        content: editForm.content
                    })
                });
            }
            
            await handleResponse(res, postId);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading posts: {error}</p>
                    <button 
                        onClick={fetchPosts} 
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!result || result.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">No posts available. Create your first post!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="space-y-6">
                {result.map((post, index) => (
                    <article key={post._id || post.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 pb-3">
                            <div className="flex items-start gap-2.5">
                                <img 
                                    src={
                                        post.creator?.profileImageUrl && post.creator.profileImageUrl !== 'null'
                                            ? `${process.env.VITE_API_URL}/${post.creator.profileImageUrl}`
                                            : 'images/avatar.png'
                                    }
                                    alt={`${post.creator?.name || 'User'}'s profile`} 
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'images/avatar.png';
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{post.creator?.name || 'Unknown User'}</h3>
                                    <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                {editingPostId === post._id ? (
                                    <>
                                        <button 
                                            onClick={() => saveEditedPost(post._id)}
                                            disabled={editLoading}
                                            className="text-green-600 hover:text-green-700 transition-colors p-1 rounded hover:bg-green-50 disabled:opacity-50"
                                        >
                                            <Save size={18} />
                                        </button>
                                        <button 
                                            onClick={cancelEditing}
                                            disabled={editLoading}
                                            className="text-gray-600 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => startEditing(post)} 
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-gray-100"
                                        >
                                            <Edit size={18} />
                                        </button>
                                       <button onClick={() => deletePostId(post._id, setResult, setError)} className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-100">
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                                <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>    

                        {/* Content - Edit Mode or Display Mode */}
                        <div className="px-4 pb-3">
                            {editingPostId === post._id ? (
                                <div className="space-y-4">
                                    {/* Edit Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => handleEditFormChange('title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Post title..."
                                        />
                                    </div>
                                    
                                    {/* Edit Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                        <textarea
                                            value={editForm.content}
                                            onChange={(e) => handleEditFormChange('content', e.target.value)}
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="What's on your mind?"
                                        />
                                    </div>
                                    
                                    {/* Edit Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {editForm.imageFile && (
                                            <p className="text-sm text-gray-600 mt-1">Selected: {editForm.imageFile.name}</p>
                                        )}
                                    </div>
                                    
                                    {editLoading && (
                                        <div className="flex items-center justify-center py-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-sm text-gray-600">Saving changes...</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {post.title && (
                                        <h2 className="font-semibold text-gray-900 mb-2">{post.title}</h2>
                                    )}
                                    <p className="text-gray-900 leading-relaxed">{post.content}</p>
                                </>
                            )}
                        </div>
                        
                        {/* Image - Only show in display mode */}
                        {editingPostId !== post._id && post.imageUrl && (
                            <div className="px-4 pb-3">
                                <img 
                                    src={post.imageUrl.startsWith('http') ? post.imageUrl : `${process.env.VITE_API_URL}/${post.imageUrl}`} 
                                    alt="Post content" 
                                    className="w-full rounded-lg max-h-96 object-cover"
                                    style={{
                                        imageRendering: 'crisp-edges'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'images/mother-child.png';
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Actions - Only show in display mode */}
                        {editingPostId !== post._id && (
                            <div className="px-4 py-3 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <button 
                                            onClick={() => handleLike(post._id || post.id, setResult, setError)}
                                            className={`flex items-center space-x-2 transition-colors ${
                                                post.liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                                            }`}
                                        >
                                            <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} />
                                            <span className="text-sm font-medium">
                                                {post.likesCount || 0} {post.likesCount === 1 ? 'like' : 'likes'}
                                            </span>
                                        </button>
                                
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                            />
                                            <button onClick={() => {
                                                if (commentText.trim()) {
                                                    handleComment(post._id, commentText.trim(), setResult, setError);
                                                    setCommentText('');
                                                }
                                                }}>
                                                    <MessageCircle size={20} />
                                            </button>
                                        </div>
                                        {post.comments && post.comments.length > 0 && (
                                            <div className="comments-section">
                                                {post.comments.map((comment, index) => (
                                                    <p key={index}>{comment.text} - <small>{new Date(comment.createdAt).toLocaleString()}</small></p>
                                                ))}
                                            </div>
                                        )}
                                        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                                            <Share size={20} />
                                            <span className="text-sm font-medium">Share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Article;