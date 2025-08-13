const express = require('express')
const authController = require('../controller/auth')
const { check } = require('express-validator');
const router = express.Router()

router.post('/signup', 
    check('email').isEmail().withMessage('Please Enter a Valid Email'),
    check('password').isLength({min: 6, max: 12}).withMessage('Password must be 6 characters long'),
    check('name').notEmpty().isLength({min: 5}).withMessage('Name is required'),
    authController.getSignUp);

router.post('/login', authController.getLogin);


module.exports = router;