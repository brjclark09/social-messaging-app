class UserMessages {
  
  constructor({messageId, senderId, recipientId, messageText, sentAt}){
    this.messageId = messageId || 0;
    this.senderId = senderId;
    this.recipientId = recipientId;
    this.messageText = messageText;
    this.sentAt = sentAt;
  }

  validate(){
    
    const errorMessages = {};
    let isValid = true;

    // validate messageId
    // Note that an id of 0 indicates that the message has not yet been created in the database
    if(isNaN(this.messageId)){
      errorMessages.messageId = "The message id must be a number";
      isValid = false;
    }else if((this.messageId >= 0) == false){
      errorMessages.messageId = "The message id must be 0 or greater";
      isValid = false;
    }

    // validate senderId
    if(typeof this.senderId != "number"){
      isValid = false;
      errorMessages.senderId = "The sender id must be a number";
    }else if(this.senderId <= 0){
      isValid = false;
      errorMessages.senderId = "The sender id must be greater than 0";
    }

    // validate recipientId
    if(typeof this.recipientId != "number"){
      isValid = false;
      errorMessages.recipientId = "The recipient id must be a number";
    }else if(this.recipientId <= 0){
      isValid = false;
      errorMessages.recipientId = "The recipient id must be greater than 0";
    }

    // validate messageText
    if(!this.messageText){
      errorMessages.messageText = "Message text is required";
      isValid = false;
    }else if(this.messageText.length > 1000){
      errorMessages.messageText = "Message text must be 1000 characters or less";
      isValid = false;
    }
    
    return [isValid, errorMessages]

  }

}

module.exports = UserMessages;