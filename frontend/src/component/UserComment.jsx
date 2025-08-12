import React, { useState } from 'react'
import { handleComment } from './Comment';

const UserComment = async (postId, setResult, setError) => {
    const [commentText, setCommentText] = useState('')

    const token = localStorage.getItem('token');
    if (!token) {
        setError('No authentication token found');
        return;
    }

    try {
        const res = await fetch(`${process.env.VITE_API_URL}/feed/post/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: commentText
            })
        });
        
        if (!res.ok) {
            throw new Error(`Commenting on post failed: ${res.status}`);
        }
        
        const data = await res.json();
        console.log(data.comment);
        
        setResult(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, comments: [...post.comments, data.comment] }
                    : post
            )
        );
    } catch (error) {
        console.log('Error commenting on post:', error);
        setError('Failed to add comment');
    }
    const handleComment = () =>{
        setCommentText((prevComment) =>{
            console.log(prevComment)
        })
    }

  return (
    <div>
    <input
        type="text"
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
    />
    <button onClick={handleComment}>
        Add Comment
    </button>
</div>
  )
}

export default UserComment
