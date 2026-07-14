const {
  getPreferencesByUserId,
  createPreferences,
  updatePreferences,
  deletePreferences
} = require("./userpreferences.data.service");
const UserPreferences = require("./userpreferences.model");

exports.getUserPreferencesHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    
    // Validate user ID
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "Invalid user ID - must be a number greater than 0" });
      return;
    }

    // Users can only access their own preferences unless they're admin
    if (!req.isAdmin && req.userId !== userId) {
      res.status(401).json({ message: "Permission denied - can only access your own preferences" });
      return;
    }

    const preferences = await getPreferencesByUserId(userId);
    
    if (preferences) {
      res.status(200).json(preferences);
    } else {
      res.status(404).json({ message: "User preferences not found" });
    }
    
  } catch (err) {
    next(err);
  }
};

exports.createUserPreferencesHandler = async (req, res, next) => {
  try {
    const preferences = new UserPreferences(req.body);
    
    // Validate the model
    const [isValid, errors] = preferences.validate();
    if (!isValid) {
      res.status(400).json({ message: "Invalid preferences data", errors });
      return;
    }

    // Users can only create preferences for themselves unless they're admin
    if (!req.isAdmin && req.userId !== preferences.userId) {
      res.status(401).json({ message: "Permission denied - can only create your own preferences" });
      return;
    }

    await createPreferences(preferences);
    res.status(201).json({ message: "User preferences created successfully" });
    
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: "User preferences already exist for this user" });
    } else {
      next(err);
    }
  }
};

exports.updateUserPreferencesHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    
    // Validate user ID
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "Invalid user ID - must be a number greater than 0" });
      return;
    }

    // Make sure the userId in the body matches the URL parameter
    if (req.body.userId && req.body.userId !== userId) {
      res.status(400).json({ message: "User ID mismatch between URL and body" });
      return;
    }

    // Set the userId from the URL parameter
    req.body.userId = userId;
    
    const preferences = new UserPreferences(req.body);
    
    // Validate the model
    const [isValid, errors] = preferences.validate();
    if (!isValid) {
      res.status(400).json({ message: "Invalid preferences data", errors });
      return;
    }

    // Users can only update their own preferences unless they're admin
    if (!req.isAdmin && req.userId !== userId) {
      res.status(401).json({ message: "Permission denied - can only update your own preferences" });
      return;
    }

    const result = await updatePreferences(preferences);
    
    if (result) {
      res.status(200).json({ message: "User preferences updated successfully" });
    } else {
      res.status(404).json({ message: "User preferences not found" });
    }
    
  } catch (err) {
    next(err);
  }
};

exports.deleteUserPreferencesHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    
    // Validate user ID
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "Invalid user ID - must be a number greater than 0" });
      return;
    }

    const result = await deletePreferences(userId);
    
    if (result) {
      res.status(200).json({ message: "User preferences deleted successfully" });
    } else {
      res.status(404).json({ message: "User preferences not found" });
    }
    
  } catch (err) {
    next(err);
  }
};