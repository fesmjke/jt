const express = require("express");
const pug = require("pug");
const config = require("../config");
const bodyParser = require("body-parser");
const User = require("../models/user");
const path = require("path")



const app = express();

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/index", (req, res) => {
  res.render("index.pug");
});

app.get('/users',(req,res) => {
    User.find({}).then(users => {
        res.render('users',{users : users})
    });
});

app.get('/dev/n',(req,res) => {
  res.render('layout/navigation');
});

app.get('/dev/c',(req,res) =>{
  res.render('layout/carousel');
});

app.get('/dev/l',(req,res) =>{
  res.render('singIN');
});

app.get('/dev/r',(req,res) =>{
  res.render('singUP');
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
