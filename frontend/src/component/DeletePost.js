export const deletePostId = async (postId, setResult, setError) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setError('No authentication token found');
        return;
    }
    try {
        const res = await fetch(`${process.env.REACT_APP_API}/feed/post/${postId}`, {
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
        
        // Check if setResult is a function before calling it
        if (typeof setResult === 'function') {
            setResult(prevPosts => {
                // Also check if prevPosts is an array
                if (Array.isArray(prevPosts)) {
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