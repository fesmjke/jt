const express = require("express");
const pug = require("pug");
const config = require("../config");
const bodyParser = require("body-parser");
const models = require("../models");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const routs = require("../routes");

const app = express();

// Session settings
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      moongooseConnection: mongoose.connection,
      url: "mongodb://localhost:27017/WebSite"
    })
  })
);

// sets and uses

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// routers
app.use("/join", routs.auth);
app.use("/post", routs.post);

app.get("/", (req, res) => {
  const id = req.session.userId;
  const email = req.session.userLogin;
  var nk = "";
  models.User.findById(id)
    .then(user => {
      if (user) {
        nk = user.nickname;
        console.log("sended");
        res.render("index", {
          user: {
            id,
            email,
            nk
          }
        });
      } else {
        res.render("index", {});
      }
    })
    .catch(err => {
      console.log(err);
      res.render("index");
    });
});

app.get("/dev/c", (req, res) => {
  res.render("layout/carousel");
});

//catch errors
app.use((req, res, next) => {
  const err = new Error("Not found!");
  err.status = 404;
  next(err);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render("error", {
    message: error.message,
    status: error.status,
    error: !config.IS_PRODUCTION ? error : {}
  });
});

module.exports = app;
