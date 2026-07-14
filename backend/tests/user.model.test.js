const User = require("../src/users/user.model");

describe("User Model", () => {

  describe("Constructor", () => {

    it("should set the instance variables properly", ()=>{
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, role:"Admin", active:true});
      expect(user.id).toBe(1);
      expect(user.firstName).toBe("Bob");
      expect(user.lastName).toBe("Smith");
      expect(user.email).toBe("xx@xx.com");
      expect(user.roleId).toBe(1);
      expect(user.role).toBe("Admin");
      expect(user.active).toBe(true);
    })

  })

  describe("validate", () => {
    it("should return proper values if all properties are valid", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, role:"Admin", active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(true);
      expect(errs).toEqual({});
      //console.log("user json", JSON.stringify(user));
    })

    it("should return false if the firstName is empty", () => {
      const user = new User({id:1, firstName:"", lastName:"Smith", email: "xx@xx.com", roleId:1, role:"Admin", active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("firstName", "First name is required");
    });

    it("should return false if the firstName is longer than 30 characters", () => {
      const user = new User({id:1, firstName: "x".repeat(31), lastName:"Smith", email:"xx@xx.com", role:"Admin", roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("firstName", "First name must be 30 characters or less");
    })


    it("should return false if the lastName is empty", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"", email: "xx@xx.com", roleId:1, role:"Admin", active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("lastName", "Last name is required");
    });

    it("should return false if the lastName is longer than 30 characters", () => {
      const user = new User({id:1, firstName: "Bob", lastName:"x".repeat(31), email:"xx@xx.com", role:"Admin", roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("lastName", "Last name must be 30 characters or less");
    })


    it("should return false if the email is empty", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "", roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("email", "Email is required");
    })

    it("should return false if the email is not a valid email address", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xxxxxxxxx", roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("email", "Email is not valid");
    })

    it("should return false if the email is longer than 255 characters", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com" + "x".repeat(256), roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("email", "Email must be 255 characters or less");
    })

    /*
    it("password is NOT required if the user id > 0 (this indicates that the password is not being changed)", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(true);
    })

    it("password IS required if the user is being inserted (no user ID)", () => {
      const user = new User({firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("password");
    })

    // TODO: add tests to make sure password is strong
    */

    it("should return false if the roleId is not a number", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:"xxx", active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("roleId", "The role id must be a number");
    });

    it("should return false if the roleId is not a number greater than or equal to 0", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:-1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("roleId", "The role id must be a number from 1 - 3");
    });

    it("should return false if the roleId is not a number less than or equal to 3", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:4, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("roleId", "The role id must be a number from 1 - 3");
    });

    it("should return false if the active property is not a boolean", () => {
      const user = new User({id:1, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:"xxx"});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("active","The active field must be a boolean");
    });

    it("should return false if the password is missing when creating a new user (id of 0)", () => {
      const user = new User({id:0, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("password", "Password is required when creating a new user");
    });

    it("should return false if the password is too short when creating a new user (id of 0)", () => {
      const user = new User({id:0, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true, password: "short"});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("password", "Password must be at least 8 characters");
    });

    it("should return false if the password is too short when updating a user (id > 0)", () => {
      const user = new User({id:4, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true, password: "short"});
      const [isValid, errs] = user.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("password", "Password must be at least 8 characters");
    });

  })

})