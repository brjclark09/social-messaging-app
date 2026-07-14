const {authenticateUser} = require("./auth.data.service")
const {getToken, decodeToken} = require("./auth.helpers");

exports.loginHandler = async (req, res, next) => {
  try{
    const {email,password} = req.body;
    const user = await authenticateUser(email, password);
    
    const token = getToken(user.id, user.roleId);
    res.setHeader("Authorization","Bearer " + token);

    res.json(user);
  }catch(err){
    if(err.message.startsWith("Invalid password") || err.message.startsWith("User not found") || err.message.startsWith("User not active")){
      // NOTE: we should log invalid login attempts so that we can collect info about possible hack attacks!
      res.status(401).json({message:"invalid login"});
    }else{
      next(err);
    }
  }
}

exports.logoutHandler = async (req, res, next) => {
  try{
    res.json({message:"TODO: log out"});
  }catch(err){
    next(err);
  }
}
