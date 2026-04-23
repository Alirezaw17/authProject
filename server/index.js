const express = require('express');
const cors = require('cors');
const session = require("express-session");

const passport = require("passport");
const LocalStrategy = require("passport-local")

const dao = require("./dao.js");


const corsOption = {
    origin: "http://localhost:5173",  // ← string, not array, when using credentials
    credentials: true                 // ← MUST add this
};

const app = express();
app.use(express.json()); // becasue we translate the text to json coming from
app.use(cors(corsOption));

// use session with generation in terminal:
app.use(session({
  secret: '415f114dd377f51f8ed583650fab14fbd012a219c3e5fdf09817b1f039a8083d4651e07401aafbbb47d50809cd98998f646531c19841eeb90d8c1bd52d02cac7',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.authenticate('session'));



//Passport setup

const isLoggin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};


passport.use(new LocalStrategy(
  { usernameField: 'email' }, //////////////
  async (email, password, callback) => {
    const user = await dao.loginUser(email, password);
    if (!user) return callback(null, false, 'Incorrect email or password');
    return callback(null, user);
  }
));

passport.serializeUser(function (user, callback) {
    return callback(null, user);
});

passport.deserializeUser(function (user, callback) {
    return callback(null, user);
});


// Register route

app.post('/register', async (req, res) => {
  console.log('Body received:', req.body); // ← ADD THIS
  const { username, email, password } = req.body;
  console.log('username:', username);      // ← ADD THIS
  console.log('email:', email);            // ← ADD THIS  
  console.log('password:', password);      // ← ADD THIS
  try {
    const user = await dao.registerUser(username, email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// loggin route
app.post("/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info });
        req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
    });



// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));