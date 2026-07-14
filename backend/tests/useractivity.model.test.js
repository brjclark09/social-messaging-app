const UserActivity = require("../src/useractivity/useractivity.model");

describe("UserActivity Model", () => {

  describe("Constructor", () => {

    it("should set the instance variables properly", ()=>{
      const activity = new UserActivity({activityId:1, userId:1, activityType:"login", activityDescription:"User logged in", activityTimestamp: new Date()});
      expect(activity.activityId).toBe(1);
      expect(activity.userId).toBe(1);
      expect(activity.activityType).toBe("login");
      expect(activity.activityDescription).toBe("User logged in");
      expect(activity.activityTimestamp).toBeInstanceOf(Date);
    })

  })

  describe("validate", () => {
    it("should return proper values if all properties are valid", () => {
      const activity = new UserActivity({activityId:1, userId:1, activityType:"login", activityDescription:"User logged in"});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(true);
      expect(errs).toEqual({});
    })

    it("should return false if the activityId is not a number", () => {
      const activity = new UserActivity({activityId:"invalid", userId:1, activityType:"login", activityDescription:"User logged in"});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("activityId", "The activity id must be a number");
    });

    it("should return false if the userId is not a number", () => {
      const activity = new UserActivity({activityId:1, userId:"invalid", activityType:"login", activityDescription:"User logged in"});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("userId", "The user id must be a number");
    });

    it("should return false if the userId is not greater than 0", () => {
      const activity = new UserActivity({activityId:1, userId:0, activityType:"login", activityDescription:"User logged in"});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("userId", "The user id must be greater than 0");
    });

    it("should return false if the activityType is empty", () => {
      const activity = new UserActivity({activityId:1, userId:1, activityType:"", activityDescription:"User logged in"});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("activityType", "Activity type is required");
    });

    it("should return false if the activityType is longer than 50 characters", () => {
      const activity = new UserActivity({activityId:1, userId:1, activityType:"x".repeat(51), activityDescription:"User logged in"});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("activityType", "Activity type must be 50 characters or less");
    });

    it("should return false if the activityDescription is longer than 1000 characters", () => {
      const activity = new UserActivity({activityId:1, userId:1, activityType:"login", activityDescription:"x".repeat(1001)});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("activityDescription", "Activity description must be 1000 characters or less");
    });

    it("should return true if activityDescription is empty (optional field)", () => {
      const activity = new UserActivity({activityId:1, userId:1, activityType:"login", activityDescription:""});
      const [isValid, errs] = activity.validate();
      expect(isValid).toBe(true);
      expect(errs).toEqual({});
    });

  })

})