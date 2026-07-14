const pool = require("../db");
const UserPreferences = require("./userpreferences.model");

exports.getPreferencesByUserId = async (userId) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid parameter sent to getPreferencesByUserId() - must be a positive integer");
  }

  let connection = null;

  try {
    connection = await pool.getConnection();
    
    const sql = `
      SELECT 
        user_id,
        theme,
        font_size,
        language,
        date_format,
        time_zone
      FROM user_preferences 
      WHERE user_id = ?
    `;

    const [rows] = await connection.query(sql, [userId]);

    if (rows.length === 0) {
      return null;
    }

    return new UserPreferences({
      userId: rows[0].user_id,
      theme: rows[0].theme,
      fontSize: rows[0].font_size,
      language: rows[0].language,
      dateFormat: rows[0].date_format,
      timeZone: rows[0].time_zone
    });

  } catch (error) {
    throw error;
  } finally {
    connection?.release();
  }
};

exports.createPreferences = async (preferences) => {
  if (preferences === null) {
    throw new Error("Invalid parameter sent to createPreferences() - cannot be null");
  }

  // Make sure that the param is an instance of a UserPreferences model object
  if (preferences.constructor.name !== "UserPreferences") {
    throw new Error("Invalid parameter sent to createPreferences() - must be a UserPreferences model object");
  }

  // Make sure the preferences param is valid
  const [isValid, errors] = preferences.validate();
  if (!isValid) {
    throw new Error("Invalid UserPreferences - " + JSON.stringify(errors));
  }

  let connection = null;

  try {
    connection = await pool.getConnection();

    const sql = `
      INSERT INTO user_preferences (user_id, theme, font_size, language, date_format, time_zone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
      preferences.userId,
      preferences.theme,
      preferences.fontSize,
      preferences.language,
      preferences.dateFormat,
      preferences.timeZone
    ]);

    return result?.affectedRows === 1;

  } catch (error) {
    throw error;
  } finally {
    connection?.release();
  }
};

exports.updatePreferences = async (preferences) => {
  // Make sure that the param is an instance of a UserPreferences model object
  if (preferences.constructor.name !== "UserPreferences") {
    throw new Error("Invalid parameter sent to updatePreferences() - must be a UserPreferences model object");
  }

  // Make sure the preferences param is valid
  const [isValid, errors] = preferences.validate();
  if (!isValid) {
    throw new Error("Invalid UserPreferences - " + JSON.stringify(errors));
  }

  let connection = null;

  try {
    connection = await pool.getConnection();

    const sql = `
      UPDATE user_preferences 
      SET theme = ?, font_size = ?, language = ?, date_format = ?, time_zone = ? 
      WHERE user_id = ?
    `;

    const [result] = await connection.query(sql, [
      preferences.theme,
      preferences.fontSize,
      preferences.language,
      preferences.dateFormat,
      preferences.timeZone,
      preferences.userId
    ]);

    if (result?.affectedRows !== 1) {
      return false; // User preferences not found
    }

    return true;

  } catch (error) {
    throw error;
  } finally {
    connection?.release();
  }
};

exports.deletePreferences = async (userId) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid parameter sent to deletePreferences() - must be a positive integer");
  }

  let connection = null;

  try {
    connection = await pool.getConnection();
    
    const sql = "DELETE FROM user_preferences WHERE user_id = ?";
    const [result] = await connection.query(sql, [userId]);
    
    return result.affectedRows === 1;

  } catch (error) {
    throw error;
  } finally {
    connection?.release();
  }
};

// Helper function to create default preferences for a new user
exports.createDefaultPreferences = async (userId) => {
  const defaultPreferences = new UserPreferences({
    userId: userId,
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeZone: 'UTC'
  });

  return await this.createPreferences(defaultPreferences);
};