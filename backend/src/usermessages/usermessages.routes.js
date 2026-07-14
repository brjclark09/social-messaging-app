const express = require('express');
const router = express.Router();
const {
  getAllHandler, 
  getMessagesBySenderHandler,
  getMessagesByRecipientHandler,
  getMessagesBetweenUsersHandler,
  insertHandler, 
  removeHandler
} = require("./usermessages.controller");

const {isLoggedIn, isAdmin} = require("../auth/auth.middleware");

router.get("/", isAdmin, getAllHandler);

router.get("/sender/:senderId", isLoggedIn, getMessagesBySenderHandler);

router.get("/recipient/:recipientId", isLoggedIn, getMessagesByRecipientHandler);

router.get("/between/:userId1/:userId2", isLoggedIn, getMessagesBetweenUsersHandler);

router.post("/", isLoggedIn, insertHandler);

router.delete("/:messageId", isAdmin, removeHandler);

module.exports = router;