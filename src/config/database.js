const mongoose = require('mongoose');

const connectDB = async () => {
    console.log('connectDB function loaded');
    try {
        const conn = await mongoose.connect("mongodb+srv://pulastaahan:aahan1234@development.khm8a.mongodb.net/hirarc", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
