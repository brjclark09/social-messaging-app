require('dotenv').config();
const supertest = require('supertest');
const app = require('../src/app.js');

const agent = supertest.agent(app);

let adminToken = "";
let standardUserToken = "";

beforeAll(async () => {
  let response = await agent.post("/auth/login/").send({"email":"john@doe.com", "password":"test123"});
  let authHeader = response.headers['authorization'];
  adminToken = authHeader.substring('Bearer '.length);

  response = await agent.post("/auth/login/").send({"email":"jane@doe.com", "password":"test123"});
  authHeader = response.headers['authorization'];
  standardUserToken = authHeader.substring('Bearer '.length);
})

describe('UserMessages API Tests', () => {
  describe('GET /messages', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/messages');
      expect(response.status).toBe(403);
    })

    it('should return 401 status for standard users (admin only)', async () => {
      const response = await agent.get('/messages').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })

    it('should return 200 status and an array of messages for admins', async () => {
      const response = await agent.get('/messages').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if(response.body.length > 0){
        expect(response.body[0]).toHaveProperty('messageId');
        expect(response.body[0]).toHaveProperty('senderId');
        expect(response.body[0]).toHaveProperty('recipientId');
        expect(response.body[0]).toHaveProperty('messageText');
        expect(response.body[0]).toHaveProperty('sentAt');
      }
    })

  }); // end of GET /messages

  
  describe('GET /messages/sender/:senderId', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/messages/sender/1');
      expect(response.status).toBe(403);
    })
    
    it('should return status 200 for a user getting their own sent messages', async () => {
      // Note that the admin token we are using is for john doe, whose id is 1
      const response = await agent.get('/messages/sender/1').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 status for standard users accessing another users sent messages', async () => {
      // Note that the standard token we are using is for jane doe, whose id is 2
      const response = await agent.get('/messages/sender/1').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })

    it('should return 200 for admins accessing any users sent messages', async () => {
      const response = await agent.get('/messages/sender/2').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

  }); // end of GET /messages/sender/:senderId

  
  describe('GET /messages/recipient/:recipientId', () => {
    
    it('should return status 200 for a user getting their own received messages', async () => {
      // Note that the standard token we are using is for jane doe, whose id is 2
      const response = await agent.get('/messages/recipient/2').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 status for standard users accessing another users received messages', async () => {
      // Note that the standard token we are using is for jane doe, whose id is 2
      const response = await agent.get('/messages/recipient/1').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })

  }); // end of GET /messages/recipient/:recipientId

  
  describe('GET /messages/between/:userId1/:userId2', () => {
    
    it('should return status 200 for a user getting messages between themselves and another user', async () => {
      // Note that the standard token we are using is for jane doe, whose id is 2
      const response = await agent.get('/messages/between/2/1').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 status for users trying to access conversations they are not part of', async () => {
      // Note that the standard token we are using is for jane doe, whose id is 2
      const response = await agent.get('/messages/between/1/3').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })

  }); // end of GET /messages/between/:userId1/:userId2

  
  describe('POST /messages', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.post('/messages').send({senderId: 1, recipientId: 2, messageText: 'Test message'});
      expect(response.status).toBe(403);
    })

    it('should return 201 and the new message id for valid message', async () => {
      const response = await agent.post('/messages')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send({senderId: 2, recipientId: 1, messageText: 'Test message from API test'});
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 if user tries to send message as someone else', async () => {
      const response = await agent.post('/messages')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send({senderId: 1, recipientId: 2, messageText: 'Test message'});
      
      expect(response.status).toBe(401);
    });

    it('should return 400 if message is not valid', async () => {
      const response = await agent.post('/messages')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send({senderId: 2, recipientId: 1, messageText: ''});
      
      expect(response.status).toBe(400);
    });
  }); // end of POST /messages

  
  describe('DELETE /messages/:messageId', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.delete('/messages/1');
      expect(response.status).toBe(403);
    })

    it('should return 401 status if a standard user tries a delete', async () => {
      const response = await agent.delete('/messages/1').set("Authorization", `Bearer ${standardUserToken}`)
      expect(response.status).toBe(401);
    })

    it('should return 200 (for admins)', async () => {
      // Insert one and then test to see if we can delete it.
      let response = await agent.post('/messages/')
                                .set("Authorization", `Bearer ${adminToken}`)
                                .send({senderId: 1, recipientId: 2, messageText: 'Message to delete'});
      
      const idToDelete = response.body.id;
    
      response = await agent.delete('/messages/' + idToDelete).set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

    it('should return 400 (for admins) if the id does not match a message in the database', async () => {
      const response = await agent.delete('/messages/999999').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(400);
    });
  }); // end of DELETE /messages/:messageId
  
});