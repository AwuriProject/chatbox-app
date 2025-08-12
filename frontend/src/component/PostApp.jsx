import React, { useState, useEffect } from 'react'

const PostApp = (props) => {
    const [feed, setFeed] = useState({title: '', content: '', image: null})
    const [imagePreview, setImagePreview] = useState(null)

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(!file){
            setImagePreview(null);
            setFeed(prev => ({
                ...prev,
                image: null
            }));
            return;
        }
        
        // Create a preview URL for the selected image
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        setFeed(prev => ({
            ...prev,
            image: file
        }));
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFeed((prevNote) => {
            return {
                ...prevNote,
                [name]: value
            }
        })
    }
  
    const submitPost = (e) => {
        e.preventDefault();
        props.onAdd(feed);
        
        // Clean up the preview URL to prevent memory leaks
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        
        setFeed({
            title: "",
            content: "",
            image: null
        });
    }

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div>
            <div className='max-w-2xl mx-auto px-4 py-6'>
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-6'>
                    <div className='p-4'>
                        <div className='flex items-start gap-2.5'>
                            {imagePreview ? (
                                <img 
                                    src={imagePreview} 
                                    alt="Selected image preview" 
                                    className='w-10 h-10 rounded-full object-cover'
                                />
                            ) : (
                                <div className='w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center'>
                                    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="#666">
                                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                        <g id="SVGRepo_iconCarrier"> <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> 
                                        </g>
                                    </svg>
                                </div>
                            )}
                            <div className='flex-1'>
                                <input 
                                    type="text" 
                                    name='title' 
                                    id='title' 
                                    value={feed.title} 
                                    onChange={handleChange}
                                    placeholder="Post title..."
                                    className="w-full border-none outline-none text-gray-900 placeholder-gray-500 text-lg font-semibold mb-2"
                                />
                                <textarea 
                                    name='content'
                                    id='content'
                                    value={feed.content}
                                    placeholder="What's on your mind?" 
                                    className="w-full resize-none border-none outline-none text-gray-900 placeholder-gray-500 text-lg" 
                                    rows="3"
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                        {imagePreview && (
                            <div className='mt-4 relative'>
                                <img 
                                    src={imagePreview} 
                                    alt="Post image preview" 
                                    className='w-full max-h-64 object-cover rounded-lg'
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        URL.revokeObjectURL(imagePreview);
                                        setImagePreview(null);
                                        setFeed(prev => ({ ...prev, image: null }));
                                    }}
                                    className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer'
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        
                        <div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-100 gap-2.5'>
                            <div>
                                <label className='flex items-center gap-1.5 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors'>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    <span className='text-sm font-medium'>Photo</span>
                                    <input type="file" className='hidden' accept='image/*' onChange={handleImageChange}/>
                                </label>
                            </div>
                            <button 
                                onClick={submitPost}
                                disabled={!feed.title.trim() || !feed.content.trim()}
                                className='flex items-center gap-1.5 bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-medium transition-colors hover:bg-blue-700 cursor-pointer'
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                                <span>Post</span>
                            </button>
                        </div>
                    </div>   
                </div>
            </div> 
        </div>
    )
}

export default PostApp