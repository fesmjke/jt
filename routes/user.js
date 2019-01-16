const express = require("express");
const router = express.Router();
const models = require("../models");

router.get("/", (req, res) => {
  const userId = req.session.userId;
  const userEmail = req.session.userLogin;
  let userToSend = null;
  let postsToSend = null;
  if (!userId || !userEmail) {
    res.redirect("/");
  } else {
    models.User.findById(userId)
      .then(user => {
        if (user) {
          userToSend = user;
          models.Post.find({})
            .then(posts => {
              postsToSend = posts;
              models.Image.find({})
                .then(images => {
                  res.render("user/profile", {
                    p: postsToSend,
                    userToSend,
                    user: {
                      nk: user.nickname,
                      id: userId
                    },
                    images
                  });
                })
                .catch(err => {
                  onsole.error("file:user.js find images/" + err);
                });
            })
            .catch(err => {
              console.error("file:user.js find posts/" + err);
            });
        } else {
          res.redirect("/");
        }
      })
      .catch(err => {
        console.error("file:user.js find user by id" + err);
        res.redirect("/");
      });
  }
});

module.exports = router;
