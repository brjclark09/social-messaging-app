require('dotenv').config();
const supertest = require('supertest');
const app = require('../src/app.js');

// Here's how we can start a session to run the tests
const agent = supertest.agent(app);

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

describe("Auth Middleware Tests", () => {

  describe("/auth/loginCheck Tests", () => {

    it('should return 200 status if the Authorization header is correct', async () => {
      const response = await agent.get('/auth/loginCheck').set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(200);
    })

    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/auth/loginCheck');
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "No Auth Header");
    })

    it("should return 403 status if the Authorization header is not formatted properly (starts with 'Bearer'", async () => {
      const response = await agent.get('/auth/loginCheck').set("Authorization", `FOO`);;
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Invalid Authorization Header");
    })

    it("should return 403 status if the token is not valid", async () => {
      const response = await agent.get('/auth/loginCheck').set("Authorization", "Bearer SOMEINVALIDTOKEN");;
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Invalid Token");
    })

    it("should return 403 status if the token is expired", async () => {
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGVJZCI6MiwiaWF0IjoxNzQ5MDc1NDA5LCJleHAiOjE3NDkwNzkwMDl9.r3JhD47I1iQBM69AkrNHo5Oy04NjZhiePClEe1w8DaU";
      const response = await agent.get('/auth/loginCheck').set("Authorization", `Bearer ${expiredToken}`);;
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Token has expired");
    })

  
  })
  
  describe("/auth/adminCheck Tests", () => {

    it('should return 200 status if the Authorization header is correct', async () => {
      const response = await agent.get('/auth/adminCheck').set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    })
    
    it('should return 403 status if the Authorization header is not present', async () => {
      const response = await agent.get('/auth/adminCheck');
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "No Auth Header");
    })
    
    it("should return 403 status if the Authorization header is not formatted properly (starts with 'Bearer'", async () => {
      const response = await agent.get('/auth/adminCheck').set("Authorization", `FOO`);;
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Invalid Authorization Header");
    })

    it("should return 403 status if the token is not valid", async () => {
      const response = await agent.get('/auth/adminCheck').set("Authorization", "Bearer SOMEINVALIDTOKEN");;
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Invalid Token");
    })

    it("should return 403 status if the token is expired", async () => {
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGVJZCI6MiwiaWF0IjoxNzQ5MDc1NDA5LCJleHAiOjE3NDkwNzkwMDl9.r3JhD47I1iQBM69AkrNHo5Oy04NjZhiePClEe1w8DaU";
      const response = await agent.get('/auth/adminCheck').set("Authorization", `Bearer ${expiredToken}`);;
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Token has expired");
    })
      
    
  })
  
})