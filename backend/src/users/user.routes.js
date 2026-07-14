const express = require('express');
const router = express.Router();
const {
  getAllHandler, 
  insertHandler, 
  getByIdHandler, 
  updateHandler, 
  removeHandler
} = require("./user.controller");

const {isLoggedIn, isAdmin} = require("../auth/auth.middleware");

router.get("/", isLoggedIn, getAllHandler);

router.post("/", isAdmin, insertHandler);

router.get("/:id", isLoggedIn, getByIdHandler);

router.put("/:id", isLoggedIn, updateHandler);

router.delete("/:id", isAdmin, removeHandler);

module.exports = router;