import { makeAuthenticatedRequest } from '../component/TokenAuth'

export const handleLike = async (postId, setResult, setError) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setError('No authentication token found');
        return;
    }
    
    try {
        const res = await makeAuthenticatedRequest(`${process.env.REACT_APP_API}/feed/post/${postId}/like`, {
            method: 'PUT'
        });
        
        if(!res) return

        if (!res.ok) {
            throw new Error(`Liking post failed: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Update the post in local state
        setResult(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { 
                        ...post, 
                        liked: data.liked,
                        likesCount: data.likesCount
                      }
                    : post
            )
        );
    } catch (error) {
        console.log('Error liking post:', error);
        setError('Failed to like post');
    }
};