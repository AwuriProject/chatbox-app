const express = require('express')
const authController = require('../controller/auth')
const router = express.Router()

router.post('/signup', authController.getSignUp);

router.post('/login', authController.getLogin);


module.exports = router;