const {getAll, getMessagesBySender, getMessagesByRecipient, getMessagesBetweenUsers, insert, remove} = require("../src/usermessages/usermessages.data.service");
const UserMessages = require("../src/usermessages/usermessages.model");

describe("UserMessages Data Service", ()=>{
  
  describe("getAll()", () => {

    it('should return objects with the following properties: messageId, senderId, recipientId, messageText, sentAt, senderName, recipientName', async () => {
      const messages = await getAll();
      if(messages.length > 0){
        expect(messages[0]).toHaveProperty("messageId");
        expect(messages[0]).toHaveProperty("senderId");
        expect(messages[0]).toHaveProperty("recipientId");
        expect(messages[0]).toHaveProperty("messageText");
        expect(messages[0]).toHaveProperty("sentAt");
        expect(messages[0]).toHaveProperty("senderName");
        expect(messages[0]).toHaveProperty("recipientName");
      }
    });

  }) // end of getAll()

  
  describe("getMessagesBySender()", () => {

    it("should get messages sent by a specific user", async () => {
      const messages = await getMessagesBySender(1);
      expect(Array.isArray(messages)).toBe(true);
      if(messages.length > 0){
        expect(messages[0]).toHaveProperty("senderId", 1);
        expect(messages[0]).toHaveProperty("recipientName");
      }
    })

    it("should throw error if the parameter is not a positive integer", async () => {
      await expect(getMessagesBySender(1.5)).rejects.toThrow(/Invalid parameter/);
      await expect(getMessagesBySender(-1)).rejects.toThrow(/Invalid parameter/);
    })

  }) // end of getMessagesBySender()

  
  describe("getMessagesByRecipient()", () => {

    it("should get messages received by a specific user", async () => {
      const messages = await getMessagesByRecipient(2);
      expect(Array.isArray(messages)).toBe(true);
      if(messages.length > 0){
        expect(messages[0]).toHaveProperty("recipientId", 2);
        expect(messages[0]).toHaveProperty("senderName");
      }
    })

    it("should throw error if the parameter is not a positive integer", async () => {
      await expect(getMessagesByRecipient(1.5)).rejects.toThrow(/Invalid parameter/);
      await expect(getMessagesByRecipient(-1)).rejects.toThrow(/Invalid parameter/);
    })

  }) // end of getMessagesByRecipient()

  
  describe("getMessagesBetweenUsers()", () => {

    it("should get messages between two specific users", async () => {
      const messages = await getMessagesBetweenUsers(1, 2);
      expect(Array.isArray(messages)).toBe(true);
      if(messages.length > 0){
        expect(messages[0]).toHaveProperty("senderName");
        expect(messages[0]).toHaveProperty("recipientName");
      }
    })

    it("should throw error if parameters are not positive integers", async () => {
      await expect(getMessagesBetweenUsers(1.5, 2)).rejects.toThrow(/Invalid parameters/);
      await expect(getMessagesBetweenUsers(1, -1)).rejects.toThrow(/Invalid parameters/);
    })

  }) // end of getMessagesBetweenUsers()

  
  describe("insert()", () => {

    it("should return id greater than 0 on successful insert", async () => {
      const messageToInsert = new UserMessages({"senderId":1,"recipientId":2,"messageText":"Test message from unit test"})
      const messageId = await insert(messageToInsert);
      expect(messageId).toBeGreaterThan(0);
    })

    it("should throw error if the parameter is not a UserMessages model object", async () => {
      await expect(insert("BLAH")).rejects.toThrow(/Invalid parameter/);
    })
      
    it("should throw error if the UserMessages parameter is not valid", async () => {
      const invalidMessage = new UserMessages({"senderId":"invalid","recipientId":2,"messageText":"Test message"})
      await expect(insert(invalidMessage)).rejects.toThrow(/Invalid UserMessages/);
    })

  }) // end of insert()

  
  describe("remove()", () => {
                
    it("should return true on successful delete", async () => {
      // Insert a message, so that we have one to delete
      const messageToInsert = new UserMessages({"senderId":1,"recipientId":2,"messageText":"Message to delete"})
      const messageId = await insert(messageToInsert);

      const result = await remove(messageId);
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