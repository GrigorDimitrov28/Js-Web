const router = require("express").Router();
const { getUserStatus, authAccess } = require("../controllers/user");
const {
  deletePlay,
  postPlay,
  getPlay,
  editPlay,
  likePlay,
} = require("../controllers/play");
const Play = require("../models/play");

router.get("/play/create", authAccess, getUserStatus, (req, res) => {
  res.render("create-theater", {
    title: "Add play",
    isLoggedIn: req.isLoggedIn,
  });
});

router.get("/details/:id", authAccess, getUserStatus, async (req, res) => {
  const theater = await getPlay(req, res);
  const theaterTitle = theater.title;
  const id = theater._id;

  const userIsCreator = theater.creator == req.id ? true : false;
  const playIsLiked = theater.usersLiked.includes(req.id) ? true : false;

  const { description, imageUrl } = theater;
  res.render("theater-details", {
    title: "Theater details",
    isLoggedIn: req.isLoggedIn,
    theaterTitle,
    description,
    imageUrl,
    id,
    userIsCreator,
    playIsLiked,
  });
});

router.get("/delete/:id", authAccess, getUserStatus, async (req, res) => {
  await deletePlay(req, res);
  res.redirect("/");
});

router.get("/edit/:id", authAccess, getUserStatus, async (req, res) => {
  const play = await Play.findById(req.params.id);
  if (req.id == play.creator) {
    res.render("edit-theater", {
      title: "Edit",
      id: req.params.id,
      isLoggedIn: req.isLoggedIn,
    });
  } else {
    res.redirect("/");
  }
});

router.get("/like/:id", authAccess, getUserStatus, async (req, res) => {
  await likePlay(req, res);

  res.redirect(`/details/${req.params.id}`);
});

router.post("/play/create", getUserStatus, async (req, res) => {
  const { error } = await postPlay(req, res);

  if (error) {
    res.render("create-theater", {
      title: "Add play",
      isLoggedIn: req.isLoggedIn,
      error,
    });
  } else {
    res.redirect("/");
  }
});

router.post("/edit/:id", getUserStatus, async (req, res) => {
  const { error } = await editPlay(req, res);
  res.redirect(`/details/${req.params.id}`);
});

module.exports = router;
