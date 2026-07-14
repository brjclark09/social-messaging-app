const pool = require("../db");
const {verifyPassword} = require("./auth.helpers")
//const User = require("../users/user.model");
const {getById: getUserById} = require("../users/user.data.service");


// Before testing this in the dev environment, we need to update the salt and passwords in the dev database:
// UPDATE users SET user_password = '$2a$08$zvWApJkRSK1124iESJU5Puo9mUelLn3sgy9A.dPSySghLe7MMGGGS', user_salt = 'xxx';

// NOTE that this update statement is already being used in the script that sets up the 
// test database (look near the bottom of setup-test-database.sql)

// Other things we may need to add to this module/component:
// signupUser
// changeUserPassword
// forgotPassword

exports.authenticateUser = async (email, password) => {
  const connection = await pool.getConnection();
  const sql = "SELECT user_id, user_salt, user_password, user_active FROM users WHERE user_email = ?";
  const [rows] = await pool.query(sql, [email]);
  connection.release();

  if(rows.length !== 1){
    throw new Error("User not found: " + email);
    return;
  }
      
  const userId = rows[0].user_id;
  const salt = rows[0].user_salt;
  const hashedPassword = rows[0].user_password;
  const active = rows[0].user_active === 1 ? true : false;

  if(active === false){
    throw new Error("User not active: " + email);
    return;
  }

  // Note - I forgot to use 'await' and it caused me problems! (thank goodness for unit testing!)
  if(await verifyPassword(password, salt, hashedPassword)){
    return await getUserById(userId);
  }else{
    throw new Error("Invalid password");
    return;
  }

}