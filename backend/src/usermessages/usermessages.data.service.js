const pool = require("../db");
const UserMessages = require("./usermessages.model");

exports.getAll = async () => {
  let connection = null;

  try {
    
    connection = await pool.getConnection();
    const sql = `
      SELECT 
        M.message_id,
        M.sender_id,
        M.recipient_id,
        M.message_text,
        M.sent_at,
        S.user_first_name as sender_first_name,
        S.user_last_name as sender_last_name,
        R.user_first_name as recipient_first_name,
        R.user_last_name as recipient_last_name
      FROM user_messages M
      INNER JOIN users S ON M.sender_id = S.user_id
      INNER JOIN users R ON M.recipient_id = R.user_id
      ORDER BY M.sent_at DESC
    `;
    
    const [rows] = await connection.query(sql);

    return rows.map(r => ({
      messageId: r.message_id,
      senderId: r.sender_id,
      recipientId: r.recipient_id,
      messageText: r.message_text,
      sentAt: r.sent_at,
      senderName: `${r.sender_first_name} ${r.sender_last_name}`,
      recipientName: `${r.recipient_first_name} ${r.recipient_last_name}`
    }));

  } catch (error) {
    throw(error);
  } finally {
    connection?.release();
  }
};

exports.getMessagesBySender = async (senderId) => {
  
  if (!Number.isInteger(senderId) || senderId <= 0) {
    throw new Error("Invalid parameter sent to getMessagesBySender() - must be a positive integer");  
  }

  let connection = null;

  try{

    connection = await pool.getConnection();
    
    const sql = `SELECT 
                    M.message_id,
                    M.sender_id,
                    M.recipient_id,
                    M.message_text,
                    M.sent_at,
                    R.user_first_name as recipient_first_name,
                    R.user_last_name as recipient_last_name
                FROM user_messages M
                INNER JOIN users R ON M.recipient_id = R.user_id
                WHERE M.sender_id = ?
                ORDER BY M.sent_at DESC`;

    const [rows] = await connection.query(sql, [senderId]);

    return rows.map(r => ({
      messageId: r.message_id,
      senderId: r.sender_id,
      recipientId: r.recipient_id,
      messageText: r.message_text,
      sentAt: r.sent_at,
      recipientName: `${r.recipient_first_name} ${r.recipient_last_name}`
    }));
    
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.getMessagesByRecipient = async (recipientId) => {
  
  if (!Number.isInteger(recipientId) || recipientId <= 0) {
    throw new Error("Invalid parameter sent to getMessagesByRecipient() - must be a positive integer");  
  }

  let connection = null;

  try{

    connection = await pool.getConnection();
    
    const sql = `SELECT 
                    M.message_id,
                    M.sender_id,
                    M.recipient_id,
                    M.message_text,
                    M.sent_at,
                    S.user_first_name as sender_first_name,
                    S.user_last_name as sender_last_name
                FROM user_messages M
                INNER JOIN users S ON M.sender_id = S.user_id
                WHERE M.recipient_id = ?
                ORDER BY M.sent_at DESC`;

    const [rows] = await connection.query(sql, [recipientId]);

    return rows.map(r => ({
      messageId: r.message_id,
      senderId: r.sender_id,
      recipientId: r.recipient_id,
      messageText: r.message_text,
      sentAt: r.sent_at,
      senderName: `${r.sender_first_name} ${r.sender_last_name}`
    }));
    
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.getMessagesBetweenUsers = async (userId1, userId2) => {
  
  if (!Number.isInteger(userId1) || userId1 <= 0 || !Number.isInteger(userId2) || userId2 <= 0) {
    throw new Error("Invalid parameters sent to getMessagesBetweenUsers() - must be positive integers");  
  }

  let connection = null;

  try{

    connection = await pool.getConnection();
    
    const sql = `SELECT 
                    M.message_id,
                    M.sender_id,
                    M.recipient_id,
                    M.message_text,
                    M.sent_at,
                    S.user_first_name as sender_first_name,
                    S.user_last_name as sender_last_name,
                    R.user_first_name as recipient_first_name,
                    R.user_last_name as recipient_last_name
                FROM user_messages M
                INNER JOIN users S ON M.sender_id = S.user_id
                INNER JOIN users R ON M.recipient_id = R.user_id
                WHERE (M.sender_id = ? AND M.recipient_id = ?) 
                   OR (M.sender_id = ? AND M.recipient_id = ?)
                ORDER BY M.sent_at ASC`;

    const [rows] = await connection.query(sql, [userId1, userId2, userId2, userId1]);

    return rows.map(r => ({
      messageId: r.message_id,
      senderId: r.sender_id,
      recipientId: r.recipient_id,
      messageText: r.message_text,
      sentAt: r.sent_at,
      senderName: `${r.sender_first_name} ${r.sender_last_name}`,
      recipientName: `${r.recipient_first_name} ${r.recipient_last_name}`
    }));
    
  }catch(error){
    throw(error);
  }finally{
    connection?.release();
  }
}

exports.insert = async (message) => {
  
  if(message === null){
    throw new Error("Invalid parameter sent to insert() - cannot be null");
  }
  
  // make sure that the param is an instance of a UserMessages model object
  if(message.constructor.name !== "UserMessages"){
    throw new Error("Invalid parameter sent to insert() - must be a UserMessages model object")
  }

  // make sure the message param is valid
  const [isValid, errs] = message.validate()

  if(!isValid){
    throw new Error("Invalid UserMessages - " + JSON.stringify(errs));
  }

  let connection = null;
  try{

    connection = await pool.getConnection();
        
    const sql = `INSERT INTO user_messages (sender_id, recipient_id, message_text) 
                  VALUES (?,?,?)`;
    
    const [result] = await connection.query(sql, [message.senderId, message.recipientId, message.messageText]);
    
    const messageId = result?.insertId;

    return messageId;

  }catch(error){
    throw(error)
  }finally{
    connection?.release();
  }
}

exports.remove = async (messageId) => {
  
  if (!Number.isInteger(messageId) || messageId <= 0) {
    throw new Error("Invalid parameter sent to remove() - must be a positive integer");  
  }

  let connection = null;
  try {
    connection = await pool.getConnection();
    
    const sql = "DELETE FROM user_messages WHERE message_id = ?";
    const [result] = await connection.query(sql, [messageId]);
    
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