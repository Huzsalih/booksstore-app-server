import express, { request, response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { user } from "../models/userModel.js";


const router = express.Router();

//Route for user signup
router.post('/signup', async (request,response) => {

    try {
        const { username, email, password } = request.body;

        //check if the username or email already registered

        const existingUser = await user.findOne({$or: [{ username }, { email }] });

        if (existingUser){
            return response.status(400).json({message: 'username or email already registered'});
        }

        //hash the password

        const hashPassword = await bcrypt.hash(password, 10);

        //create a new user
        const newUser = await user.create({
            username,
            email,
            password: hashPassword,
        });
        

        return response.status(201).json(newUser);
        
    } catch (error) {
        console.log(error.message);
        response.status(500).send({message: error.message });
        
    }
});

//route for login
router.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;

        const existingUser = await user.findOne({ username });

        if (!existingUser){
            return response.status(404).json({message: 'user not found'});
    } 

    //check if the password is correct

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if(!passwordMatch) {
        return response.status(401).json({message: 'Invalid password'}); 
    }

    //Generate JWT token with userID included

    const token = jwt.sign({ userId: existingUser._id, isLogged: true}, 'your secret key', {expiresIn: '1h'});

    return response.status(200).json({ token, username: user.username});

}catch (error) {

    console.log(error);
    response.status(500).send({message: error.message});  
}
});

export default router;