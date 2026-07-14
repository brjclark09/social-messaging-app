const request = require('supertest');
const app = require('../src/app.js');

const agent = request.agent(app);

describe("auth/", () => {

  describe("Log in", () => {
    
    it("should return the proper response when credentials are valid", async () => {
      const response = await agent.post("/auth/login/").send({"email":"john@doe.com", "password":"test123"});
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("email", "john@doe.com");

      // Authorization headers tests:
      expect(response.headers).toHaveProperty("authorization"); // Express must have sent the header as all lowercase???


    });

    it("should return the proper response when the email is not valid", async () => {
      const response = await agent.post("/auth/login/").send({"email":"BLAH", "password":"test123"});
      expect(response.status).toBe(401);
    });

    it("should return the proper response when the password is not valid", async () => {
      const response = await agent.post("/auth/login/").send({"email":"admin@admin.com", "password":"BLAH"});
      expect(response.status).toBe(401);
    });

  }) // end of Login

  /*
  describe("Log out", () => {
  
    // We will not implement a logout feature because we are using tokens and an Authorization header, 
    // rather than session based authentication (and cookies)
    
    // If we did implement a logout feature, there are a few ways to go about this:
    // 1. come up with a way to expire or blacklist the token on the server
    // 2. delete the token on the client

  }) // end of Log out
  */

}) // end of auth/