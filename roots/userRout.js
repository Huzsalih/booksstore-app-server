import express, { request, response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User  from "./User.js";
import nodemailer from "nodemailer";


import {JWT_SECRET,EMAIL,EMAIL_PASSWORD, port }from '../config.js'
const router = express.Router();

const generateToken = (userId) => {
    const payload={ id: userId }
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1h",
    });
};

const sendVerificationEmail = async (email, token) => {
    console.log(EMAIL,EMAIL_PASSWORD)
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or any other service
        auth: {
            user: EMAIL, 
            pass:EMAIL_PASSWORD
        },
    });

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="https://booksstore-app-client.vercel.app//user/verify?token=${token}">here</a> to verify your email.</p>`,
    };

    await transporter.sendMail(mailOptions);
};

//Route for user signup
router.post('/signup', async (request,response) => {

    try {
        const { username, email, password } = request.body;

        //check if the username or email already registered

        const existingUser = await User.findOne({$or: [{ username }, { email }] });

        if (existingUser){
            return response.status(400).json({message: 'username or email already registered'});
        }

        //hash the password

        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        //create a new user
        const newUser = await User.create({
            username,
            email,
            password: hashPassword,
            verificationToken,
            isEmailVerified: false
        });

        await newUser.save();
        await sendVerificationEmail(email, verificationToken);
        

        return response.status(201).json('User created! Check your email to verify your account.');
        
    } catch (error) {
        console.log(error.message);
        response.status(500).send({message: error.message });
        
    }
});

//route for login
router.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;

        const existingUser = await User.findOne({ username });

        if (!existingUser){
            return response.status(404).json({message: 'user not found'});
    } 

    if (!existingUser.isEmailVerified) {
        return response.status(403).json({ message: 'Please verify your email before logging in.' });
    }
    

    //check if the password is correct

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if(!passwordMatch) {
        return response.status(401).json({message: 'Invalid password'}); 
    }

    const token = generateToken(existingUser._id);
    
    //Generate JWT token with userID included

   
    return response.status(200).json({ token, username:existingUser.username});

}catch (error) {

    console.log(error);
    response.status(500).send({message: error.message});  
}
});

router.get('/verify', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email, verificationToken: token });

        if (!User) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.isEmailVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;