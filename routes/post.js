const express = require("express");
const router = express.Router();
const models = require("../models");
const mongoose = require("mongoose");
// Get for add new post
router.get("/add", (req, res) => {
  const userId = req.session.userId;
  const userEmail = req.session.userLogin;
  let nk = "";
  if (!userId || !userEmail) {
    res.redirect("/");
  } else {
    models.User.findById(userId)
      .then(user => {
        if (user) {
          nk = user.nickname;
          res.render("post/add", {
            user: {
              userId,
              nk
            }
          });
        } else {
          res.render("post/add", {});
        }
      })
      .catch(err => {
        console.log(err);
        res.render("post/add");
      });
  }
});

router.post("/add", (req, res) => {
  const userId = req.session.userId;
  const userEmail = req.session.userLogin;
  const title = req.body.addTitle.trim().replace(/ +(?= )/g, "");
  const tag = req.body.addTag;
  const text = req.body.addText;

  if (!userId || !userEmail) {
    res.redirect("/");
  } else {
    if (title.length < 10 || title.length > 100) {
      res.render("post/add", {
        st: false,
        error: "Title length is from 10 to 50 characters!"
      });
    } else if (tag.length < 6 || tag.length > 20) {
      res.render("post/add", {
        st: false,
        error: "Tag length is from 6 to 20 characters!"
      });
    } else if (text.length < 20) {
      res.render("post/add", {
        st: false,
        error: "Post text is too short,minimum 20 characters"
      });
    } else {
      models.Post.create({
        title,
        tag,
        text,
        author: userId
      })
        .then(post => {
          models.User.findById(userId)
            .then(user => {
              let nk = user.nickname;
              res.render("post/add", {
                user: {
                  userId,
                  nk
                },
                st: true
              });
            })
            .catch(err => {
              console.error(err);
              res.render("post/add", {
                st: false,
                error: "Error,try again later"
              });
            });
        })
        .catch(err => {
          console.error(err);
          res.render("post/add", {
            st: false,
            error: "Error,try again later"
          });
        });
    }
  }
  // const id = req.session.userId;
  // const email = req.session.userLogin;
});

router.get("/posts", (req, res) => {
  const userId = req.session.userId;
  const userEmail = req.session.userLogin;
  let nk = "";
  let postAuthor = "";
  models.User.findById(userId).then(user => {
    nk = user.nickname;
  });

  models.Post.find({}).then(posts => {
    models.User.find({}).then(users => {
      res.render("post/posts", {
        p: posts,
        user: {
          nk,
          userId
        },
        users
      });
    });
  });
});

router.get("/cpost/:post", (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, "");
  const userId = req.session.userId;
  const userEmail = req.session.userLogin;
  let nk = "";

  models.User.findById(userId).then(user => {
    nk = user.nickname;
  });

  if (!url) {
    const err = new Error("Not found!");
    err.status = 404;
    next(err);
  } else {
    models.Post.findOne({
      url
    }).then(post => {
      if (!post) {
        const err = new Error("Not found!");
        err.status = 404;
        next(err);
      } else {
        if (userId || userEmail) {
          res.render("post/postC", {
            p: post,
            user: { id: userId, nk }
          });
        } else {
          res.redirect("/");
        }
      }
    });
  }
});

module.exports = router;
