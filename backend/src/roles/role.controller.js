const {getAll, getById, insert, update, remove} = require("./role.data.service");
const Role = require("./role.model");

exports.getAllHandler = async (req, res, next) => {
  try{
    //res.json({message: "TODO: get all roles "});
    const allRoles = await getAll();
    res.json(allRoles);
  }catch(err){
    next(err);
  }
}

exports.getByIdHandler = async (req, res, next) => {
  //res.json({message: "TODO: get role with the id of " + req.params.id})
  try{
    const id = Number(req.params.id);
    if(!Number.isInteger(id) || id <= 0){
      res.status(400).json({message:"failed - invalid role id - must be a number greater than 0"});
      return;
    }

    const role = await getById(id);
    if(role){
      res.status(200).json(role);
    }else{
      res.status(404).json({message:"failed - resource not found"});
    }
  }catch(err){
    next(err);
  }
}

exports.insertHandler = async (req, res, next) => {
  //res.json({message: "TODO: add role ", body: req.body});
  try{
    // parse the body of the request into a Role model
    const role = new Role(req.body);

    // validate the model
    const [isValid, errors] = role.validate();
    if(!isValid){
      res.status(400).json({message:"failed - invalid", errors});
      return;
    }

    // insert the role and add the id to the model
    const roleId = await insert(role);
    
    // return the role id
    res.status(201).json({message:"success", id: roleId});

  }catch(err){
    next(err);
  }
}

exports.updateHandler = async (req, res, next) => {
  //res.json({message: "TODO: update role " + req.params.id, body: req.body});
  try{
    const id = req.params.id;

    // make sure the id in the body matches the id in the url
    if(id != req.body?.id){
      res.status(400).json({message:"failed - id mismatch"});
      return;
    }

    // create a role model and validate
    const role = new Role(req.body);
    const [isValid, errors] = role.validate();
    if(!isValid){
      res.status(400).json({message:"failed - invalid", errors});
      return;
    }
  
    // update the role
    const result = await update(role);
    if(result === true){
      res.status(200).json({message:"success"});
    }else{
      res.status(400).json({message:"failed to update"});
    }
  }catch(err){
    next(err);
  }
}

exports.removeHandler = async (req, res, next) => {
  //res.json({message: "TODO: delete role by id - " + req.params.id})
  try{
    
    const id = Number(req.params.id);
    
    if(!Number.isInteger(id) || id <= 0){
      res.status(400).json({message:"failed - invalid role id - must be a number greater than 0"});
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