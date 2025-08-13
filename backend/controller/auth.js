const express = require('express')
const { validationResult } = require('express-validator');
require("dotenv").config();
const User = require('../models/user')
const bcrypt = require('bcryptjs');
const jwtoken = require('jsonwebtoken')


exports.getSignUp = async (req, res, next) =>{
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect!', 
            errorMessage: errors.array()
        });
    }
    res.json({ success: true, message: 'User created successfully' });
    try {
        const result = await bcrypt.hash(password, 12)
        const user = new User({
            email: email,
            password: result,
            name: name
        })
        const userRes = await user.save()
        res.status(201).json({
            message: 'User created successfully',
            userId: userRes._id 
        })
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500
        }
        next()
    }  
}

exports.getLogin = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findOne({email: email})
        if(!user){
            const error = new Error(`A user with this email not found!`)
            error.statusCode = 401
            throw error
        }
        const userPassword = await bcrypt.compare(password, user.password)
        if(!userPassword){
            const error = new Error(`Wrong password`)
            error.statusCode = 401
            throw error
        }
        const token = jwtoken.sign(
            {
                email: user.email, 
                userId: user._id.toString()}, 
                'suspicious', 
                {expiresIn: '1h'
            })
        res.status(200).json({
            message: 'Login successful',
            token: token,
            userId: user._id.toString()
        })
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500
        }
        next()
    }
}