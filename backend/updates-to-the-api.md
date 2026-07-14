This file documents the steps the students need to take to finish off the API

We did not get to these steps in 2025 - Hopefully we can in the future!

## Changes to the API to deal with passwords when users are created or edited
First create a new branch and switch it (I'm not sure if we've implemented the CI/CD pipline that deploys the app when ever you push the master branch to GitHub)

Updated the User model to look like this:
```js
const {validateEmailAddress} = require("../utils");

class User {
  
  ////////////////////////////////////////////////// ADDED password TO THE PARAMETER:
  constructor({id, firstName, lastName, email, roleId, role, active, password}){
		this.id = id || 0;
    this.firstName = firstName;
    this.lastName = lastName;
		this.email = email;
		this.roleId = roleId;
    this.role = role;
		this.active = active;
    this.password = password || ""; ///////////////////////////////////////ADDED THIS
	}

  validate(){
    
    const errorMessages = {};
    let isValid = true;

    // validate id
    // Note that an id of 0 indicates that the user has not yet been created in the database
    if(isNaN(this.id)){
      errorMessages.id = "The user id must be a number";
      isValid = false;
    }else if((this.id >= 0) == false){
      errorMessages.id = "The user id must be 0 or greater";
      isValid = false;
    }

    // validate firstName
    if(!this.firstName){
      errorMessages.firstName = "First name is required";
      isValid = false;
    }else if(this.firstName.length > 30){
      errorMessages.firstName = "First name must be 30 characters or less";
      isValid = false;
    }

    // validate lastName
    if(!this.lastName){
      errorMessages.lastName = "Last name is required";
      isValid = false;
    }else if(this.lastName.length > 30){
      errorMessages.lastName = "Last name must be 30 characters or less";
      isValid = false;
    }

    // validate email
    if(!this.email){
      errorMessages.email = "Email is required";
      isValid = false;
    }else if(!validateEmailAddress(this.email)){
      errorMessages.email = "Email is not valid";
      isValid = false;
    }else if(this.email.length > 255){
      errorMessages.email = "Email must be 255 characters or less";
      isValid = false;
    }
    
    // validate roleId
    if(typeof this.roleId != "number"){
      isValid = false;
      errorMessages.roleId = "The role id must be a number";
    }else if(!(this.roleId >= 1 && this.roleId <=3)){
      isValid = false;
      errorMessages.roleId = "The role id must be a number from 1 - 3"
    }

    // validate active
    if(!(this.active == true || this.active == false)){
      isValid = false;
      errorMessages.active = "The active field must be a boolean";
    }

    
    //password is required when creating a new user (id of 0)    //////////////ADDED THIS IF STATEMENT
    if(this.id === 0){
      if(!this.password){
        errorMessages.password = "Password is required when creating a new user";
        isValid = false;
      }
    }

    // if a password is provided, it must be at least 8 characters //////////////////ADDED THIS IF STATEMENT
    if(this.password && this.password.length < 8){
      errorMessages.password = "Password must be at least 8 characters";
      isValid = false;
    }
    
    
    return [isValid, errorMessages]

  }

}

module.exports = User;
```

### NOTE THAT THESE CHANGES WILL BREAK ANY TEST THAT  INSERTS A NEW USER
So you need to go throught the failing tests and add a **password** property with a value of a string that is more than 8 characters

You'll have to fix about 5-6 tests, give or take a couple

## Add these tests to the validate() tests in user.model.test.js:
```js
// password tests
it("should return false if the password is missing when creating a new user (id of 0)", () => {
  const user = new User({id:0, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true});
  const [isValid, errs] = user.validate();
  expect(isValid).toBe(false);
  expect(errs).toHaveProperty("password", "Password is required when creating a new user");
})

it("should return false if the password is too short when creating a new user (id of 0)", () => {
  const user = new User({id:0, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true, password: "short"});
  const [isValid, errs] = user.validate();
  expect(isValid).toBe(false);
  expect(errs).toHaveProperty("password", "Password must be at least 8 characters");
})

it("should return false if the password is too short when updating a user (id > 0)", () => {
  const user = new User({id:4, firstName:"Bob", lastName:"Smith", email: "xx@xx.com", roleId:1, active:true, password: "short"});
  const [isValid, errs] = user.validate();
  expect(isValid).toBe(false);
  expect(errs).toHaveProperty("password", "Password must be at least 8 characters");
})
```

## Changes to **user.data.service.js** module:
Add these imports:
```js
const {generateRandomSalt, saltAndHashPassword} = require("../auth/auth.helpers");
```
Add this function:
```js
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
```


Modify **insert()** to look like this:
```js
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
    return result?.insertId;

  }catch(error){
    throw(error)
  }finally{
    connection?.release();
  }
}
```

Modify **update()**:
```js
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
```
NOTE THAT WHEN WE GET USERS FROM THE DATABASE, WE NEVER INCLUDE THEIR PASSWORD OR SALT (THAT SHOULD NEVER LEAVE THE DATABASE)

## Update user.data.service.test.js:
```js
/////////// DON'T FORGET TO IMPORT THE setUserPassword() FUNCTION

  describe("setUserPassword()", () => {

    it("should throw error if the parameter is not a User model object", async () => {
      await expect(setUserPassword("BLAH")).rejects.toThrow(/Invalid parameter/);
    })

    it("should throw error if the User parameter is not valid", async () => {
      const invalidUser = new User({"firstName":"Joe","lastName":"Smith","email":"INVALID EMAIL","roleId":2,"active":true})
      await expect(setUserPassword(invalidUser)).rejects.toThrow(/Invalid User/);
    })

    it("should return true on successful password change", async () => {
      const user = new User({"firstName":"test","lastName":"setUserPassword","email":"test.setUserPassword@example.com","roleId":2,"active":true, password: "StrongP@ssw0rd!"});
      user.id = await insert(user); //// DON'T FORGET TO SET THE USER ID, OTHERWISE setUserPassword() WILL THROW AN ERROR
      const result = await setUserPassword(user);
      expect(result).toBe(true);
    })

    it("Should throw error if the User ID is not set", async () => {
      const user = new User({"firstName":"test","lastName":"setUserPassword","email":"test.setUserPassword@example.com","roleId":2,"active":true, password: "StrongP@ssw0rd!"});
      //user.id = await insert(user); //// IF YOU FORGET TO SET THE USER ID, IT SHOULD THROW AN ERROR
      await expect(setUserPassword(user)).rejects.toThrow(/Invalid User ID/);
    })

  })
```
