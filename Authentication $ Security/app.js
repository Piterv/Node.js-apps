const express = require('express');
const bodyParser =  require('body-parser');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');
//Serving static files
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))


app.get('/', (req, res)=>{
  res.render('home');
});


app.listen(3000, ()=>{
    console.log("Server started on port 3000.");
});
