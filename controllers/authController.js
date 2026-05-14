const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// 1. REGISTER WALA KAAM (Ab password lock hoke save hoga)
const registerUser = async (req, res) => {
    try {
        const { name, email, password, location } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Bhai, yeh email pehle se registered hai!" });
        }
        
        // 👇 Password ko lock (hash) karne ka code
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 👇 Lock kiya hua password (hashedPassword) database mein save kar rahe hain
        const user = await User.create({ name, email, password: hashedPassword, location });
        
        res.status(201).json({ message: "User successfully register ho gaya!" });
    } catch (error) {
        res.status(500).json({ message: "Kuch gadbad ho gayi", error: error.message });
    }
};

// 2. LOGIN WALA KAAM
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Bhai, is email se koi account nahi hai!" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password galat hai bhai!" });
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.status(200).json({ message: "Login successful!", token: token });
    } catch (error) {
        res.status(500).json({ message: "Kuch gadbad ho gayi", error: error.message });
    }
};

// 3. VIP ROOM WALA KAAM
const getUserProfile = async (req, res) => {
    res.status(200).json({ 
        message: "VIP Area mein swagat hai bhai!", 
        tumhari_id: req.user.id 
    });
};

module.exports = { registerUser, loginUser, getUserProfile };