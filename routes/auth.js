const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt-nodejs");
const models = require("../models");

// Registration router

router.get("/registration", (req, res) => {
  res.render("singUP");
});

router.post("/registration", (req, res) => {
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
  } else if (u.upNickName.length < 2) {
    res.render("singUP", {
      st: false,
      error: "Nickname length is minimum 2 characters!"
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
            nickname: u.upNickName,
            firstName: u.upFirstName,
            lastName: u.upLastName
          })
            .then(user => {
              res.render("singUP", {
                st: true
              });
            })
            .catch(err => {
              console.error(err);
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

// Login router

router.get("/login", (req, res) => {
  res.render("SingIN");
});

router.post("/login", (req, res) => {
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
        console.error(err);
        res.render("singIN", {
          st: false,
          error: "Error,try again later"
        });
      });
  }
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      req.session = null;
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
