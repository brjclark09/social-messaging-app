require('dotenv').config();
const supertest = require('supertest');
const app = require('../src/app.js');

// Here's how we can start a session to run the tests
const agent = supertest.agent(app);

// NOTE: I did some research on how to authorize a user to update their own details
// but no one else's and AI told me that instead of creating a middleware function
// I should put the logic directly in the controller for the route

// NOTE: I updated isLoggedIn() and isAdmin() to attach the userId and admin status to the req object

// Before running the tests, login and get tokens for an admin and a standard user
let adminToken = "";
let standardUserToken = "";

beforeAll(async () => {
  let response = await agent.post("/auth/login/").send({"email":"john@doe.com", "password":"test123"});
  let authHeader = response.headers['authorization'];
  adminToken = authHeader.substring('Bearer '.length);
  //console.log("ADMIN TOKEN", adminToken);

  response = await agent.post("/auth/login/").send({"email":"jane@doe.com", "password":"test123"});
  authHeader = response.headers['authorization'];
  standardUserToken = authHeader.substring('Bearer '.length);
  //console.log("STANDARD USER TOKEN", standardUserToken);
})

describe('Users API Tests', () => {
  describe('GET /users', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/users');
      expect(response.status).toBe(403);
    })

    it('should return 200 status for standard logged in users', async () => {
      const response = await agent.get('/users').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(200);
    })

    it('should return 200 status and an array of users', async () => {
      const response = await agent.get('/users').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(200);
      const users = response.body;
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('firstName');
      expect(users[0]).toHaveProperty('lastName');
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).toHaveProperty('roleId');
      expect(users[0]).toHaveProperty('role');
      expect(users[0]).toHaveProperty('active');
    })

    it('Admins should have access to the route', async () => {
      //console.log("ADMIN TOKEN", );
      const response = await agent.get('/users').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      const users = response.body;
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('firstName');
      expect(users[0]).toHaveProperty('lastName');
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).toHaveProperty('roleId');
      expect(users[0]).toHaveProperty('role');
      expect(users[0]).toHaveProperty('active');
    })

    // This test is passing but it is causing an error on the server
    it('Should not crash if the Auth header is missing the token', async () => {
      const response = await agent.get('/users').set("Authorization", `Bearer `);
      expect(response.status).toBe(403);
    })

    
  }); // end of GET /users

  
  describe('GET /users/:id', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/users');
      expect(response.status).toBe(403);
    })
    
    it('should return status 200 for a standard user fetching their own info', async () => {
      // Note that the token we are using is for jane doe, whose id is 2 and is a standard user
      const response = await agent.get('/users/2').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 2);
      expect(response.body).toHaveProperty('firstName', 'Jane');
      expect(response.body).toHaveProperty('lastName', 'Doe');
      expect(response.body).toHaveProperty('email', 'jane@doe.com');
      expect(response.body).toHaveProperty('roleId', 2);
      expect(response.body).toHaveProperty('role');
      expect(response.body).toHaveProperty('active', true);
    });

    it('should return 401 status for standard logged in users whose id DOES NOT match the one they are getting', async () => {
      // Note that the token we are using is for jane doe, whose id is 2 and is a standard user
      const response = await agent.get('/users/3').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })

    it('should return 200 for admins', async () => {
      const response = await agent.get('/users/2').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

    it('should return 404 if user not found', async () => {
      const response = await agent.get('/users/99999').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(404);
    });

  }); // end of GET /users:id

  
  describe('POST /users', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.post('/users').send({firstName: 'Buster', lastName: 'Dart', email: 'bd@example.com', roleId:2, active: true});
      expect(response.status).toBe(403);
    })

    it('should return 401 status if the request comes from a standard user', async () => {
      const response = await agent.post('/users')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send({firstName: 'Buster', lastName: 'Dart', email: 'bd@example.com', roleId:2, active: true});
      
      expect(response.status).toBe(401);
    })

    it('should return 201 and the new user id (for admins)', async () => {
      const response = await agent.post('/users')
                                  .set("Authorization", `Bearer ${adminToken}`)
                                  .send({firstName: 'Buster', lastName: 'Dart', email: 'bd@example.com', roleId:2, active: true, password: 'password'});
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 if user is not valid (for admins)', async () => {
      const response = await agent.post('/users')
                                  .set("Authorization", `Bearer ${adminToken}`)
                                  .send({firstName: 'Buster', lastName: 'Dart', email: 'INVALID_EMAIL', roleId:2, active: true});
      
      expect(response.status).toBe(400);
    });
  }); // end of POST /users

  
  describe('PUT /users/:id', () => {
    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/users');
      expect(response.status).toBe(403);
    })
    
    it('should return status 200 for a standard user updating their own info', async () => {
      // Note, were not actually changing any of jane's data, it could mess up other tests
      const updatedJane = {id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@doe.com', roleId: 2, active: true};
      const response = await agent.put('/users/2')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send(updatedJane);
      expect(response.status).toBe(200);
    })

    it('should return status 401 for a standard user updating another users info', async () => {
      // Note: we're using Jane's token, but trying to update a different user
      const updatedUser = {id: 4, firstName: 'xxx', lastName: 'Dxxxoe', email: 'xxx@xxx.com', roleId: 2, active: true};
      const response = await agent.put('/users/4')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send(updatedUser);
      expect(response.status).toBe(401);
    })

    it("Admins should be able to update any user", async () => {
      const updatedUser = {id: 4, firstName: 'xxx', lastName: 'Dxxxoe', email: 'xxx@xxx.com', roleId: 2, active: true};
      const response = await agent.put('/users/4')
                                  .set("Authorization", `Bearer ${adminToken}`)
                                  .send(updatedUser);
      expect(response.status).toBe(200);
    })

    it("TODO: Standard users should not be able to update their role to admin", () => {
      expect(true).toBe(true);
    })

    it('should return 400 if user is not valid (for admins)', async () => {
      const response = await agent.put('/users/4')
                                  .set("Authorization", `Bearer ${adminToken}`)
                                  .send({firstName: 'Buster', lastName: 'Dart', email: 'INVALID_EMAIL', roleId:2, active: true});
      expect(response.status).toBe(400);
    });

  });

  describe('DELETE /users/:id', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      response = await agent.delete('/users/4');
      expect(response.status).toBe(403);
    })

    it('should return 401 status if a standard user tries a delete', async () => {
      response = await agent.delete('/users/2').set("Authorization", `Bearer ${standardUserToken}`)
      expect(response.status).toBe(401);
    })

    it('should return 200 (for admins)', async () => {
      // Insert one and then test to see if we can delete it.
      let response = await agent.post('/users/')
                                .set("Authorization", `Bearer ${adminToken}`)
                                .send({firstName: 'Luddy', lastName: 'Muckers', email: 'lm@example.com', roleId:2, active: true, password: 'password'});
      
      const idToDelete = response.body.id;
    
      response = await agent.delete('/users/' + idToDelete).set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

    it('should return 400 (for admins) if the id does not match a user in the database', async () => {
      const response = await agent.delete('/users/99999').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(400);
    });
  });
  
  
});