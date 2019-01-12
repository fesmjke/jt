const express = require("express");
const pug = require("pug");
const config = require("../config");
const bodyParser = require("body-parser");
const models = require("../models");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const session = require("express-session");
const mongoose = require("mongoose")
const MongoStore = require("connect-mongo")(session);

const app = express();

// Session settings
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      moongooseConnection: mongoose.connection,
      url: 'mongodb://localhost:27017/WebSite'
    })
  })
);

// sets and uses

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// routers
app.get("/", (req, res) => {
  const id = req.session.userId;
  const email = req.session.userLogin;
  var name = "";
  models.User.findById(id).then(user => {
    
    if(user){
    console.log(user);
    name = user.firstName;
    console.log("sended");
    res.render("index",{user:{
      id,
      email,
      name
    }});
    }else{
      res.render("index",{});
    }
  }).catch(err => {
    console.log(err);
    res.render("index");
  });
});

app.get("/dev/c", (req, res) => {
  res.render("layout/carousel");
});

app.get("/login", (req, res) => {
  res.render("singIN");
});

app.get("/registration", (req, res) => {
  res.render("singUP");
});

app.post("/registration", (req, res) => {
  let u = req.body;
  const login = req.body.upEmail;
  const pass = req.body.upPassword;
  if (u.upPassword !== u.upConfirmPassword) {
    res.render("singUP", {
      st: false,
      error: "Passwords do not match!"
    });
  } else if (u.upPassword.length < 6) {
    res.render("SingUP", {
      st: false,
      error: "Make sure it's at least 6 characters"
    });
  } else if (u.upEmail.length < 9 || u.upEmail.length > 20) {
    res.render("singUP", {
      st: false,
      error: "Login length is from 9 to 20 characters!"
    });
  } else if (
    !/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(
      u.upEmail
    )
  ) {
    res.render("singUP", {
      st: false,
      error: "Email may only contain alphanumeric characters"
    });
  } else {
    models.User.findOne({
      email: login
    }).then(user => {
      if (!user) {
        bcrypt.hash(pass, null, null, (err, hash) => {
          models.User.create({
            email: login,
            password: hash,
            firstName: u.upFirstName,
            lastName: u.upLastName
          })
            .then(user => {
              console.log(user);
              res.render("singUP", {
                st: true
              });
            })
            .catch(err => {
              console.log(err);
              res.render("singUP", {
                st: false,
                error: "Error,try again later"
              });
            });
        });
      } else {
        res.render("singUP", {
          st: false,
          error: "email already exists"
        });
      }
    });
  }
});

app.post("/login", (req, res) => {
  let u = req.body;
  const login = req.body.inEmail;
  const pass = req.body.inPassword;
  if (u.inPassword.length < 6) {
    res.render("singIN", {
      st: false,
      error: "Make sure password at least 6 characters"
    });
  } else if (u.inEmail.length < 9) {
    res.render("singIN", {
      st: false,
      error: "Login length is less then 9 characters!"
    });
  } else if (
    !/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(
      u.inEmail
    )
  ) {
    res.render("singIN", {
      st: false,
      error: "Email may only contain alphanumeric characters"
    });
  } else {
    models.User.findOne({
      email: login
    })
      .then(user => {
        if (!user) {
          res.render("singIN", {
            st: false,
            error: "Password and Email is incorrect"
          });
        } else {
          bcrypt.compare(pass, user.password, (err, result) => {
            if (!result) {
              res.render("singIN", {
                st: false,
                error: "Password and Email is incorrect"
              });
            } else {
              req.session.userId = user.id;
              req.session.userLogin = user.email;
              res.redirect("/");
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.render("singIN", {
          st: false,
          error: "Error,try again later"
        });
      });
  }
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
