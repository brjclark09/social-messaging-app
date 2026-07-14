require('dotenv').config();
const supertest = require('supertest');
const app = require('../src/app.js');

// pass your app into supertest, it will start the server
// and create an 'agent' that you can use to send requests (to the server.)
const agent = supertest.agent(app);

describe('API Tests', () => {
  
  describe('Default Route /', () => {
    it('responds with JSON message', async () => {
      const response = await agent.get("/");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Hello, world!');
    });
  }); // end of Default Route

  describe('404', () => {
    it('responds with 404 status code if the route is not valid', async () => {
      const response = await agent.get("/SOME-BOGUS-ROUTE");
      expect(response.status).toBe(404);
    });
  }); // end of 404


}); // end of API tests