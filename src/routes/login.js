const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const jwt = require('jsonwebtoken'); // Add this import
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();
  
router.post('/register', async (req, res) => {
    const users = req.body; // Expecting an array of user objects

    // Validate input
    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: 'A list of users is required.' });
    }

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL,
           pass: process.env.APP_PASSWORD,
        },
       
        logger: true, // Logs to console
    debug: true,
    });
    console.log("EMAIL:", process.env.EMAIL);
    console.log("APP_PASSWORD:", process.env.APP_PASSWORD);
    // Collect errors for any invalid users
    const errors = [];
    const createdUsers = [];

    for (const user of users) {
        const { firstName, lastname, emailId, password, roleId,companyName,levelId } = user;

        // Validate required fields for each user
        if (!emailId || !password || !firstName || !lastname||!companyName) {
            errors.push({
                emailId,
                message: 'First name, last name, email, and password are required.',
            });
            continue;
        }

        try {
            // Check if the user already exists
            const existingUser = await User.findOne({ emailId });
            if (existingUser) {
                errors.push({
                    emailId,
                    message: 'User already exists.',
                });
                continue;
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({
                firstName,
                lastname,
                emailId,
                password: hashedPassword,
                roleId,
                companyName,
                levelId,
            });

            // Save the user to the database
            const savedUser = await newUser.save();
            createdUsers.push(savedUser);
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL, // Replace with your email
                    to: emailId,
                    subject: "Registration Successful",
                    text: `Dear ${firstName},\n\nYou have been successfully registered as an approver for ${companyName}.\n\nThank you!`,
                });
            } catch (emailError) {
                console.error(`Failed to send email to `, emailError);
                errors.push({
                    emailId,
                    message: "User registered but email notification failed.",
                });
            }
        } catch (err) {
            console.error(`Error creating user with email `, err);
            errors.push({
                emailId,
                message: 'Server error while creating the user.',
            });
        }
    }

    // Respond with the results
    if (errors.length > 0) {
        return res.status(207).json({
            message: 'Some users could not be registered.',
            createdUsers,
            errors,
        });
    }

    res.status(201).json({
        message: 'All users registered successfully.',
        createdUsers,
    });
});



// Login Route
router.post('/login', async (req, res) => {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        console.log('Checking for user...');
        const user = await User.findOne({ emailId });
        console.log('User found:', user);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
    
        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
    
        console.log('Generating JWT...');
        const token = jwt.sign({ _id: user._id }, 'Aahan@123', { expiresIn: '1h' });
    
        res.status(200).json({
            message: 'Login successful.',
            token,
            firstName: user.firstName,
            lastname: user.lastname,
            roleId: user.roleId,
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error' });
    }
    
});


// Get Users API
router.get('/getUsers', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude the password field for security
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/approve', async (req, res) => {
    const { emailId, comment } = req.body;

    if (!emailId || !comment) {
        return res.status(400).json({ message: 'User ID and comment are required.' });
    }

    try {
        const approver = await User.findOne({ emailId }); 
        if (!approver) {
            return res.status(404).json({ message: 'Approver not found.' });
        }

        const secondApprover = await User.findOne({
            companyName: approver.companyName,
            levelId: 1,
        });

        if (!secondApprover) {
            return res.status(404).json({ message: 'Second approver not found in the company.' });
        }

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        try {
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: secondApprover.emailId,
                subject: `Approval Notification for ${approver.companyName}`,
                text: `Dear ${secondApprover.firstName},\n\nUser ${approver.firstName} ${approver.lastname} has approved a comment: "${comment}".\n\nBest Regards,\nTeam`,
            });

            res.status(200).json({ message: 'Notification sent successfully to the second approver.' });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            res.status(500).json({ message: 'Approval successful, but failed to send notification.' });
        }
    } catch (err) {
        console.error('Error during approval process:', err);
        res.status(500).json({ message: 'Server error during approval process.' });
    }
});



module.exports = router;
