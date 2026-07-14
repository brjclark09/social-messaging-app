const {getAll, getMessagesBySender, getMessagesByRecipient, getMessagesBetweenUsers, insert, remove} = require("./usermessages.data.service");
const UserMessages = require("./usermessages.model");

exports.getAllHandler = async (req, res, next) => {
  try{
    const allMessages = await getAll();
    res.json(allMessages);
  }catch(err){
    next(err);
  }
}

exports.getMessagesBySenderHandler = async (req, res, next) => {
  try{
    const senderId = Number(req.params.senderId);
    if(!Number.isInteger(senderId) || senderId <= 0){
      res.status(400).json({message:"failed - invalid sender id - must be a number greater than 0"});
      return;
    }

    // the logged in user must either be an admin, or the sender themselves
    if(req.isAdmin || req.userId == senderId){
      const messages = await getMessagesBySender(senderId);
      res.status(200).json(messages);
    }else{
      res.status(401).json({message:"failed - permission denied"});
      return;
    }
  }catch(err){
    next(err);
  }
}

exports.getMessagesByRecipientHandler = async (req, res, next) => {
  try{
    const recipientId = Number(req.params.recipientId);
    if(!Number.isInteger(recipientId) || recipientId <= 0){
      res.status(400).json({message:"failed - invalid recipient id - must be a number greater than 0"});
      return;
    }

    // the logged in user must either be an admin, or the recipient themselves
    if(req.isAdmin || req.userId == recipientId){
      const messages = await getMessagesByRecipient(recipientId);
      res.status(200).json(messages);
    }else{
      res.status(401).json({message:"failed - permission denied"});
      return;
    }
  }catch(err){
    next(err);
  }
}

exports.getMessagesBetweenUsersHandler = async (req, res, next) => {
  try{
    const userId1 = Number(req.params.userId1);
    const userId2 = Number(req.params.userId2);
    
    if(!Number.isInteger(userId1) || userId1 <= 0 || !Number.isInteger(userId2) || userId2 <= 0){
      res.status(400).json({message:"failed - invalid user ids - must be numbers greater than 0"});
      return;
    }

    // the logged in user must either be an admin, or one of the two users in the conversation
    if(req.isAdmin || req.userId == userId1 || req.userId == userId2){
      const messages = await getMessagesBetweenUsers(userId1, userId2);
      res.status(200).json(messages);
    }else{
      res.status(401).json({message:"failed - permission denied"});
      return;
    }
  }catch(err){
    next(err);
  }
}

exports.insertHandler = async (req, res, next) => {
  try{
    // parse the body of the request into a UserMessages model
    const message = new UserMessages(req.body);

    // the logged in user must either be an admin, or the sender of the message
    if(!req.isAdmin && req.userId != message.senderId){
      res.status(401).json({message:"failed - permission denied - can only send messages as yourself"});
      return;
    }

    // validate the model
    const [isValid, errors] = message.validate();
    if(!isValid){
      res.status(400).json({message:"failed - invalid", errors});
      return;
    }

    // insert the message
    const messageId = await insert(message);
  
    // return the message id
    res.status(201).json({message:"success", id: messageId});

  }catch(err){
    next(err);
  }
}

exports.removeHandler = async (req, res, next) => {
  try{
    
    const messageId = Number(req.params.messageId);
    
    if(!Number.isInteger(messageId) || messageId <= 0){
      res.status(400).json({message:"failed - invalid message id - must be a number greater than 0"});
      return;
    }
    
    const result = await remove(messageId);
    if(result === true){
      res.status(200).json({message:"success"}); 
    }else{
      res.status(400).json({message:"failed"});
    }
  }catch(err){
    next(err);
  }
}