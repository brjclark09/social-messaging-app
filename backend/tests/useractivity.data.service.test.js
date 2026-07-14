const {getAll, getByUserId, getByActivityType, insert, update, remove} = require("../src/useractivity/useractivity.data.service");
const UserActivity = require("../src/useractivity/useractivity.model");

describe("UserActivity Data Service", ()=>{
  
  describe("getAll()", () => {

    it('should return objects with the following properties: activityId, userId, activityType, activityDescription, activityTimestamp, userName', async () => {
      const activities = await getAll();
      if(activities.length > 0){
        expect(activities[0]).toHaveProperty("activityId");
        expect(activities[0]).toHaveProperty("userId");
        expect(activities[0]).toHaveProperty("activityType");
        expect(activities[0]).toHaveProperty("activityDescription");
        expect(activities[0]).toHaveProperty("activityTimestamp");
        expect(activities[0]).toHaveProperty("userName");
      }
    });

  }) // end of getAll()

  
  describe("getByUserId()", () => {

    it("should get activities for a specific user", async () => {
      const activities = await getByUserId(1);
      expect(Array.isArray(activities)).toBe(true);
      if(activities.length > 0){
        expect(activities[0]).toHaveProperty("userId", 1);
        expect(activities[0]).toHaveProperty("userName");
      }
    })

    it("should throw error if the parameter is not a positive integer", async () => {
      await expect(getByUserId(1.5)).rejects.toThrow(/Invalid parameter/);
      await expect(getByUserId(-1)).rejects.toThrow(/Invalid parameter/);
    })

  }) // end of getByUserId()

  
  describe("getByActivityType()", () => {

    it("should get activities by activity type", async () => {
      const activities = await getByActivityType("login");
      expect(Array.isArray(activities)).toBe(true);
      if(activities.length > 0){
        expect(activities[0]).toHaveProperty("activityType", "login");
        expect(activities[0]).toHaveProperty("userName");
      }
    })

    it("should throw error if the parameter is not a valid string", async () => {
      await expect(getByActivityType("")).rejects.toThrow(/Invalid parameter/);
      await expect(getByActivityType(123)).rejects.toThrow(/Invalid parameter/);
    })

  }) // end of getByActivityType()

  
  describe("insert()", () => {

    it("should return id greater than 0 on successful insert", async () => {
      const activityToInsert = new UserActivity({"userId":1,"activityType":"test","activityDescription":"Test activity from unit test"})
      const activityId = await insert(activityToInsert);
      expect(activityId).toBeGreaterThan(0);

      // get the activity from the database and make sure it matches
      const insertedActivities = await getByUserId(1);
      const insertedActivity = insertedActivities.find(a => a.activityId === activityId);
      expect(insertedActivity).toHaveProperty("activityId", activityId);
      expect(insertedActivity).toHaveProperty("userId", 1);
      expect(insertedActivity).toHaveProperty("activityType", "test");
      expect(insertedActivity).toHaveProperty("activityDescription", "Test activity from unit test");
    })

    it("should throw error if the parameter is not a UserActivity model object", async () => {
      await expect(insert("BLAH")).rejects.toThrow(/Invalid parameter/);
    })
      
    it("should throw error if the UserActivity parameter is not valid", async () => {
      const invalidActivity = new UserActivity({"userId":"invalid","activityType":"test","activityDescription":"Test activity"})
      await expect(insert(invalidActivity)).rejects.toThrow(/Invalid UserActivity/);
    })

  }) // end of insert()

  
  describe("update()", () => {

    it("should return true on successful update", async () => {
      
      const activityToUpdate = new UserActivity({
        "activityId":1,
        "userId":1,
        "activityType":"UPDATED", 
        "activityDescription":"Updated activity description"
      });

      const result = await update(activityToUpdate);
      expect(result).toBe(true);

      // get the activity from the database and make sure it was updated
      const activities = await getByUserId(1);
      const updatedActivity = activities.find(a => a.activityId === 1);
      expect(updatedActivity).toHaveProperty("activityType", "UPDATED");
      expect(updatedActivity).toHaveProperty("activityDescription", "Updated activity description");
    
    })

    it("should throw error if the parameter is not a UserActivity model object", async () => {
      await expect(update("BLAH")).rejects.toThrow(/Invalid parameter/);
    })
      
    it("should throw error if the UserActivity parameter is not valid", async () => {
      const activityToUpdate = new UserActivity({
        "activityId":1,
        "userId":"invalid",
        "activityType":"test",  
        "activityDescription":"Test description"
      });
      await expect(update(activityToUpdate)).rejects.toThrow(/Invalid UserActivity/);
    })

    it("should throw error if there is no matching id", async () => {
      const activityToUpdate = new UserActivity({
        "activityId":999999999,
        "userId":1,
        "activityType":"test",  
        "activityDescription":"Test description"
      });
      await expect(update(activityToUpdate)).rejects.toThrow(/Activity not found/);
    })

  }) // end of update()

  
  describe("remove()", () => {
                
    it("should return true on successful delete", async () => {
      // Insert an activity, so that we have one to delete
      const activityToInsert = new UserActivity({"userId":1,"activityType":"delete_test","activityDescription":"Activity to delete"})
      const activityId = await insert(activityToInsert);

      const result = await remove(activityId);
      expect(result).toBe(true)
    })
    
    it("should return false if there is no matching id", async () => {
      const result = await remove(99999999);
      expect(result).toBe(false);
    })

    it("should throw error if the parameter is not a positive integer", async () => {
      await expect(remove(1.5)).rejects.toThrow(/Invalid parameter/);
      await expect(remove(-1)).rejects.toThrow(/Invalid parameter/);
    })
    
  }) // end of remove()
  
})