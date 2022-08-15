//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({  extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://sumeet27:kulkarnisumeet@cluster0.xyy6qg7.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const book = new Item({
  name: "Welcome to your todolist!"
});

const car = new Item({
  name: "Hit the + button to add a new item."
});

const food = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [book, car, food];

const listSchema = {
  name:String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

//
var date=new Date();
var options ={
  weekday:"long",
  day:"numeric",
  month:"long"
};
var days=date.toLocaleString("en-us",options);
//
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
        res.redirect("/");
      });
    }
     else {
      res.render("list", {listTitle: days,newListItems: foundItems});
    }
  });
});

app.get("/:customListName",function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("List",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  });


});

app.post("/", function(req, res) {

  var date=new Date();
  var options ={
    weekday:"long",
    day:"numeric",
    month:"long"
  };
  var days=date.toLocaleString("en-us",options);

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === days){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }


});

app.post("/delete", function(req, res) {

  var date=new Date();
  var options ={
    weekday:"long",
    day:"numeric",
    month:"long"
  };
  var days=date.toLocaleString("en-us",options);

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName===days){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully deleted");
      res.redirect("/");
    }
    });
  }
  else
{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
