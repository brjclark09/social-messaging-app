const pool = require("../db");
const Role = require("./role.model");

exports.getAll = async () => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    const sql = "SELECT user_role_id, user_role_name, user_role_desc FROM user_roles";
    const [rows] = await connection.query(sql);
    //console.log(rows);
    return rows.map(r => new Role({id: r.user_role_id, name: r.user_role_name, description: r.user_role_desc}));
  } catch (error) {
    throw error;
  } finally {
    connection?.release();
  }
}

exports.getById = async (id) => {

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid parameter sent to getById() - must be a positive integer");  
  }

  let connection = null;

  try{
    connection = await pool.getConnection();
    const sql = "SELECT user_role_id, user_role_name, user_role_desc FROM user_roles WHERE user_role_id = ?";
    const [rows] = await connection.query(sql, [id]);
    if(rows.length === 0){
      return null;
    }else{
      return new Role({id: rows[0].user_role_id, name: rows[0].user_role_name, description: rows[0].user_role_desc});
    }
  }catch(error){
    throw error;
  }finally{
    connection?.release();
  }
}

exports.insert = async (role) => {

  if(role === null){
    throw new Error("Invalid parameter sent to insertRole() - cannot be null");
  }

  // make sure that the param is an instance of a Role model object
  if(role.constructor.name !== "Role"){
    throw new Error("Invalid parameter sent to insert() - must be a Role model object")
  }

  // make sure the role param is valid
  const [isValid, errs] = role.validate()
  
  if(!isValid){
    throw new Error("Invalid Role - " + JSON.stringify(errs));
  }

  let connection = null;
  try{
    connection = await pool.getConnection();
    const sql = "INSERT INTO user_roles (user_role_name, user_role_desc) VALUES (?,?)";
    const [result] = await connection.query(sql, [role.name, role.description]);
    return result.insertId;
  }catch(error){
    throw error;
  }finally{
    connection?.release();
  }
}

exports.update = async (role) => {

  // make sure that the param is an instance of a Role model object
  if(role.constructor.name !== "Role"){
    throw new Error("Invalid parameter sent to update() - must be a Role model object")
  }

  // make sure the role param is valid
  const [isValid, errs] = role.validate()
  
  if(!isValid){
    throw new Error("Invalid Role - " + JSON.stringify(errs));
  }

  let connection = null;

  try{
    connection = await pool.getConnection();
    const sql = "UPDATE user_roles SET user_role_name=?, user_role_desc=? WHERE user_role_id=?";
    const [result] = await connection.query(sql, [role.name, role.description, role.id]);
    if(result.affectedRows === 1){
      return true;
    }
    return false;
  }catch(error){
    throw error;
  }finally{
    connection?.release();
  }
}

exports.remove = async (id) => {
  let connection = null;
  try{
    connection = await pool.getConnection();
    const sql = "DELETE FROM user_roles WHERE user_role_id = ?";
    const [result] = await connection.query(sql, [id]);
    if(result.affectedRows === 1){
      return true;
    }
    return false;
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
  
}

