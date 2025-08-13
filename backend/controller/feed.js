const fs = require('fs')
const path = require('path')
const Post = require('../models/feed')
const User = require('../models/user')
const { check, validationResult } = require('express-validator');


exports.getFeed = async (req, res, next) => {
    try {
         const userId = req.userId;
        const posts = await Post.find()
            .populate('creator', 'name profileImageUrl')
            .sort({ createdAt: -1 });
            
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            id: post._id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            creator: {
                name: post.creator.name,
                profileImageUrl: post.creator.profileImageUrl 
            },
            createdAt: post.createdAt,
            comments: post.comments || [],
            commentsCount: post.comments ? post.comments.length : 0,
             liked: post.likes ? post.likes.includes(userId) : false,
            likesCount: post.likes ? post.likes.length : 0
        }));
        
        res.status(200).json({
            message: 'Fetched posts successfully.', 
            posts: formattedPosts 
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({
            message: 'Failed to fetch posts',
            error: err.message
        });
    }
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).json({message: 'Validation failed, entered data is incorrect!', 
            errors: errors.array()})
    }
    try {
        // const imageUrl = req.file ? `http://localhost:8000/${req.file.path.replace(/\\/g, '/')}` : null;
        const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : null;
        const { title, content } = req.body;

        // Validation
        if (!title && !content && !imageUrl) {
            console.log('❌ Validation failed: No title, content or image uploaded');
            return res.status(422).json({
                message: 'imcomplete post',
                received: { title, content, hasImage: !!req.file }
            });
        }
         
        const post = new Post({
            title: title || '',
            content: content || '',
            imageUrl: imageUrl,
            creator: req.userId,
        });
        const result = await post.save();
        const user = await User.findById(req.userId)
        user.posts.push(post)
        user.save()
        res.status(201).json({
            message: 'Post created successfully',
            post: {
                _id: result._id,
                id: result._id,
                title: result.title,
                content: result.content,
                imageUrl: result.imageUrl,
                creator: {_id: user._id, name: user.name}
            }
        });
    } catch (error) {
        console.error('❌ Unexpected error in createPost:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId)
        if(!post){
            const error = new Error('Could not find post')
            error.statusCode = 404
            throw error
        }
        res.status(200).json({message: 'Post fetch', post: post})
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500
        }
        next()
    }
}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect!', 
            errors: errors.array()
        });
    }
    
    try {
        const title = req.body.title;
        const content = req.body.content;
        
        // Find the existing post first
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error;
        }

        let imageUrl = post.imageUrl;

        if (req.file) {
            imageUrl = req.file.path.replace(/\\/g, '/'); 
            if (post.imageUrl && post.imageUrl !== imageUrl) {
                clearImage(post.imageUrl);
            }
        }
        
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        
        const postUpdated = await post.save();
        
        res.status(200).json({
            message: 'Post updated', 
            post: postUpdated  
        });
        
    } catch (error) {
        console.error('Error updating post:', error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    
    try {
        
        const post = await Post.findById(postId);
        
        if (!post) {
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error;
        }
        
        
        const imageUrl = post.imageUrl;

        await Post.findByIdAndDelete(postId);
        
        // Clear the image file if it exists
        if (imageUrl) {
            clearImage(imageUrl);
        }
        
        res.status(200).json({
            message: 'Post Deleted Successfully'
        });
        
    } catch (error) {
        console.error('Error deleting post:', error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.commentPost = async (req, res, next) => {
    const postId = req.params.postId;
    const { text } = req.body; // Extract text from request body
    
    try {
        // Validate input - handle different data types
        if (!text || typeof text !== 'string' || text.trim() === '') {
            const error = new Error('Comment text is required and must be a string');
            error.statusCode = 400;
            throw error;
        }

        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error;
        }

       const newComment = { 
            text: text.trim(), 
            creator: req.userId, 
            createdAt: new Date() 
        };
        post.comments.push(newComment);
        const savedPost = await post.save();

        // Get the newly added comment (last one in the array)
        const addedComment = savedPost.comments[savedPost.comments.length - 1];

        res.status(201).json({
            message: 'Successfully commented',
            comment: addedComment // Return the new comment data
        });
    } catch (error) {
        console.error('Error commenting on post:', error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.likePost = async (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.userId; 
    
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user already liked the post
        const likedIndex = post.likes.indexOf(userId);
        let liked = false;
        
        if (likedIndex === -1) {
            // User hasn't liked the post, so add like
            post.likes.push(userId);
            liked = true;
        } else {
            // User already liked the post, so remove like (unlike)
            post.likes.splice(likedIndex, 1);
            liked = false;
        }
        
        const savedPost = await post.save();
        
        res.status(200).json({
            message: liked ? 'Post liked successfully' : 'Post unliked successfully',
            liked: liked,
            likesCount: savedPost.likes.length
        });
    } catch (error) {
        console.error('Error liking/unliking post:', error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


const clearImage = (filePath) => {
    let cleanPath = filePath;
    
    // Remove the HTTP URL part if it exists
    if (filePath && filePath.startsWith('http://localhost:8000/')) {
        cleanPath = filePath.replace('http://localhost:8000/', '');
    }
    
    const fullPath = path.join(__dirname, '..', cleanPath);
    
    fs.unlink(fullPath, err => {
        err? console.log("Fail to delete", err) : console.log("Delete successfull")
    });
}