require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');
//Serving static files
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));
//Connecting to MongoDB.
mongoose.connect('mongodb://localhost:27017/userDB');
//Defining Schema.
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
//Add encrypt.

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
    newUser.save((err) => {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });
});

app.post('/login', (req, res) => {
  username = req.body.username;
  password = req.body.password;

  User.find({email: username}, (err, foundUser) => {
    if (err) {
    } else {
      if (foundUser) {
        // Load hash from your password DB.
        bcrypt.compare(password, foundUser[0].password, function(err, result) {
          // result == true
          if (result == true) {
              res.render('secrets');
          }
        });
      };
    };
  });
});



app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
