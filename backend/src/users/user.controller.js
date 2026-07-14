const {getAll, getById, insert, update, remove} = require("./user.data.service");
const User = require("./user.model");

exports.getAllHandler = async (req, res, next) => {
  try{
    //res.json({message: "TODO: get all users "});
    const allUsers = await getAll();
    res.json(allUsers);
  }catch(err){
    next(err);
  }
}

exports.getByIdHandler = async (req, res, next) => {
  //res.json({message: "TODO: get user with the id of " + req.params.id})
  try{
    const id = Number(req.params.id);
    if(!Number.isInteger(id) || id <= 0){
      res.status(400).json({message:"failed - invalid user id - must be a number greater than 0"});
      return;
    }

    // the logged in user must either be an admin, or the owner of the row they are trying to get
    if(req.isAdmin || req.userId == id){
      const user = await getById(id);
      if(user){
        res.status(200).json(user);
      }else{
        res.status(404).json({message:"failed - resource not found"});
      }
    }else{
      res.status(401).json({message:"failed - permission denied"});
      return;
    }
  }catch(err){
    next(err);
  }
}

exports.insertHandler = async (req, res, next) => {
  //res.json({message: "TODO: add user ", body: req.body});
  try{
    // parse the body of the request into a User model
    const user = new User(req.body);

    // validate the model
    const [isValid, errors] = user.validate();
    if(!isValid){
      res.status(400).json({message:"failed - invalid", errors});
      return;
    }

    // insert the user
    const userId = await insert(user);
  
    // return the user id
    res.status(201).json({message:"success", id: userId});

  }catch(err){
    next(err);
  }
}

exports.updateHandler = async (req, res, next) => {
  //res.json({message: "TODO: update user " + req.params.id, body: req.body});
  try{
    const id = req.params.id;

    // make sure the id in the body matches the id in the url
    if(id != req.body?.id){
      res.status(400).json({message:"failed - id mismatch"});
      return;
    }

    // create a user model and validate
    const user = new User(req.body);
    const [isValid, errors] = user.validate();
    if(!isValid){
      res.status(400).json({message:"failed - invalid", errors});
      return;
    }
  
    // the logged in user must either be an admin, or the owner of the row they are trying to update
    if(req.isAdmin || req.userId == id){
      const result = await update(user);
      if(result === true){
        res.status(200).json({message:"success"});
      }else{
        res.status(400).json({message:"failed to update"});
      }
    }else{
      res.status(401).json({message:"failed - permission denied"});
      return;
    }
  }catch(err){
    next(err);
  }
}

exports.removeHandler = async (req, res, next) => {
  //res.json({message: "TODO: delete user by id - " + req.params.id})
  try{
    
    const id = Number(req.params.id);
    
    if(!Number.isInteger(id) || id <= 0){
      res.status(400).json({message:"failed - invalid user id - must be a number greater than 0"});
      return;
    }
    
    const result = await remove(id);
    if(result === true){
      res.status(200).json({message:"success"}); 
    }else{
      res.status(400).json({message:"failed"});
    }
  }catch(err){
    next(err);
  }
}