require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');

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
  email: String,
  password: String
});
//Add plugin for Schema.
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); //creates cookies
passport.deserializeUser(User.deserializeUser()); //cramble cookies


app.get('/', (req, res) => {
  res.render('home');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});
app.get("/logout", (req, res)=>{
  req.logout();
  res.render("/");
});

app.post('/register', (req, res) => {

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.render("/register");
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secrets");
    });
  });
});

app.post('/login', (req, res) => {
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
      res.redirect("/login");
    }else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }

  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
