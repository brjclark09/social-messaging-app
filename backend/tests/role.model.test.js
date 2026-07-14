const Role = require("../src/roles/role.model");

describe("Role Model", () => {
  describe("constructor", () => {
    it("should set the instance variables properly", () => {
      const role = new Role({ id: 1, name: "Admin", description: "Extra permissions" });
      expect(role.id).toBe(1);
      expect(role.name).toBe("Admin");
      expect(role.description).toBe("Extra permissions");
    });

    it("should set default values if not provided", () => {
      const role = new Role({ name: "Admin" });
      expect(role.id).toBe(0);
      expect(role.name).toBe("Admin");
      expect(role.description).toBe("");
    });
  });

  describe("validate", () => {
    it("should return true if all properties are valid", () => {
      const role = new Role({ id: 1, name: "Admin", description: "Extra permissions" });
      const [isValid, errs] = role.validate();
      expect(isValid).toBe(true);
      expect(errs).toEqual({});
    });

    it("should return false if id is not a number", () => {
      const role = new Role({ id: "xxx", name: "Admin", description: "Extra permissions" });
      const [isValid, errs] = role.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("id", "The role id must be an integer number");
    });

    it("should return false if id is not an integer", () => {
      const role = new Role({ id: 1.5, name: "Admin", description: "Extra permissions" });
      const [isValid, errs] = role.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("id", "The role id must be an integer number");
    });

    it("should return false if id is less than 0", () => {
      const role = new Role({ id: -1, name: "Admin", description: "Extra permissions" });
      const [isValid, errs] = role.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("id", "The role id must be 0 or greater");
    });

    it("should return false if name is empty", () => {
      const role = new Role({ id: 1, name: "", description: "Extra permissions" });
      const [isValid, errs] = role.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("name", "Name is required");
    });

    it("should return false if name is longer than 30 characters", () => {
      const role = new Role({ id: 1, name: "x".repeat(31), description: "Extra permissions" });
      const [isValid, errs] = role.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("name", "Name must be 30 characters or less");
    });

    it("should return false if description is longer than 255 characters", () => {
      const role = new Role({ id: 1, name: "Admin", description: "x".repeat(256) });
      const [isValid, errs] = role.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("description", "Description must be 255 characters or less");
    });
  });
});