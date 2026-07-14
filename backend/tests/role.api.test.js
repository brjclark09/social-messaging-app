require('dotenv').config();
const supertest = require('supertest');
const app = require('../src/app.js');
const { getById } = require('../src/roles/role.data.service.js');

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

describe("Roles API Tests", () => {
  
  describe("GET /roles", () => {

    it("should return 403 if the Authorization header is not set", async () => {
      const response = await agent.get("/roles")
      expect(response.status).toBe(403);
    })

    it("should return 401 if a standard user makes the request", async () => {
      const response = await agent.get("/roles").set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })
    
    it('should return 200 status code and an array of roles (for admins)', async () => {
      const response = await agent.get("/roles").set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      //expect(response.body.length).toBe(2); // this could fail, depending on the order in which the tests run
      const roles = response.body;
      expect(roles[0]).toHaveProperty("id");
      expect(roles[0]).toHaveProperty("name");
      expect(roles[0]).toHaveProperty("description");
    });

  }) // end of GET all roles

  
  describe("GET /roles/:id", () => {

    it("should return 403 if the Authorization header is not set", async () => {
      const response = await agent.get("/roles/1")
      expect(response.status).toBe(403);
    })

    it("should return 401 if a standard user makes the request", async () => {
      const response = await agent.get("/roles/1").set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    })
    
    it('should return status 200 and a role (for admins)', async () => {
      const response = await agent.get("/roles/1").set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("name", "Admin");
      expect(response.body).toHaveProperty("description", "Extra permissions");
    });
    
    it('should return a 404 status code if the role id is not valid (for admins)', async () => {
      const response = await agent.get("/roles/1111111").set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(404);
    }); 

  }) // end of GET /roles/:id

  
  describe("POST role", () => {

    it("should return 403 if the Authorization header is not set", async () => {
      // hopefully inserting a new row will not cause another test to fail! // IT DID (getAllRoles)!!!
      const response = await agent.post("/roles/").send({name: "New Role", description: "New role description"});
      expect(response.status).toBe(403);
    });

    it("should return 401 if the request comes from a standard user", async () => {
      // hopefully inserting a new row will not cause another test to fail! // IT DID (getAllRoles)!!!
      const response = await agent.post("/roles/").set("Authorization", `Bearer ${standardUserToken}`).send({name: "New Role", description: "New role description"});
      expect(response.status).toBe(401);
    });

    it("should return 201 and the new role id (for admins)", async () => {
      // hopefully inserting a new row will not cause another test to fail! // IT DID (getAllRoles)!!!
      const response = await agent.post("/roles/").set("Authorization", `Bearer ${adminToken}`).send({name: "New Role", description: "New role description"});
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });
    
    it("should return 400 if role is not valid (for admins)", async () => {
      const response = await agent.post("/roles/").set("Authorization", `Bearer ${adminToken}`).send({name: ""}); // invalid, name is empty string
      expect(response.status).toBe(400);
    });

  }) // end of POST /roles

  
  describe("PUT /roles/:id", () => {

    it("should return 403 if the Authorization header is not set", async () => {
      const response = await agent.put("/roles/3").send({name: "TEST ROLE", description:"This is a test role"})
      expect(response.status).toBe(403);
    });

    it("should return 401 if the request comes from a standard user", async () => {
      const response = await agent.put("/roles/3").set("Authorization", `Bearer ${standardUserToken}`).send({name: "TEST ROLE", description:"This is a test role"});
      expect(response.status).toBe(401);
    });

    it("should return the proper response and successfully update (for admins)", async () => {
      // Insert a role so that we can update it
      const role = {name: "TEST ROLE", description:"This is a test role"};
      let response = await agent.post("/roles/").set("Authorization", `Bearer ${adminToken}`).send(role);
      const roleId = response.body.id;
      role.id = roleId;
     
      // Now do the update
      role.name = "TEST ROLE UPDATED";
      role.description = "Updated description";
      response = await agent.put("/roles/" + roleId).set("Authorization", `Bearer ${adminToken}`).send(role);
      expect(response.status).toBe(200);
 
      // Verify that the update was successful
      const updatedRole = await agent.get("/roles/" + roleId).set("Authorization", `Bearer ${adminToken}`);
      expect(updatedRole.body.name).toBe("TEST ROLE UPDATED");
      expect(updatedRole.body.description).toBe("Updated description");
    })

    it("should return 400 if the role is not valid (for admins)", async () => {
      const response = await agent.put("/roles/1").set("Authorization", `Bearer ${adminToken}`).send({id: "FOO", name: ""}); // name is not valid
      expect(response.status).toBe(400);
    })

    it("should return 400 if id in URL does not match id in body (for admins)", async () => {
      const idToUpdate = 1;
      const response = await agent.put("/roles/" + idToUpdate).set("Authorization", `Bearer ${adminToken}`).send({id: 3, name:"TEST", description:"TEST"}); // ids do NOT match
      expect(response.status).toBe(400);
    })

  }) // end of PUT role

  
  describe("DELETE /roles/:id", () => {

    it("should return 403 if the Authorization header is not set", async () => {
      const response = await agent.delete("/roles/3");
      expect(response.status).toBe(403);
    });

    it("should return 401 if the request comes from a standard user", async () => {
      const response = await agent.delete("/roles/3").set("Authorization", `Bearer ${standardUserToken}`);
      expect(response.status).toBe(401);
    });

    it("should return 200 (for admins)", async () => {
      // insert one and then test to see if we can delete it.
      let response = await agent.post("/roles/").set("Authorization", `Bearer ${adminToken}`).send({name: "TEST ROLE", description: "This is a test role"});
      const idToDelete = response.body.id;

      response = await agent.delete("/roles/" + idToDelete).set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    })

    it("should return 400 if the id does match a role in the database (for admins)", async () => {
      const idToDelete = 111111; // Invalid id
      const response = await agent.delete("/roles/9999").set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).toBe(400);
    })

  }) // end of DELETE role


}) // end of roles/