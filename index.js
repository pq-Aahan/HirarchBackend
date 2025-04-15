const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./src/config/database');
const registerRoute = require('./src/routes/login'); // Adjust path

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

// Use the register route
app.use('/api', registerRoute);


// Connect to MongoDB
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
