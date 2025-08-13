const express = require('express')
const authController = require('../controller/auth')
const { check } = require('express-validator');
const router = express.Router()

router.post('/signup', 
    check('email').isEmail(),
    authController.getSignUp);

router.post('/login', authController.getLogin);


module.exports = router;