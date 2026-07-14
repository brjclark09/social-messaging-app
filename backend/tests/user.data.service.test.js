const {getAll, getById, insert, update, remove, setUserPassword} = require("../src/users/user.data.service");
const User = require("../src/users/user.model");

describe("User Data Service", ()=>{
  
  describe("getAll()", () => {
    
    /*
    // THIS TEST MAY FAIL DEPENDING ON THE ORDER IN WHICH THE TESTS RUN
    it('should return 3 users', async () => {
      const users = await getAll();
      expect(users.length).toBe(3);        
    });
    */

    it('should return objects with the following properties: id, firstName, lastName, email, roleId, and active properties', async () => {
      const users = await getAll();
      expect(users[0]).toHaveProperty("id");
      expect(users[0]).toHaveProperty("firstName");
      expect(users[0]).toHaveProperty("lastName");
      expect(users[0]).toHaveProperty("email");
      expect(users[0]).toHaveProperty("roleId");
      expect(users[0]).toHaveProperty("role");
      expect(users[0]).toHaveProperty("active");
    });

  }) // end of getAll()

  
  describe("getById()", () => {

    it("should get the proper user when a valid param is passed", async () => {
      const user = await getById(1);
      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("firstName", "John");
      expect(user).toHaveProperty("lastName", "Doe");
      expect(user).toHaveProperty("email", "john@doe.com");
      expect(user).toHaveProperty("roleId",1);
      expect(user).toHaveProperty("role", "Admin");
      expect(user).toHaveProperty("active", true);
    })

    it("should return null if there is no user with the matching id", async () => {
      const user = await getById(1111111111111);
      expect(user).toBe(null);
    })

    //// NOTE: at one time I had getById() throwing an error if the id was not in the DB
    // it("should throw error if there is no user with the matching id", async () => {
    //   await expect(getById(1111111111111)).rejects.toThrow(/User not found/);
    // })

    it("should throw error if the parameter is not a positive integer", async () => {
      await expect(getById(1.5)).rejects.toThrow(/Invalid parameter/);
      await expect(getById(-1)).rejects.toThrow(/Invalid parameter/);
    })
    

  }) // end of getById()

  
  describe("insert()", () => {

    it("should return id greater than 0 on successful insert", async () => {
      const userToInsert = new User({"firstName":"Lu","lastName":"Smith","email":"xxxx@xxxx.com","roleId":2,"active":true,"password":"password"})
      const userId = await insert(userToInsert);
      expect(userId).toBeGreaterThan(0);

      // get the user from the database and make sure it matches the data in userToInsert
      const insertedUser = await getById(userId);
      expect(insertedUser).toHaveProperty("id", userId);
      expect(insertedUser).toHaveProperty("firstName", "Lu");
      expect(insertedUser).toHaveProperty("lastName", "Smith");
      expect(insertedUser).toHaveProperty("email", "xxxx@xxxx.com");
      expect(insertedUser).toHaveProperty("roleId",2);
      expect(insertedUser).toHaveProperty("role", "Standard User");
      expect(insertedUser).toHaveProperty("active", true);
    })

    it("should throw error if the parameter is not a User model object", async () => {
      // we expect the error message to include 'Invalid parameter'
      await expect(insert("BLAH")).rejects.toThrow(/Invalid parameter/);
    })
      
    it("should throw error if the User parameter is not valid", async () => {
      const invalidUser = new User({"firstName":"Joe","lastName":"Smith","email":"INVALID EMAIL","roleId":2,"active":true})
      await expect(insert(invalidUser)).rejects.toThrow(/Invalid User/); // we expect the error message to include 'Invalid User'
    })

    it("should throw error if the email is already in the database", async () => {
      const userToInsert = new User({"firstName":"x","lastName":"x","email":"duplicate@test.com","roleId":2,"active":true,"password":"password"})
      await expect(insert(userToInsert)).rejects.toThrow(/Duplicate entry/); // Note that MySQL returns a 'Duplicate entry' error
    })

  }) // end of insert()

  
  describe("update()", () => {

    it("should return true on successful update", async () => {
      
      const userToUpdate = new User({
        "id":4,
        "firstName":"UPDATED",
        "lastName":"test", 
        "email":"UPDATED@test.com", 
        "roleId":2, 
        "active": true
      });

      const result = await update(userToUpdate);
      expect(result).toBe(true);

      // get the user from the database and make sure it matches the data in userToUpdate
      const updatedUser = await getById(userToUpdate.id);
      expect(updatedUser).toHaveProperty("id", userToUpdate.id);
      expect(updatedUser).toHaveProperty("firstName", "UPDATED");
      expect(updatedUser).toHaveProperty("lastName", "test");
      expect(updatedUser).toHaveProperty("email", "UPDATED@test.com");
      expect(updatedUser).toHaveProperty("roleId",2);
      expect(updatedUser).toHaveProperty("role", "Standard User");
      expect(updatedUser).toHaveProperty("active", true);
      // expect(updatedUser).toHaveProperty("password", "password");
    
    })

    it("should throw error if the parameter is not a User model object", async () => {
      // we expect the error message to include 'Invalid parameter'
      await expect(update("BLAH")).rejects.toThrow(/Invalid parameter/);
    })
      
    it("should throw error if the User parameter is not valid", async () => {
      const userToUpdate = new User({
        "id":4,
        "firstName":"update",
        "lastName":"test",  
        "email":"INVALID EMAIL",
        "roleId":2, 
        "active": false
      });
      // we expect the error message to include 'Invalid User'
      await expect(update(userToUpdate)).rejects.toThrow(/Invalid User/);
    })

    it("should throw error if there is no matching id", async () => {
      const userToUpdate = new User({
        "id":2222222222,
        "firstName":"Mel",
        "lastName":"Smith",  
        "email":"mel@smith.com",
        "roleId":2, 
        "active": false
      });
      await expect(update(userToUpdate)).rejects.toThrow(/User not found/);
    })

  }) // end of update()
  
  
  describe("remove()", () => {
                
    it("should return true on successful delete", async () => {
      // Insert a user, so that we have one to delete
      const userToInsert = new User({"firstName":"Buster","lastName":"Smith","email":"buster@smith.com","roleId":2,"active":true,"password":"password"})
      const userId = await insert(userToInsert);

      const result = await remove(userId);
      expect(result).toBe(true)
    })
    
    // it("should throw error if there is no matching id", async () => {
    //   await expect(remove(11111111)).rejects.toThrow(/User not found/);
    // })

    it("should return false if there is no matching id", async () => {
      const result = await remove(11111111);
      expect(result).toBe(false);
    })
    
  }) // end of remove()
  
  describe("setUserPassword()", () => {

    it("should throw error if the parameter is not a User model object", async () => {
      await expect(setUserPassword("BLAH")).rejects.toThrow(/Invalid parameter/);
    })

    it("should throw error if the User parameter is not valid", async () => {
      const invalidUser = new User({"firstName":"Joe","lastName":"Smith","email":"INVALID EMAIL","roleId":2,"active":true})
      await expect(setUserPassword(invalidUser)).rejects.toThrow(/Invalid User/);
    })

    it("should return true on successful password change", async () => {
      const user = new User({"firstName":"test","lastName":"setUserPassword","email":"test.setUserPassword@example.com","roleId":2,"active":true, password: "StrongP@ssw0rd!"});
      user.id = await insert(user); //// DON'T FORGET TO SET THE USER ID, OTHERWISE setUserPassword() WILL THROW AN ERROR
      const result = await setUserPassword(user);
      expect(result).toBe(true);
    })

    it("Should throw error if the User ID is not set", async () => {
      const user = new User({"firstName":"test","lastName":"setUserPassword","email":"test.setUserPassword@example.com","roleId":2,"active":true, password: "StrongP@ssw0rd!"});
      //user.id = await insert(user); //// IF YOU FORGET TO SET THE USER ID, IT SHOULD THROW AN ERROR
      await expect(setUserPassword(user)).rejects.toThrow(/Invalid User ID/);
    })

  })
})