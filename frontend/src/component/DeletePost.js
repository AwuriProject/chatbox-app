import { post } from "../../../backend/routes/feed";

export const deletePostId = async (postId, setResult, setError) => {
    console.log(postId)
    const token = localStorage.getItem('token');
    if (!token) {
        setError('No authentication token found');
        return;
    }
    try {
        const res = await fetch(`https://my-chat-box.up.railway.app/feed/post/${postId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if(!res.ok){
            throw new Error(`Deleting a post failed!: ${res.status}`);
        }
        const data = await res.json()
        console.log(data.message)
        
        if (typeof setResult === 'function') {
            setResult(prevPosts => {
                if (Array.isArray(prevPosts)) {
                    console.log(post => post._id, postId)
                    return prevPosts.filter(post => post._id !== postId);
                }
                return prevPosts;
            });
        }
        
    } catch (error) {
        console.log('Error Deleting Post', error)
        if (typeof setError === 'function') {
            setError(error.message);
        }
    }
}