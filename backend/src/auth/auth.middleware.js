const {decodeToken} = require("./auth.helpers");

const ADMIN_ROLE_ID = 1; // this is the roleId for admins in the database

// NOTES: 
// A 403 status should be returned if the user never authenticated
// A 401 status should be returned if the user has been authenticated,
exports.isLoggedIn = (req, res, next) => {
  
  const { authorization } = req.headers
  if(!authorization){
    res.status(403).json({message:"No Auth Header"});
    return;
  }
  //console.log("AUTHORIZATION HEADER: ", authorization);
  
  const token = authorization?.substring('Bearer '.length);
  if(!token || token.length < 1){
    res.status(403).json({message:"Invalid Authorization Header"});
    return;
  }
  
  try{
    const {userId, roleId, exp} = decodeToken(token);
    
    const currentTimeInSeconds = Date.now()/1000;
    if(exp < currentTimeInSeconds){
      throw new Error("Token Expired");
    }else{
      // THE TOKEN IS VALID!
      // TODO: you could check to see of the user is still active in the database
      // console.log("User is logged in....");
      // console.log("UserId:", userId);
      // console.log("RoleId:", roleId);
      // console.log("Exp:", new Date(exp).toString());
      
      // Add the userId and the admin status to the request object, to that other route handlers can access it
      req.userId = userId
      req.isAdmin = roleId == ADMIN_ROLE_ID ? true : false;
       
      next();
      return;
    } 
  }catch(err){
    // Note that decodeToken() throws a 'jwt malformed' error if the param is not a valid token
    // and it throws a 'jwt expired' if the token is expired
    if(err.message === "jwt malformed"){
      res.status(403).json({message:"Invalid Token"})
      return;
    }else if(err.message === "jwt expired"){
      res.status(401).json({message:"Token has expired"})
      return;
    }

    res.status(500).json({message:"Server Error"});
  }
}

// NOTE: It would be wise research when this handler should return a status of 401 vs 403
exports.isAdmin = (req, res, next) => {
    
  const { authorization } = req.headers
  if(!authorization){
    res.status(403).json({message:"No Auth Header"});
    return;
  }
  //console.log("AUTHORIZATION HEADER: ", authorization);
  
  const token = authorization?.substring('Bearer '.length);
  if(!token || token.length < 1){
    res.status(403).json({message:"Invalid Authorization Header"});
    return;
  }
  
  try{
    const {userId, roleId, exp} = decodeToken(token);
    const currentTimeInSeconds = Date.now()/1000;
    if(exp < currentTimeInSeconds){
      throw new Error("Token expired");
    }

    // TODO: you could check to see of the user is still active in the database
    
    // Make sure the user is an admin (roleId = 1)
    if(roleId === ADMIN_ROLE_ID){
      // THE TOKEN IS VALID AND THE ROLE IS ADMIN!
      // Add the userId and an admin flag to the request object, to that other route handlers can access it
      req.userId = userId;
      req.isAdmin = true
      next();
    }else{
      res.status(401).json({message:"Not Authorized - Admins only"});
    }
    
  }catch(err){
    // Note that decodeToken() throws a 'jwt malformed' error if the param is not a valid token
    // and it throws a 'jwt expired' if the token is expired
    if(err.message === "jwt malformed"){
      res.status(403).json({message:"Invalid Token"})
      return;
    }else if(err.message === "jwt expired"){
      res.status(401).json({message:"Token has expired"})
      return;
    }

    res.status(500).json({message:"Server Error"});
  }
}