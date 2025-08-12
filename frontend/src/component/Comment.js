import { makeAuthenticatedRequest } from '../component/TokenAuth'

export const handleComment = async (postId, commentText, setResult, setError) => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //     setError('No authentication token found');
    //     return;
    // }
    
    try {
        const res = await makeAuthenticatedRequest(`${process.env.REACT_APP_API}/feed/post/${postId}/comment`, {
            method: 'POST',
            body: JSON.stringify({
                text: commentText
            })
        });

        if (!res) return;
        
        if (!res.ok) {
            throw new Error(`Commenting on post failed: ${res.status}`);
        }
        
        const data = await res.json();
        setResult(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, comments: [...(post.comments || []), data.comment] }
                    : post
            )
        );

    } catch (error) {
        console.log('Error commenting on post:', error);
        setError('Failed to add comment');
    }
};