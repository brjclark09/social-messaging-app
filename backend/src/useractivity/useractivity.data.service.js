const pool = require("../db");
const UserActivity = require("./useractivity.model");

exports.getAll = async () => {
  let connection = null;

  try {
    
    connection = await pool.getConnection();
    const sql = `
      SELECT 
        A.activity_id,
        A.user_id,
        A.activity_type,
        A.activity_description,
        A.activity_timestamp,
        U.user_first_name,
        U.user_last_name
      FROM user_activity A
      INNER JOIN users U ON A.user_id = U.user_id
      ORDER BY A.activity_timestamp DESC
    `;
    
    const [rows] = await connection.query(sql);

    return rows.map(r => ({
      activityId: r.activity_id,
      userId: r.user_id,
      activityType: r.activity_type,
      activityDescription: r.activity_description,
      activityTimestamp: r.activity_timestamp,
      userName: `${r.user_first_name} ${r.user_last_name}`
    }));

  } catch (error) {
    throw(error);
  } finally {
    connection?.release();
  }
};

exports.getByUserId = async (userId) => {
  
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid parameter sent to getByUserId() - must be a positive integer");  
  }

  let connection = null;

  try{

    connection = await pool.getConnection();
    
    const sql = `SELECT 
                    A.activity_id,
                    A.user_id,
                    A.activity_type,
                    A.activity_description,
                    A.activity_timestamp,
                    U.user_first_name,
                    U.user_last_name
                FROM user_activity A
                INNER JOIN users U ON A.user_id = U.user_id
                WHERE A.user_id = ?
                ORDER BY A.activity_timestamp DESC`;

    const [rows] = await connection.query(sql, [userId]);

    return rows.map(r => ({
      activityId: r.activity_id,
      userId: r.user_id,
      activityType: r.activity_type,
      activityDescription: r.activity_description,
      activityTimestamp: r.activity_timestamp,
      userName: `${r.user_first_name} ${r.user_last_name}`
    }));
    
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.getByActivityType = async (activityType) => {
  
  if (!activityType || typeof activityType !== 'string') {
    throw new Error("Invalid parameter sent to getByActivityType() - must be a non-empty string");  
  }

  let connection = null;

  try{

    connection = await pool.getConnection();
    
    const sql = `SELECT 
                    A.activity_id,
                    A.user_id,
                    A.activity_type,
                    A.activity_description,
                    A.activity_timestamp,
                    U.user_first_name,
                    U.user_last_name
                FROM user_activity A
                INNER JOIN users U ON A.user_id = U.user_id
                WHERE A.activity_type = ?
                ORDER BY A.activity_timestamp DESC`;

    const [rows] = await connection.query(sql, [activityType]);

    return rows.map(r => ({
      activityId: r.activity_id,
      userId: r.user_id,
      activityType: r.activity_type,
      activityDescription: r.activity_description,
      activityTimestamp: r.activity_timestamp,
      userName: `${r.user_first_name} ${r.user_last_name}`
    }));
    
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.insert = async (activity) => {
  
  if(activity === null){
    throw new Error("Invalid parameter sent to insert() - cannot be null");
  }
  
  // make sure that the param is an instance of a UserActivity model object
  if(activity.constructor.name !== "UserActivity"){
    throw new Error("Invalid parameter sent to insert() - must be a UserActivity model object")
  }

  // make sure the activity param is valid
  const [isValid, errs] = activity.validate()

  if(!isValid){
    throw new Error("Invalid UserActivity - " + JSON.stringify(errs));
  }

  let connection = null;
  try{

    connection = await pool.getConnection();
        
    const sql = `INSERT INTO user_activity (user_id, activity_type, activity_description) 
                  VALUES (?,?,?)`;
    
    const [result] = await connection.query(sql, [activity.userId, activity.activityType, activity.activityDescription]);
    
    const activityId = result?.insertId;

    return activityId;

  }catch(error){
    throw(error)
  }finally{
    connection?.release();
  }
}

exports.update = async (activity) => {
  
  // make sure that the param is an instance of a UserActivity model object
  if(activity.constructor.name !== "UserActivity"){
    throw new Error("Invalid parameter sent to update() - must be a UserActivity model object")
  }

  // make sure the activity param is valid
  const [isValid, errs] = activity.validate()
  
  if(!isValid){
    throw new Error("Invalid UserActivity - " + JSON.stringify(errs));
  }

  let connection = null;

  try{

    connection = await pool.getConnection();
    
    const sql = "UPDATE user_activity SET user_id=?, activity_type=?, activity_description=? WHERE activity_id=?"; 
    const [result] = await connection.query(sql, [activity.userId, activity.activityType, activity.activityDescription, activity.activityId]);    
    
    if(result?.affectedRows !== 1){
      throw new Error("Activity not found");
    }

    return true

  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.remove = async (activityId) => {
  
  if (!Number.isInteger(activityId) || activityId <= 0) {
    throw new Error("Invalid parameter sent to remove() - must be a positive integer");  
  }

  let connection = null;
  try {
    connection = await pool.getConnection();
    
    const sql = "DELETE FROM user_activity WHERE activity_id = ?";
    const [result] = await connection.query(sql, [activityId]);
    
    if (result.affectedRows === 1) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  } finally {
    connection?.release();
  }
};