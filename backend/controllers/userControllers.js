const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const generateToken = require("../config/generateToken");

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase();

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user");
  }
});

// Login User
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Normalize email
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//Searching for the User
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
