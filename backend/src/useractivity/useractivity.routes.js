const express = require('express');
const router = express.Router();
const {
  getAllHandler, 
  getByUserIdHandler,
  getByActivityTypeHandler,
  insertHandler, 
  updateHandler,
  removeHandler
} = require("./useractivity.controller");

const {isLoggedIn, isAdmin} = require("../auth/auth.middleware");

router.get("/", isAdmin, getAllHandler);

router.get("/user/:userId", isLoggedIn, getByUserIdHandler);

router.get("/type/:activityType", isLoggedIn, getByActivityTypeHandler);

router.post("/", isLoggedIn, insertHandler);

router.put("/:activityId", isLoggedIn, updateHandler);

router.delete("/:activityId", isAdmin, removeHandler);

module.exports = router;