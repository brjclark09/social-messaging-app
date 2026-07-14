const { getAll, getById, insert, update, remove } = require("../src/roles/role.data.service");
const Role = require("../src/roles/role.model");

/*
// This was my attempt to force the tests to exit:

afterAll(async () => {
  const pool = require("../src/db");
  await pool.end();
});

// My thought was that the connection pool was not getting closed,
// which was not allowing the tests to finish, so I tried ending
// the pool manually afterAll the tests in the suite complete.
// BUT: then I learned how to set the --forceExit option for jest 
// in the package.json file (it's weird), and that took care of the problem.
// BTW: I needed the tests to exit for when I was using Docker
*/

describe("Role Data Service", () => {
 
  describe("getAll()", () => {
    // it("should return 2 roles", async () => {
    //   const roles = await getAll();
    //   expect(roles.length).toBe(2); // this could fail, depending on the order in which the tests run
    // });

    it("should return objects with the following properties: id, name, and description", async () => {      
      const roles = await getAll();
      expect(roles[0]).toHaveProperty("id");
      expect(roles[0]).toHaveProperty("name");
      expect(roles[0]).toHaveProperty("description");
    });

   
  });
  
  describe("getById()", () => {
    
    it("should return the role correctly", async () => {
      // RESPONSE SHOULD BE:{ id: 1, name: "Admin", description: "Extra permissions" });
      const role = await getById(1);
      expect(role).toHaveProperty("id", 1);
      expect(role).toHaveProperty("name", "Admin");
      expect(role).toHaveProperty("description", "Extra permissions");
    });


    // I'm not sure if I should make getById() return null or throw an error!
    
    // If it returns null this is the proper test:
    it("should return null when no role exists with the given id", async () => {
      const role = await getById(111111);
      expect(role).toBeNull();
    });

    
    //// Here's the test for if it should return an error
    //it("should throw an error when no role exists with the given id", async () => {
    //  await expect(getById(111111)).rejects.toThrow(/Role not found/);
    //});
    
  });

  describe("insert()", () => {
    it("should insert a new role and return its id", async () => {
      const role = new Role({ name: "New Role", description: "New role description" });
      const roleId = await insert(role);
      expect(roleId).toBeGreaterThan(0);
    });

    it("should throw an error when inserting a role with invalid data", async () => {
      const role = new Role({ name: "", description: "New role description" });
      await expect(insert(role)).rejects.toThrow(/Invalid Role/);
    });
  });

  
  describe("update()", () => {

    it("should update an existing role and return true", async () => {
      const role = new Role({name: "TEST ROLE", description: "This is a test role" });
      role.id = await insert(role);
      role.name = "TEST ROLE UPDATED";
      const result = await update(role);
      expect(result).toBe(true);
      // check that the role was updated in the database
      const updatedRole = await getById(role.id);
      expect(updatedRole.name).toBe("TEST ROLE UPDATED");
    });

    it("should throw an error when updating a role with invalid data", async () => {
      const role = new Role({ id: 1, name: "", description: "New role description" });
      await expect(update(role)).rejects.toThrow(/Invalid Role/);
    });
  });

  
  describe("remove()", () => {
    it("should remove an existing role and return true", async () => {
      const role = new Role({name: "TEST ROLE", description: "This is a test role" });
      role.id = await insert(role);
      const result = await remove(role.id);
      expect(result).toBe(true);
      
      // check that the role was removed from the database (assumes that getById() will throw an error rather than return null)
      // await expect(getById(role.id)).rejects.toThrow(/Role not found/);
      expect(await getById(role.id)).toBeNull();
    });

    // it("should throw an error when removing a non-existent role id", async () => {
    //   await expect(remove(111111)).rejects.toThrow(/Role not found/);
    // });

    it("should return false when removing a non-existent role id", async () => {
      const result = await remove(111111);
      expect(result).toBe(false);
    });
  });
  
});