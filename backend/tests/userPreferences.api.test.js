const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');
const { getToken } = require('../src/auth/auth.helpers');

describe('User Preferences API', () => {
  let adminToken;
  let userToken;
  let user2Token;

  beforeAll(() => {
    // Create test tokens
    adminToken = getToken(1, 1); // Admin user
    userToken = getToken(2, 2);  // Regular user
    user2Token = getToken(3, 2); // Another regular user
  });

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

  // afterEach(async () => {
  //   // Clean up test data after each test
  //   const connection = await pool.getConnection();
  //   try {
  //     // Delete preferences first (child table)
  //     await connection.query('DELETE FROM user_preferences WHERE user_id IN (999, 998, 997, 996, 995, 994, 993)');
  //     // Then delete users (parent table)
  //     await connection.query('DELETE FROM users WHERE user_id IN (999, 998, 997, 996, 995, 994, 993)');
  //   } finally {
  //     connection.release();
  //   }
  // });

  describe('GET /preferences/:userId', () => {
    test('should get user preferences successfully when user requests own data', async () => {
      const response = await request(app)
        .get('/preferences/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', 1);
      expect(response.body).toHaveProperty('theme');
      expect(response.body).toHaveProperty('fontSize');
      expect(response.body).toHaveProperty('language');
      expect(response.body).toHaveProperty('dateFormat');
      expect(response.body).toHaveProperty('timeZone');
    });

    test('should get user preferences successfully when admin requests any user data', async () => {
      const response = await request(app)
        .get('/preferences/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', 2);
    });

    test('should deny access when user tries to access another user\'s preferences', async () => {
      const response = await request(app)
        .get('/preferences/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);

      expect(response.body.message).toBe('Permission denied - can only access your own preferences');
    });

    test('should return 404 for non-existent user preferences', async () => {
      // Create a user without preferences
      await createTestUser(999, 'test999@example.com');
      
      const testToken = getToken(999, 2);
      const response = await request(app)
        .get('/preferences/999')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.message).toBe('User preferences not found');
    });

    test('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/preferences/invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.message).toBe('Invalid user ID - must be a number greater than 0');
    });

    test('should return 403 when no authorization header provided', async () => {
      const response = await request(app)
        .get('/preferences/1')
        .expect(403);

      expect(response.body.message).toBe('No Auth Header');
    });

    test('should return 403 when invalid token provided', async () => {
      const response = await request(app)
        .get('/preferences/1')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.message).toBe('Invalid Token');
    });
  });

  describe('POST /preferences', () => {
    test('should create user preferences successfully', async () => {
      // Create the user first
      await createTestUser(999, 'test999@example.com');
      
      const preferencesData = {
        userId: 999,
        theme: 'dark',
        fontSize: 'large',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Europe/Madrid'
      };

      const testToken = getToken(999, 2);

      const response = await request(app)
        .post('/preferences')
        .set('Authorization', `Bearer ${testToken}`)
        .send(preferencesData)
        .expect(201);

      expect(response.body.message).toBe('User preferences created successfully');

      // Verify preferences were created
      const getResponse = await request(app)
        .get('/preferences/999')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(getResponse.body.theme).toBe('dark');
      expect(getResponse.body.fontSize).toBe('large');
      expect(getResponse.body.language).toBe('es');
    });

    test('should allow admin to create preferences for any user', async () => {
      // Create the user first
      await createTestUser(998, 'test998@example.com');
      
      const preferencesData = {
        userId: 998,
        theme: 'system',
        fontSize: 'small',
        language: 'fr',
        dateFormat: 'YYYY-MM-DD',
        timeZone: 'Europe/Paris'
      };

      const response = await request(app)
        .post('/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(preferencesData)
        .expect(201);

      expect(response.body.message).toBe('User preferences created successfully');
    });

    test('should deny regular user creating preferences for another user', async () => {
      const preferencesData = {
        userId: 1, // Different user
        theme: 'dark',
        fontSize: 'medium',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      };

      const response = await request(app)
        .post('/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send(preferencesData)
        .expect(401);

      expect(response.body.message).toBe('Permission denied - can only create your own preferences');
    });

    test('should return 400 for invalid preferences data', async () => {
      const invalidData = {
        userId: 'invalid',
        theme: 'invalid-theme',
        fontSize: 'huge',
        language: 'invalid-lang'
      };

      const response = await request(app)
        .post('/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Invalid preferences data');
      expect(response.body.errors).toBeDefined();
    });

    test('should return 409 when trying to create duplicate preferences', async () => {
      const preferencesData = {
        userId: 1, // User 1 already has preferences
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      };

      const response = await request(app)
        .post('/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(preferencesData)
        .expect(409);

      expect(response.body.message).toBe('User preferences already exist for this user');
    });
  });

  describe('PUT /preferences/:userId', () => {
    beforeEach(async () => {
      // Create test user and preferences to update
      await createTestUser(997, 'test997@example.com');
      
      const testToken = getToken(997, 2);
      await request(app)
        .post('/preferences')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: 997,
          theme: 'light',
          fontSize: 'medium',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timeZone: 'UTC'
        });
    });

    test('should update user preferences successfully', async () => {
      const updatedData = {
        userId: 997,
        theme: 'dark',
        fontSize: 'large',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Europe/Madrid'
      };

      const testToken = getToken(997, 2);

      const response = await request(app)
        .put('/preferences/997')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.message).toBe('User preferences updated successfully');

      // Verify preferences were updated
      const getResponse = await request(app)
        .get('/preferences/997')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(getResponse.body.theme).toBe('dark');
      expect(getResponse.body.fontSize).toBe('large');
      expect(getResponse.body.language).toBe('es');
    });

    test('should allow admin to update any user\'s preferences', async () => {
      const updatedData = {
        userId: 997,
        theme: 'system',
        fontSize: 'small',
        language: 'fr',
        dateFormat: 'YYYY-MM-DD',
        timeZone: 'Europe/Paris'
      };

      const response = await request(app)
        .put('/preferences/997')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.message).toBe('User preferences updated successfully');
    });

    // Add remaining PUT tests...
    test('should deny regular user updating another user\'s preferences', async () => {
      const updatedData = {
        userId: 997,
        theme: 'dark',
        fontSize: 'large',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      };

      const response = await request(app)
        .put('/preferences/997')
        .set('Authorization', `Bearer ${userToken}`) // User 2 trying to update user 997
        .send(updatedData)
        .expect(401);

      expect(response.body.message).toBe('Permission denied - can only update your own preferences');
    });
  });

  describe('DELETE /preferences/:userId', () => {
    beforeEach(async () => {
      // Create test user and preferences to delete
      await createTestUser(996, 'test996@example.com');
      
      const testToken = getToken(996, 2);
      await request(app)
        .post('/preferences')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: 996,
          theme: 'light',
          fontSize: 'medium',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timeZone: 'UTC'
        });
    });

    test('should delete user preferences successfully as admin', async () => {
      const response = await request(app)
        .delete('/preferences/996')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('User preferences deleted successfully');

      // Verify preferences were deleted
      const testToken = getToken(996, 2);
      await request(app)
        .get('/preferences/996')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);
    });

    test('should deny regular user deleting preferences', async () => {
      const response = await request(app)
        .delete('/preferences/996')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);

      expect(response.body.message).toBe('Not Authorized - Admins only');
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for all endpoints', async () => {
      // Test all endpoints without auth
      await request(app).get('/preferences/1').expect(403);
      await request(app).post('/preferences').expect(403);
      await request(app).put('/preferences/1').expect(403);
      await request(app).delete('/preferences/1').expect(403);
    });
  });
});