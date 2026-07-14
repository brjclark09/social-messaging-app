const {getAll, getByUserId, getByActivityType, insert, update, remove} = require("./useractivity.data.service");
const UserActivity = require("./useractivity.model");

exports.getAllHandler = async (req, res, next) => {
  try{
    const allActivities = await getAll();
    res.json(allActivities);
  }catch(err){
    next(err);
  }
}

exports.getByUserIdHandler = async (req, res, next) => {
  try{
    const userId = Number(req.params.userId);
    if(!Number.isInteger(userId) || userId <= 0){
      res.status(400).json({message:"failed - invalid user id - must be a number greater than 0"});
      return;
    }

    // the logged in user must either be an admin, or viewing their own activities
    if(req.isAdmin || req.userId == userId){
      const activities = await getByUserId(userId);
      res.status(200).json(activities);
    }else{
      res.status(401).json({message:"failed - permission denied"});
      return;
    }
  }catch(err){
    next(err);
  }
}

exports.getByActivityTypeHandler = async (req, res, next) => {
  try{
    const activityType = req.params.activityType;
    if(!activityType || typeof activityType !== 'string'){
      res.status(400).json({message:"failed - invalid activity type"});
      return;
    }

    const activities = await getByActivityType(activityType);
    res.status(200).json(activities);
  }catch(err){
    next(err);
  }
}

exports.insertHandler = async (req, res, next) => {
  try{
    // parse the body of the request into a UserActivity model
    const activity = new UserActivity(req.body);

    // the logged in user must either be an admin, or creating an activity for themselves
    if(!req.isAdmin && req.userId != activity.userId){
      res.status(401).json({message:"failed - permission denied - can only create activities for yourself"});
      return;
    }

    // validate the model
    const [isValid, errors] = activity.validate();
    if(!isValid){
      res.status(400).json({message:"failed - invalid", errors});
      return;
    }

    // insert the activity
    const activityId = await insert(activity);
  
    // return the activity id
    res.status(201).json({message:"success", id: activityId});

  }catch(err){
    next(err);
  }
}

exports.updateHandler = async (req, res, next) => {
  try{
    const activityId = req.params.activityId;

    // make sure the id in the body matches the id in the url
    if(activityId != req.body?.activityId){
      res.status(400).json({message:"failed - id mismatch"});
      return;
    }

    // create an activity model and validate
    const activity = new UserActivity(req.body);
    const [isValid, errors] = activity.validate();
    if(!isValid){
      res.status(400).json({message:"failed - invalid", errors});
      return;
    }
  
    // the logged in user must either be an admin, or updating their own activity
    if(req.isAdmin || req.userId == activity.userId){
      const result = await update(activity);
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
  try{
    
    const activityId = Number(req.params.activityId);
    
    if(!Number.isInteger(activityId) || activityId <= 0){
      res.status(400).json({message:"failed - invalid activity id - must be a number greater than 0"});
      return;
    }
    
    const result = await remove(activityId);
    if(result === true){
      res.status(200).json({message:"success"}); 
    }else{
      res.status(400).json({message:"failed"});
    }
  }catch(err){
    next(err);
  }
}