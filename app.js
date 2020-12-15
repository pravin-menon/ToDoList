const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let port = process.env.PORT;

mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Welcome to your todolist!"});
const item2 = new Item({name: "Hit the + button to add a new item."});
const item3 = new Item({name: "<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];

const customListSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", customListSchema);


app.get("/", function(req, res) {
    Item.find({}, (error, foundItems) => {
        if(!error) {
            if(foundItems.length === 0) {
                Item.insertMany(defaultItems, (err) => {
                    if(err){
                        console.log(err);
                    } else {
                        console.log("Successfully saved default items.");
                    }
                });
                res.redirect("/");
            } else {
                res.render("index", {listTitle: "Personal", newListItems: foundItems});
            }
        } else {
            console.log(error);
        }
    });
    
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName}, (err, foundList) => {
        if (!err) {
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("index", {listTitle: foundList.name, newListItems: foundList.items});
            }
        } else {
            console.log(err);
        }
    });
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.post("/", (req, res) => {
    const newItem = new Item({name: req.body.item});
    const listName = req.body.button;
    console.log(newItem + ", " + listName);

    if(listName === "Personal") {
        newItem.save();
        res.redirect("/"); 
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            console.log(foundList);
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
});

app.post("/delete", (req, res) => {
    const listName = req.body.listName;
    const checkedItemId = req.body.checkbox;

    if(listName === "Personal") {
        Item.findOneAndDelete({_id: checkedItemId}, (err) => {
            if(err) {
                console.log(err);
            } else {
                res.redirect("/");
                console.log("Successfully deleted item.");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
            if(!err) {
                res.redirect("/" + listName);
            }
            
        });
    }
    
});

app.listen(port || 3000, function() {
    console.log("Server started on port " + port);
});