const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

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
var secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret , encryptedFields: ['password'] });

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
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save((err) => {
    if (!err) {
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});

app.post('/login', (req, res) => {
username = req.body.username;
password = req.body.password;

  User.find({email: username}, (err, foundUser)=>{
    if (err) {
      console.log(err);
    }else{
      if (foundUser.password === password) {
          res.render('secrets');
      };
    };
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
