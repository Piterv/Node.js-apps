const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//Connects to mongoDB through Mongoose

mongoose.connect('mongodb://localhost:27017/todolistDB').
catch(error => handleError(error));

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the +  button to add a new item"
});
const item3 = new Item({
  name: "<-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

//Mongoose schema for dynamic routes
const listShema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listShema);

//Process Get route
app.get("/", function(req, res) {

  const items = Item.find({}, (err, founditem) => {
    if (err) {
      console.log(err);
    } else if (founditem.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("items successfuly saved to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: founditem
      });
    }
  });
});

//Process Dynamic routes.
app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  // Sheck if the list exist.
  List.findOne({
    name: customListName
  }, (err, foundList) => {

    if (!err) {
      if (!foundList) {
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post("/", (req, res) => {

  const listName = req.body.list
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {

    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.ListTitle;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err){
        console.log("Item successfully deleted");
      }
    });
    res.redirect("/");
  }else {
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, (err, foundList)=>{
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
