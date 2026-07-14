const express = require('express');
const router = express.Router();
const {loginHandler, logoutHandler} = require("./auth.controller")
const {isLoggedIn, isAdmin} = require("./auth.middleware")

router.post("/login", loginHandler);
router.get("/logout", logoutHandler);

router.get("/loginCheck", isLoggedIn,  (req, res) => {
  res.json({message: "Looks like your logged in!"})
})

router.get("/adminCheck", isAdmin,  (req, res) => {
  res.json({message: "Looks like your logged in as an admin!"})
})


module.exports = router;