const pool = require("../db");
const User = require("./user.model");
const { createDefaultPreferences } = require("../userpreferences/userpreferences.data.service");
const {generateRandomSalt, saltAndHashPassword} = require("../auth/auth.helpers");

exports.getAll = async () => {
  let connection = null;

  try {
    
    // Note: we will not include the password and salt in the query results
    connection = await pool.getConnection();
    const sql = `
      SELECT 
        U.user_id,
        U.user_first_name,
        U.user_last_name,
        U.user_email,
        U.user_active,
        U.user_role_id,
        UR.user_role_name
      FROM users U
      INNER JOIN user_roles UR ON U.user_role_id = UR.user_role_id
    `;
    
    const [rows] = await connection.query(sql);

    return rows.map(r => new User({
      id: r.user_id,
      firstName: r.user_first_name,
      lastName: r.user_last_name,
      email: r.user_email,
      roleId: r.user_role_id,
      role: r.user_role_name,
      active: r.user_active === 1 ? true : false, //MySQL stores booleans as a tiny int (0=false and 1-9=true)
    }));

  } catch (error) {
    
    //console.log('Error fetching users:', error.message); // use logging package???
    //throw new Error('Failed to fetch users');
    throw(error);

  } finally {

    connection?.release();
  
  }
};


exports.getById = async (id) => {
  
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid parameter sent to getById() - must be a positive integer");  
  }

  let connection = null;

  try{

    // Note: we will not include the password and salt in the query results
    connection = await pool.getConnection();
    
    const sql = `SELECT 
                    U.user_id,
                    U.user_first_name,
                    U.user_last_name,
                    U.user_email,
                    U.user_active,
                    U.user_role_id,
                    UR.user_role_name
                FROM users U
                INNER JOIN user_roles UR ON U.user_role_id = UR.user_role_id
                WHERE U.user_id = ?`;

    const [rows] = await pool.query(sql, [id]);

    if(rows.length === 0){
      return null; // should we throw an error here, or return null???
    }else{
      return new User({
        id: rows[0].user_id,
        firstName: rows[0].user_first_name,
        lastName: rows[0].user_last_name,
        email: rows[0].user_email,
        roleId: rows[0].user_role_id,
        role: rows[0].user_role_name,
        active: rows[0].user_active === 1 ? true : false
      });
    }
    
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.insert = async (user) => {
  
  if(user === null){
    throw new Error("Invalid parameter sent to insertUser() - cannot be null");
  }
  
  // make sure that the param is an instance of a User model object
  if(user.constructor.name !== "User"){
    throw new Error("Invalid parameter sent to insert() - must be a User model object")
  }

  // make sure the user param is valid
  const [isValid, errs] = user.validate()

  if(!isValid){
    throw new Error("Invalid User - " + JSON.stringify(errs));
  }

  let connection = null;
  try{

    connection = await pool.getConnection();

    /*
    // TODO: the auth module will generate the salt and hash the password, for now we'll just fake it
    //user.salt = "xxx";    
    //user.password = "xxx"; // THIS WAS WIPING OUT WHAT THE USER ENTERED FOR THEIR PASSWORD!
     
    const sql = `INSERT INTO users (user_first_name,user_last_name, user_email, user_password, user_salt, user_role_id, user_active) 
                  VALUES (?,?,?,?,?,?,?)`;
    const [result] = await pool.query(sql, [user.firstName, user.lastName, user.email, user.password, user.salt, user.roleId, user.active]);
    */

    const sql = `INSERT INTO users (user_first_name,user_last_name, user_email, user_password, user_salt, user_role_id, user_active)
                  VALUES (?,?,?,?,?,?,?)`;
    const [result] = await pool.query(sql, [user.firstName, user.lastName, user.email, "NOT SET", "NOT SET", user.roleId, user.active]);

    user.id = result?.insertId;
    await setUserPassword(user);

    return user.id;

  }catch(error){
    throw(error)
  }finally{
    connection?.release();
  }
}

exports.update = async (user) => {
  
  // make sure that the param is an instance of a User model object
  if(user.constructor.name !== "User"){
    throw new Error("Invalid parameter sent to update() - must be a User model object")
  }

  // make sure the user param is valid
  const [isValid, errs] = user.validate()
  
  if(!isValid){
    throw new Error("Invalid User - " + JSON.stringify(errs));
  }

  let connection = null;

  try{

    connection = await pool.getConnection();

    // Don't update the password or salt, the auth module will handle that    
    const sql = "UPDATE users SET user_first_name=?, user_last_name=?, user_email=?, user_role_id=?, user_active=? WHERE user_id=?"; 
    const [result] = await pool.query(sql, [user.firstName, user.lastName, user.email, user.roleId, user.active, user.id]);    
    
    if(result?.affectedRows !== 1){ // Note that there is also a 'changedRows' property and will be 1 if the row was actually changed
      throw new Error("User not found");
    }

    ///////////////////////////// ADD THIS
    if(user.password) {
      await setUserPassword(user);
    }

    return true

  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

// Can't use 'delete' for this function name because it is a reserved word!!!
exports.remove = async (id) => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    
    // Start transaction for data integrity
    await connection.beginTransaction();
    
    // Delete child records first to avoid foreign key constraint violations
    // Delete user preferences
    await connection.query("DELETE FROM user_preferences WHERE user_id = ?", [id]);
    
    // Delete user activity logs
    // await connection.query("DELETE FROM user_activity_log WHERE user_id = ?", [id]);
    
    // Delete user messages (both sent and received)
    // await connection.query("DELETE FROM user_messages WHERE sender_id = ? OR recipient_id = ?", [id, id]);
    
    // Finally delete the user
    const sql = "DELETE FROM users WHERE user_id = ?";
    const [result] = await connection.query(sql, [id]);
    
    // Commit the transaction
    await connection.commit();
    
    if (result.affectedRows === 1) {
      return true;
    }
    return false;
  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection?.release();
  }
};

const setUserPassword = async (user) => {
  // make sure that the param is an instance of a User model object
  if(user.constructor.name !== "User"){
    throw new Error("Invalid parameter sent to setUserPassword() - must be a User model object")
  }
  const [isValid, errs] = user.validate()

  if(!(user.id > 0)){
    throw new Error("Invalid User ID - did you forget to set the user id before setting the password?");
  }
  
  if(!isValid){
    throw new Error("Invalid User - " + JSON.stringify(errs));
  }

  const salt = await generateRandomSalt();
  const hashedPassword = await saltAndHashPassword(salt, user.password);
  let connection = null;
  try{
    connection = await pool.getConnection();  
    const sql = "UPDATE users SET user_salt=?, user_password=? WHERE user_id=?";
    const [result] = await connection.query(sql, [salt, hashedPassword, user.id]);
    if(result?.changedRows !== 1){ // The 'changedRows' property should be 1 if the row was actually changed
      throw new Error("Password change failed, changed rows not equal to 1");
    }else{
      return true;
    }
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.setUserPassword = setUserPassword;