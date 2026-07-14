const pool = require('../src/db');
const {
  getPreferencesByUserId,
  createPreferences,
  updatePreferences,
  deletePreferences,
  createDefaultPreferences
} = require('../src/userpreferences/userpreferences.data.service');
const UserPreferences = require('../src/userpreferences/userpreferences.model');

describe('UserPreferences Data Service', () => {

  // Helper function to create a test user
  const createTestUser = async (userId, email) => {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        INSERT INTO users (user_id, user_first_name, user_last_name, user_email, user_password, user_salt, user_role_id, user_active) 
        VALUES (?, 'Test', 'User', ?, 'xxx', 'xxx', 2, 1)
        ON DUPLICATE KEY UPDATE user_email = VALUES(user_email)
      `, [userId, email]);
    } finally {
      connection.release();
    }
  };

  // Clean up test data after each test
  afterEach(async () => {
    const connection = await pool.getConnection();
    try {
      // Clean up any test preferences that might have been created (child table first)
      await connection.query('DELETE FROM user_preferences WHERE user_id IN (999, 998, 997, 996, 995, 994)');
      // Then clean up test users (parent table)
      await connection.query('DELETE FROM users WHERE user_id IN (999, 998, 997, 996, 995, 994)');
    } finally {
      connection.release();
    }
  });

  describe('getPreferencesByUserId', () => {
    test('should retrieve existing user preferences', async () => {
      // Test with user ID 1 that has preferences in your sample data
      const preferences = await getPreferencesByUserId(1);

      expect(preferences).not.toBeNull();
      expect(preferences).toBeInstanceOf(UserPreferences);
      expect(preferences.userId).toBe(1);
      // Update expected values to match your actual sample data
      expect(preferences.theme).toBe('light'); // Check your database for actual values
      expect(preferences.fontSize).toBe('large');
      expect(preferences.language).toBe('en');
      expect(preferences.dateFormat).toBe('MM/DD/YYYY');
      expect(preferences.timeZone).toBe('America/New_York');
    });

    test('should return null for non-existent user preferences', async () => {
      // Create a user without preferences
      await createTestUser(999, 'test999@example.com');
      const preferences = await getPreferencesByUserId(999);
      expect(preferences).toBeNull();
    });

    test('should throw error for invalid user ID', async () => {
      await expect(getPreferencesByUserId('invalid')).rejects.toThrow('Invalid parameter sent to getPreferencesByUserId()');
      await expect(getPreferencesByUserId(0)).rejects.toThrow('Invalid parameter sent to getPreferencesByUserId()');
      await expect(getPreferencesByUserId(-1)).rejects.toThrow('Invalid parameter sent to getPreferencesByUserId()');
    });
  });

  describe('createPreferences', () => {
    test('should create new user preferences successfully', async () => {
      // Create the user first
      await createTestUser(999, 'test999@example.com');

      const newPreferences = new UserPreferences({
        userId: 999,
        theme: 'dark',
        fontSize: 'small',
        language: 'fr',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Europe/Paris'
      });

      const result = await createPreferences(newPreferences);
      expect(result).toBe(true);

      // Verify the preferences were created
      const retrieved = await getPreferencesByUserId(999);
      expect(retrieved).not.toBeNull();
      expect(retrieved.theme).toBe('dark');
      expect(retrieved.fontSize).toBe('small');
      expect(retrieved.language).toBe('fr');
    });

    test('should throw error when trying to create duplicate preferences', async () => {
      // Create the user first
      await createTestUser(998, 'test998@example.com');

      const preferences1 = new UserPreferences({
        userId: 998,
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      });

      // First creation should succeed
      await createPreferences(preferences1);

      const preferences2 = new UserPreferences({
        userId: 998, // Same user ID
        theme: 'dark',
        fontSize: 'large',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Europe/Madrid'
      });

      // Second creation should fail due to primary key constraint
      await expect(createPreferences(preferences2)).rejects.toThrow();
    });

    test('should throw error for null preferences', async () => {
      await expect(createPreferences(null)).rejects.toThrow('Invalid parameter sent to createPreferences() - cannot be null');
    });

    test('should throw error for non-UserPreferences object', async () => {
      const invalidObject = { userId: 999, theme: 'dark' };
      await expect(createPreferences(invalidObject)).rejects.toThrow('Invalid parameter sent to createPreferences() - must be a UserPreferences model object');
    });

    test('should throw error for invalid preferences data', async () => {
      const invalidPreferences = new UserPreferences({
        userId: 'invalid', // Invalid user ID
        theme: 'dark'
      });

      await expect(createPreferences(invalidPreferences)).rejects.toThrow('Invalid UserPreferences');
    });
  });

  describe('updatePreferences', () => {
    beforeEach(async () => {
      // Create test user and preferences to update
      await createTestUser(997, 'test997@example.com');
      
      const testPreferences = new UserPreferences({
        userId: 997,
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      });
      await createPreferences(testPreferences);
    });

    test('should update existing user preferences successfully', async () => {
      const updatedPreferences = new UserPreferences({
        userId: 997,
        theme: 'dark',
        fontSize: 'large',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Europe/Madrid'
      });

      const result = await updatePreferences(updatedPreferences);
      expect(result).toBe(true);

      // Verify the preferences were updated
      const retrieved = await getPreferencesByUserId(997);
      expect(retrieved.theme).toBe('dark');
      expect(retrieved.fontSize).toBe('large');
      expect(retrieved.language).toBe('es');
      expect(retrieved.dateFormat).toBe('DD/MM/YYYY');
      expect(retrieved.timeZone).toBe('Europe/Madrid');
    });

    test('should return false for non-existent user preferences', async () => {
      // Create a user without preferences
      await createTestUser(9999, 'test9999@example.com');
      
      const nonExistentPreferences = new UserPreferences({
        userId: 9999, // User exists but has no preferences
        theme: 'dark',
        fontSize: 'large',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      });

      const result = await updatePreferences(nonExistentPreferences);
      expect(result).toBe(false);
    });

    test('should throw error for non-UserPreferences object', async () => {
      const invalidObject = { userId: 997, theme: 'dark' };
      await expect(updatePreferences(invalidObject)).rejects.toThrow('Invalid parameter sent to updatePreferences() - must be a UserPreferences model object');
    });

    test('should throw error for invalid preferences data', async () => {
      const invalidPreferences = new UserPreferences({
        userId: 'invalid', // Invalid user ID
        theme: 'dark'
      });

      await expect(updatePreferences(invalidPreferences)).rejects.toThrow('Invalid UserPreferences');
    });
  });

  describe('deletePreferences', () => {
    beforeEach(async () => {
      // Create test user and preferences to delete
      await createTestUser(996, 'test996@example.com');
      
      const testPreferences = new UserPreferences({
        userId: 996,
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      });
      await createPreferences(testPreferences);
    });

    test('should delete existing user preferences successfully', async () => {
      const result = await deletePreferences(996);
      expect(result).toBe(true);

      // Verify the preferences were deleted
      const retrieved = await getPreferencesByUserId(996);
      expect(retrieved).toBeNull();
    });

    test('should return false for non-existent user preferences', async () => {
      const result = await deletePreferences(9999);
      expect(result).toBe(false);
    });

    test('should throw error for invalid user ID', async () => {
      await expect(deletePreferences('invalid')).rejects.toThrow('Invalid parameter sent to deletePreferences()');
      await expect(deletePreferences(0)).rejects.toThrow('Invalid parameter sent to deletePreferences()');
      await expect(deletePreferences(-1)).rejects.toThrow('Invalid parameter sent to deletePreferences()');
    });
  });

  describe('createDefaultPreferences', () => {
    test('should create default preferences for a user', async () => {
      // Create the user first
      await createTestUser(995, 'test995@example.com');
      
      const result = await createDefaultPreferences(995);
      expect(result).toBe(true);

      // Verify default preferences were created
      const retrieved = await getPreferencesByUserId(995);
      expect(retrieved).not.toBeNull();
      expect(retrieved.theme).toBe('light');
      expect(retrieved.fontSize).toBe('medium');
      expect(retrieved.language).toBe('en');
      expect(retrieved.dateFormat).toBe('MM/DD/YYYY');
      expect(retrieved.timeZone).toBe('UTC');
    });

    test('should throw error when trying to create default preferences for existing user', async () => {
      // Create user and preferences
      await createTestUser(994, 'test994@example.com');
      
      // First creation should succeed
      await createDefaultPreferences(994);

      // Second creation should fail
      await expect(createDefaultPreferences(994)).rejects.toThrow();
    });
  });

  describe('Database connection handling', () => {
    test('should properly handle database errors', async () => {
      // This test tries to create preferences for a non-existent user
      const invalidPreferences = new UserPreferences({
        userId: 99999, // User doesn't exist
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      });

      // Should throw foreign key constraint error
      await expect(createPreferences(invalidPreferences)).rejects.toThrow();
    });
  });
});