require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const findOrCreate = require('mongoose-find-or-create');

const app = express();

app.set('view engine', 'ejs');
//Serving static files
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());


//Connecting to MongoDB.
mongoose.connect('mongodb://localhost:27017/userDB');

//Defining Schema.
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: String,
  googleId: String,
  facebookId: String,
  secret: String
});
//Add plugin for Schema.
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, {
      id: user.id,
      username: user.username,
      name: user.displayName
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      username: profile.emails[0].value,
      googleId: profile.id
    }, function(err, foundUser) {
      return cb(err, foundUser);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/secrets'
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      facebookId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

app.get('/', (req, res) => {
  res.render('home');
});
//Google
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }));
app.get('/auth/google/secrets',
  passport.authenticate('google', {
    successRedirect: '/secrets',
    failureRedirect: '/login'
  }));
//Facebook
app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'user_location']
  }));
app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', {
    successRedirect: '/secrets',
    failureRedirect: '/login'
  }));
//Local
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get("/secrets", (req, res) => {
  User.find({
    "secret": {
      $ne: null
    }
  }, (err, foundUsers) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets", {
        userWithSecrets: foundUsers
      });
    }
  });
});
app.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.render("/");
});

app.post("/submit", (req, res) => {
  const submittedSecret = req.body.secret;

  User.findById(req.user.id, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(() => {
          res.redirect("/secrets");
        });
      }
    }
  });

});

app.post('/register', (req, res) => {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      res.render("/register");
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secrets");
    });
  });
});

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
