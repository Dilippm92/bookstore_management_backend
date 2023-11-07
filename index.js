const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require('./routes/authRoutes');
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const path = require('path');
const mongoURI = process.env.DATABASE_URL;
// Parse JSON and URL-encoded data with body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from a public directory using express.static
app.use(express.static(path.join(__dirname, 'public')));
//cors connections
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,  
}));
//Routes conenctions
app.use('/auth', authRoutes);
// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
