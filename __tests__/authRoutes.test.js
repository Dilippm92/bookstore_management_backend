const request = require("supertest");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoURI = process.env.DATABASE_URL;
const jwt = require('jsonwebtoken');
// Import your auth route
const authRoute = require("../routes/authRoutes");


// Connect to your MongoDB for testing
beforeAll(async () => {
  await mongoose.connect(`${mongoURI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Disconnect from MongoDB after testing
afterAll(async () => {
  await mongoose.connection.close();
});
app.use(bodyParser.json()); // Use body-parser to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));
// Use your auth route in the app
app.use("/auth", authRoute);

describe("Registration Route", () => {
  beforeEach(async () => {
    // Clear the user collection in the database before each test
    await User.deleteMany({});
  });

  it("should register a new user successfully", async () => {
    const newUser = {
      username: "testuser",
      password: "testpassword",
      confirmpwd: "testpassword",
      phone: "1234567890",
    };

    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User registered successfully");

    // Check if the user was saved to the database
    const savedUser = await User.findOne({ username: "testuser" });
    expect(savedUser).not.toBeNull();
  });

  it("should return a 409 status code if the user already exists", async () => {
    // Create a user with the same username in the database
    const existingUser = new User({
      username: "existinguser",
      password: "existingpassword",
      phone: "9876543210",
    });
    await existingUser.save();

    const newUser = {
      username: "existinguser",
      password: "testpassword",
      confirmpwd: "testpassword",
      phone: "1234567890",
    };

    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("User already exists");
  });

  it("should return a 409 status code if the passwords do not match", async () => {
    const newUser = {
      username: "testusers",
      password: "testpassword",
      confirmpwd: "differentpassword",
      phone: "1234567890",
    };

    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Passwords do not match");
  });

  it("should return a 409 status code on server error", async () => {
    // Mock a server error by causing bcrypt to throw an error
    jest.spyOn(bcrypt, "hash").mockImplementation(() => {
      throw new Error("Mocked error");
    });

    const newUser = {
      username: "testuserss",
      password: "testpassword",
      confirmpwd: "testpassword",
      phone: "1234567890",
    };

    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Registration failed");
  });
});

