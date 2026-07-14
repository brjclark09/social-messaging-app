const express = require('express');
const router = express.Router();
const {
  getUserPreferencesHandler,
  updateUserPreferencesHandler,
  createUserPreferencesHandler,
  deleteUserPreferencesHandler
} = require("./userpreferences.controller");

const {isLoggedIn, isAdmin} = require("../auth/auth.middleware");

// GET /preferences/:userId - Get preferences for a specific user
router.get("/:userId", isLoggedIn, getUserPreferencesHandler);

// POST /preferences - Create new user preferences (typically done during user registration)
router.post("/", isLoggedIn, createUserPreferencesHandler);

// PUT /preferences/:userId - Update user preferences
router.put("/:userId", isLoggedIn, updateUserPreferencesHandler);

// DELETE /preferences/:userId - Delete user preferences (admin only)
router.delete("/:userId", isAdmin, deleteUserPreferencesHandler);

module.exports = router;