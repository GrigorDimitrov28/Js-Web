const router = require("express").Router();
const { saveUser, verifyUser, guestAccess } = require("../controllers/user");

router.get("/login", guestAccess, (req, res) => {
  res.render("login", {
    title: "Login page",
  });
});

router.get("/register", guestAccess, (req, res) => {
  res.render("register", {
    title: "Register page",
  });
});

router.post("/login", async (req, res) => {
  const { error } = await verifyUser(req, res);

  if (error) {
    return res.render("login", {
      error: error,
    });
  }

  res.redirect("/");
});

router.post("/register", async (req, res) => {
  const { error } = await saveUser(req, res);
  if (error) {
    return res.render("register", {
      error: error,
    });
  }

  res.redirect("/");
});

router.get("/logout", (req, res) => {
  res.clearCookie("aid");

  res.redirect("/");
});

module.exports = router;
