const UserMessages = require("../src/usermessages/usermessages.model");

describe("UserMessages Model", () => {

  describe("Constructor", () => {

    it("should set the instance variables properly", ()=>{
      const message = new UserMessages({messageId:1, senderId:1, recipientId:2, messageText:"Hello there", sentAt: new Date()});
      expect(message.messageId).toBe(1);
      expect(message.senderId).toBe(1);
      expect(message.recipientId).toBe(2);
      expect(message.messageText).toBe("Hello there");
      expect(message.sentAt).toBeInstanceOf(Date);
    })

  })

  describe("validate", () => {
    it("should return proper values if all properties are valid", () => {
      const message = new UserMessages({messageId:1, senderId:1, recipientId:2, messageText:"Hello there"});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(true);
      expect(errs).toEqual({});
    })

    it("should return false if the messageId is not a number", () => {
      const message = new UserMessages({messageId:"invalid", senderId:1, recipientId:2, messageText:"Hello there"});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("messageId", "The message id must be a number");
    });

    it("should return false if the senderId is not a number", () => {
      const message = new UserMessages({messageId:1, senderId:"invalid", recipientId:2, messageText:"Hello there"});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("senderId", "The sender id must be a number");
    });

    it("should return false if the senderId is not greater than 0", () => {
      const message = new UserMessages({messageId:1, senderId:0, recipientId:2, messageText:"Hello there"});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("senderId", "The sender id must be greater than 0");
    });

    it("should return false if the recipientId is not a number", () => {
      const message = new UserMessages({messageId:1, senderId:1, recipientId:"invalid", messageText:"Hello there"});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("recipientId", "The recipient id must be a number");
    });

    it("should return false if the recipientId is not greater than 0", () => {
      const message = new UserMessages({messageId:1, senderId:1, recipientId:0, messageText:"Hello there"});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("recipientId", "The recipient id must be greater than 0");
    });

    it("should return false if the messageText is empty", () => {
      const message = new UserMessages({messageId:1, senderId:1, recipientId:2, messageText:""});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("messageText", "Message text is required");
    });

    it("should return false if the messageText is longer than 1000 characters", () => {
      const message = new UserMessages({messageId:1, senderId:1, recipientId:2, messageText:"x".repeat(1001)});
      const [isValid, errs] = message.validate();
      expect(isValid).toBe(false);
      expect(errs).toHaveProperty("messageText", "Message text must be 1000 characters or less");
    });

  })

})