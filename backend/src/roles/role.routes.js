const express = require('express');
const router = express.Router();
const {
  getAllHandler, 
  insertHandler, 
  getByIdHandler, 
  updateHandler, 
  removeHandler
} = require("./role.controller");

const {isAdmin} = require("../auth/auth.middleware");



router.get("/", isAdmin, getAllHandler);

router.post("/", isAdmin, insertHandler);

router.get("/:id", isAdmin, getByIdHandler);

router.put("/:id", isAdmin, updateHandler);

router.delete("/:id", isAdmin, removeHandler);

module.exports = router;