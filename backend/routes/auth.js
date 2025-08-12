// const express = require('express')
// const authController = require('../controller/auth')
// const router = express.Router()

// router.put('/signup',  authController.getSignUp);

// router.post('/login', authController.getLogin);
// console.log(authController)

// module.exports = router;

const express = require('express')
const authController = require('../controller/auth')
const router = express.Router()

router.post('/signup', authController.getSignUp);

router.post('/login', authController.getLogin);

// Export should be at the end
module.exports = router;