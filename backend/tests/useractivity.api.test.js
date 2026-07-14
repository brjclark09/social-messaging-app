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

describe('UserActivity API Tests', () => {
  describe('GET /activity', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/activity');
      expect(response.status).toBe(403);
    })

    it('should return 401 status for standard users (admin only)', async () => {
      const response = await agent.get('/activity').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })

    it('should return 200 status and an array of activities for admins', async () => {
      const response = await agent.get('/activity').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if(response.body.length > 0){
        expect(response.body[0]).toHaveProperty('activityId');
        expect(response.body[0]).toHaveProperty('userId');
        expect(response.body[0]).toHaveProperty('activityType');
        expect(response.body[0]).toHaveProperty('activityDescription');
        expect(response.body[0]).toHaveProperty('activityTimestamp');
      }
    })

  }); // end of GET /activity

  
  describe('GET /activity/user/:userId', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/activity/user/1');
      expect(response.status).toBe(403);
    })
    
    it('should return status 200 for a user getting their own activities', async () => {
      // Note that the admin token we are using is for john doe, whose id is 1
      const response = await agent.get('/activity/user/1').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 status for standard users accessing another users activities', async () => {
      // Note that the standard token we are using is for jane doe, whose id is 2
      const response = await agent.get('/activity/user/1').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })

    it('should return 200 for admins accessing any users activities', async () => {
      const response = await agent.get('/activity/user/2').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

  }); // end of GET /activity/user/:userId

  
  describe('GET /activity/type/:activityType', () => {
    
    it('should return status 200 for logged in users getting activities by type', async () => {
      const response = await agent.get('/activity/type/login').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/activity/type/login');
      expect(response.status).toBe(403);
    })

  }); // end of GET /activity/type/:activityType

  
  describe('POST /activity', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.post('/activity').send({userId: 1, activityType: 'test', activityDescription: 'Test activity'});
      expect(response.status).toBe(403);
    })

    it('should return 201 and the new activity id for valid activity', async () => {
      const response = await agent.post('/activity')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send({userId: 2, activityType: 'api_test', activityDescription: 'Test activity from API test'});
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 if user tries to create activity for someone else', async () => {
      const response = await agent.post('/activity')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send({userId: 1, activityType: 'test', activityDescription: 'Test activity'});
      
      expect(response.status).toBe(401);
    });

    it('should return 400 if activity is not valid', async () => {
      const response = await agent.post('/activity')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send({userId: 2, activityType: '', activityDescription: 'Test activity'});
      
      expect(response.status).toBe(400);
    });
  }); // end of POST /activity

  
  describe('PUT /activity/:activityId', () => {
    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.put('/activity/1');
      expect(response.status).toBe(403);
    })
    
    it('should return status 200 for a user updating their own activity', async () => {
      // First create an activity to update
      let response = await agent.post('/activity')
                                .set("Authorization", `Bearer ${standardUserToken}`)
                                .send({userId: 2, activityType: 'update_test', activityDescription: 'Activity to update'});
      
      const activityId = response.body.id;
      
      const updatedActivity = {activityId: activityId, userId: 2, activityType: 'UPDATED', activityDescription: 'Updated activity'};
      response = await agent.put('/activity/' + activityId)
                            .set("Authorization", `Bearer ${standardUserToken}`)
                            .send(updatedActivity);
      expect(response.status).toBe(200);
    })

    it('should return status 401 for a user updating another users activity', async () => {
      const updatedActivity = {activityId: 1, userId: 1, activityType: 'UPDATED', activityDescription: 'Updated activity'};
      const response = await agent.put('/activity/1')
                                  .set("Authorization", `Bearer ${standardUserToken}`)
                                  .send(updatedActivity);
      expect(response.status).toBe(401);
    })

    it("Admins should be able to update any activity", async () => {
      const updatedActivity = {activityId: 1, userId: 1, activityType: 'admin_updated', activityDescription: 'Updated by admin'};
      const response = await agent.put('/activity/1')
                                  .set("Authorization", `Bearer ${adminToken}`)
                                  .send(updatedActivity);
      expect(response.status).toBe(200);
    })

    it('should return 400 if activity is not valid', async () => {
      const response = await agent.put('/activity/1')
                                  .set("Authorization", `Bearer ${adminToken}`)
                                  .send({activityId: 1, userId: 'invalid', activityType: 'test', activityDescription: 'Test'});
      expect(response.status).toBe(400);
    });

  }); // end of PUT /activity/:activityId

  
  describe('DELETE /activity/:activityId', () => {

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.delete('/activity/1');
      expect(response.status).toBe(403);
    })

    it('should return 401 status if a standard user tries a delete', async () => {
      const response = await agent.delete('/activity/1').set("Authorization", `Bearer ${standardUserToken}`)
      expect(response.status).toBe(401);
    })

    it('should return 200 (for admins)', async () => {
      // Insert one and then test to see if we can delete it.
      let response = await agent.post('/activity/')
                                .set("Authorization", `Bearer ${adminToken}`)
                                .send({userId: 1, activityType: 'delete_test', activityDescription: 'Activity to delete'});
      
      const idToDelete = response.body.id;
    
      response = await agent.delete('/activity/' + idToDelete).set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

    it('should return 400 (for admins) if the id does not match an activity in the database', async () => {
      const response = await agent.delete('/activity/999999').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(400);
    });
  }); // end of DELETE /activity/:activityId
  
});