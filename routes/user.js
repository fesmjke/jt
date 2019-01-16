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
          models.Post.find({}).then(posts => {
            postsToSend = posts;
            models.Image.find({}).then(images =>{
              res.render("user/profile", {
                p:postsToSend,
                userToSend,
                user: {
                  nk: user.nickname,
                  id: userId
                },
                images
              })
            });
          });
          
        } else {
          res.redirect("/");
        }
      })
      .catch(err => {
        console.log(err);
        res.redirect("/");
      })
      .catch(err => {
        console.log(err);
        res.redirect("/");
      });
  }
});

module.exports = router;
