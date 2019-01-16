const express = require("express");
const router = express.Router();
const models = require("../models");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Sharp = require("sharp");
const config = require("../config");
const mkdirp = require("mkdirp");
const diskStorage = require("../utils/diskstorage");

const rs = () =>
  Math.random()
    .toString(36)
    .slice(-3);

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = "/" + rs() + "/" + rs();
    req.dir = dir;
    mkdirp(config.DESTINATION + dir, err => cb(err, config.DESTINATION + dir));
  },
  filename: (req, file, cb) => {
    const userId = req.session.userId;
    const filename = Date.now().toString(36) + path.extname(file.originalname);
    const dir = req.dir;

    console.log("seach last post");

    const up = models.Image.create({
      owner: userId,
      path: dir + "/" + filename
    });
    cb(null, filename);
  },
  sharp: (req, file, cb) => {
    const resizer = Sharp()
      .resize(1024, 768, {
        fit: "inside",
        withoutEnlargement: true
      })
      .toFormat("jpg")
      .jpeg({
        quality: 40,
        progressive: true
      });
    cb(null, resizer);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("upload");
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      const err = new Error("Extention");
      err.code = "EXTENTION";
      return cb(err);
    } else {
      cb(null, true);
    }
  }
}).single("addImage");

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

// for add new post
router.post("/add", upload, (req, res) => {
  console.log(req.body);
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
      models.Image.findOne({})
        .sort({ _id: -1 })
        .limit(1)
        .then(image => {
          models.Post.create({
            title,
            tag,
            text,
            author: userId,
            image: image._id
          })
            .then(post => {
              console.log("pre upload");
              upload(req, res, err => {
                let error = "";
                if (err) {
                  if (err.code === "LIMIT_FILE_SIZE") {
                    error = "Image no more than 2mb";
                  }
                  if (err.code === "EXTENTION") {
                    error = "Only jpeg and png";
                  }
                }
              });
              console.log("After upload");
              models.User.findById(userId)
                .then(user => {
                  console.log("in user promise");
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
        });
    }
  }
  // const id = req.session.userId;
  // const email = req.session.userLogin;
});

// to get all posts
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
      models.Image.find({}).then(images =>{
        res.render("post/posts", {
          p: posts,
          user: {
            nk,
            userId
          },
          users,
          images
        });
      })
    });
  });
});

//to get current post
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
