const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Console } = require('console');


const app = express();

// connect to MongoDB //
mongoose.connect('mongodb://localhost:27017/userSecretDB').
    catch(error => handleError(error));

//Defining a Model through the Schema interface.

const userSchema = new mongoose.Schema({
    website: String,
    login: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
// Serving static files in Express.
app.use(express.static('public'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())



// handle get routes. //
app.get('/', function (req, res) {
    res.render('home', { foo: 'FOO' });
});

app.get('/login', function (req, res) {
    res.render('login', { foo: 'FOO' });
});

app.get('/register', function (req, res) {
    res.render('register', { foo: 'FOO' });
});

app.get('/secrets', function (req, res) {

    User.find({}, (err, data) => {
        if (!err) {
            // console.log(data);
            res.render('secrets', { items: data });
        }
    });
});

app.get('/submit', function (req, res) {
    res.render('submit', { foo: 'FOO' });
});


// Handle post routes. //
app.post('/submit', (req, res) => {
    const [website, login, password] = req.body.secret;

    const userData = new User({
        website: website,
        login: login,
        password: password
    })

    userData.save((err) => {
        if (!err) {
            res.redirect("/secrets");
        }
    });

});

app.post("/edit", (req, res) => {

    itemEdit = req.body.itemEdit;

    User.findById(itemEdit, (err, foundItem)=>{
        console.log(foundItem);
        if (!err) {
            res.render("edit", { item: foundItem})
        }
    });
});

app.post("/delete", (req, res) => {

    itemDelete = req.body.itemDelete;

    User.findByIdAndRemove(itemDelete, (err) => {
        if (!err) {
            console.log("Item succesfully deleted");
        }
        res.redirect("/secrets");
    });

});

app.post("/update", (req, res)=>{
    console.log(req.body);

    itemId = req.body.itemId;

    const [website, login, password] = req.body.edit;

    User.findOneAndUpdate({_id: itemId}, {website: website, login: login, password: password}, (err)=>{
        if (!err) {
            res.redirect("/secrets")
        }
    });
});

app.listen(3000, function () {
    console.log('App listening on port 3000 !');
});