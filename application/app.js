const express = require("express");
const pug = require("pug");
const config = require("../config");
const bodyParser = require("body-parser");
const User = require("../models/user");

const app = express();

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/index", (req, res) => {
  res.render("index.pug");
});

app.get('/users',(req,res) => {
    User.find({}).then(users => {
        res.render('users',{users : users})
    });
});

app.post("/index", (req, res) => {
  const { firstName, lastName } = req.body;

  User.create({
    firstName,
    lastName
  }).then(user => console.log(user));

  res.redirect("index");
});

module.exports = app;
