const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

let port = process.env.PORT;

let options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
let today = new Date();
let day = today.toLocaleDateString("hi-IN", options);

let newItems = ["Buy food", "Cook food", "Eat food"];
let workItems = [];
app.get("/", function(req, res) {
    res.render("index", {listTitle: day, newListItems: newItems});
});

app.get("/work", (req, res) => {
   res.render("index", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.post("/", (req, res) => {
    if(req.body.button === "Work"){
        workItems.push(req.body.item);
        res.redirect("/work");
    } else {
        newItems.push(req.body.item);
        res.redirect("/");
    }    
});

app.listen(port || 3000, function() {
    console.log("Server started on port " + port);
});