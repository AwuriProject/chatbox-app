const express = require('express')
const authController = require('../controller/auth')
const isAuth = require('../middleware/isAuth')

const router = express.Router()

router.put('/signup',  authController.getSignUp);

router.post('/login', authController.getLogin);

module.exports = router