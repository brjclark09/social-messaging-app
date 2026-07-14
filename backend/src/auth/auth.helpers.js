const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 8; 
// here's an explanation of salt rounds: https://stackoverflow.com/questions/46693430/what-are-salt-rounds-and-how-are-salts-stored-in-bcrypt

const generateRandomSalt = async () => {
    
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  //The length of the salt appears to be 29 characters (if it's longer then it will be truncated in the db)
  return salt;
}

const saltPassword = (salt, password) => {
    return salt + password + salt;
}

const saltAndHashPassword = async (salt,password) => {
    const saltedPassword = saltPassword(salt, password)
    return await bcrypt.hash(saltedPassword, SALT_ROUNDS);
}

const verifyPassword = async (password, salt, hashedPassword) => {
    const saltedPassword = saltPassword(salt, password);
    const result = await bcrypt.compare(saltedPassword, hashedPassword);
    return result;
}

/*
JWT Summary:
When a user authenticates (logs in) we'll generate a JWT that
contains the user's ID and role ID. We'll encrypt the token
by using a secret env variable, named JWT_SECRET (note that ideally
we would not put this variable in our code base).
Then we'll send the encrypted token to the user's client in the
HTTP Authorization header. The client will then have to send this
header in every subsequent request that it makes. This allows us
to verify that the request is coming from the authenticated user.
We'll verify that the token is using our secret, and then we can
extract the user id and role id from it so that we know who is making
the request.
*/

const getToken = (userId, roleId) => {
  const token = jwt.sign(
      {userId, roleId}, // here's the payload, it has a 'userId' prop and a 'roleId' prop
      process.env.JWT_SECRET, 
      {expiresIn: process.env.JWT_EXPIRES_IN} 
  );

  return token;
}

const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = {
  generateRandomSalt,
  saltPassword, // we could keep this private (but then we couldn't test it)
  saltAndHashPassword, 
  verifyPassword,
  getToken,
  decodeToken
}