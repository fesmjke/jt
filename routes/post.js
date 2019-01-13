const express = require("express");
const router = express.Router();
const models = require("../models");

// Get for add new post
router.get("/add", (req, res) => {
  const id = req.session.userId;
  const email = req.session.userLogin;
  var name = "";
  models.User.findById(id)
    .then(user => {
      if (user) {
        name = user.firstName;
        console.log("sended post");
        res.render("post/add", {
          user: {
            id,
            email,
            name
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
});

router.post("/add", (req, res) => {
  console.log(req.body);
});

module.exports = router;
