const express = require("express");
const pug = require("pug");
const config = require("../config");
const bodyParser = require("body-parser");
const User = require("../models/user");
const path = require("path");

const app = express();


// sets and uses

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// routers
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/dev/c", (req, res) => {
  res.render("layout/carousel");
});

app.get("/l", (req, res) => {
  res.render("singIN");
});

app.get("/r", (req, res) => {
  res.render("singUP");
});

//catch errors
app.use((req,res,next)=>{
  const err = new Error('Not found!');
  err.status = 404;
  next(err);
});

app.use((error,req,res,next) =>{
  res.status(error.status  || 500)
  res.render('error',{
    message: error.message,
    status: error.status,
    error: !config.IS_PRODUCTION ? error : {},
  });
});


module.exports = app;
