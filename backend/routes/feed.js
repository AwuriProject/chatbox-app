// const express = require('express')
// const { check, validationResult } = require('express-validator');
// const feedController = require('../controller/feed')
// const isAuth = require('../middleware/isAuth')
// const router = express.Router()

// router.get('/posts', isAuth, feedController.getFeed)

// router.post('/post', 
//     isAuth,
//     [
//         check('title').trim().isLength({min: 5}),
//         check('content').trim().isLength({min: 5})
//     ],
//      feedController.createPost)

// router.get('/post/:postId', isAuth, feedController.getPost)

// router.put('/post/:postId', 
//     isAuth, 
//     [
//         check('title').trim().isLength({min: 5}),
//         check('content').trim().isLength({min: 5})
//     ], 
//     feedController.updatePost
// )
// router.delete('/post/:postId', isAuth, feedController.deletePost)

// router.post('/post/:postId/comment', isAuth, feedController.commentPost)

// router.put('/post/:postId/like', isAuth, feedController.likePost);

// module.exports = router;


const express = require('express')
const { check, validationResult } = require('express-validator');
const feedController = require('../controller/feed')
const isAuth = require('../middleware/isAuth')
const router = express.Router()

router.get('/posts', isAuth, feedController.getFeed)

router.post('/post', 
    isAuth,
    [
        check('title').trim().isLength({min: 5}),
        check('content').trim().isLength({min: 5})
    ],
    feedController.createPost)

router.get('/post/:postId', isAuth, feedController.getPost)

router.put('/post/:postId', 
    isAuth, 
    [
        check('title').trim().isLength({min: 5}),
        check('content').trim().isLength({min: 5})
    ], 
    feedController.updatePost
)

router.delete('/post/:postId', isAuth, feedController.deletePost)

router.post('/post/:postId/comment', isAuth, feedController.commentPost)

router.put('/post/:postId/like', isAuth, feedController.likePost);


module.exports = router;