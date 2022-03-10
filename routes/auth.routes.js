const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

const generateToken = (user) => {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "6h",
  });
  
  return authToken;
}

router.get("/loggedin", (req, res) => {
  res.json(req.user);
});

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name) {
    return res.status(400).json({ errorMessage: "Please provide your name." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).json( {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }


  User.findOne({ email }).then((found) => {
    if (found) {
      return res
        .status(400)
        .json({ errorMessage: "Email address already exist." });
    }

    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          name,
          email,
          password: hashedPassword,
        });
      })
      .then((user) => {
        const authToken = generateToken(user);
        return res.json({ authToken: authToken });
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).json({ errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).json({
            errorMessage:
              "Email address need to be unique. The email address you chose is already in use.",
          });
        }
        return res.status(500).json({ errorMessage: error.message });
      });
  });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Please provide a valid email address." });
    return;
  }

  if (password.length < 8) {
    return res.status(400).json({
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ errorMessage: "Wrong credentials." });
      }

      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).json({ errorMessage: "Wrong credentials." });
        }

        const authToken = generateToken(user);

        return res.json({ authToken: authToken });
      });
    })
    .catch((err) => {
      next(err);
      return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.get("/verify", isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload);
  res.status(200).json(req.payload);
});

module.exports = router;
