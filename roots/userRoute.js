const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');

const router = express.Router();

// Helper Function to Generate JWT
const generateToken = (userId) => {
    const payload={ id: userId }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};


// Middleware to Authenticate User
const authenticate = (req, res, next) => {

    console.log(req.headers.authorization)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded",decoded)
        req.userId = decoded.id; // Attach user ID to the request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};



// Signup Endpoint
router.post('/signup', async (req, res) => {
    const { username, password, fullname, email, age } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("hashedpassword", hashedPassword);

        // Save the user
        const newUser = new User({ username, password: hashedPassword, fullname, email, age });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Signin Endpoint
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = generateToken(user._id);
        console.log("token generated",token)

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Profile Endpoint (Protected)
router.get('/profile', authenticate, async (req, res) => {
    try {
        // Find the user based on the authenticated user ID
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
