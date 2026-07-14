const {validateEmailAddress} = require("../utils");

class User {
  
  constructor({id, firstName, lastName, email, roleId, role, active, password}){
		this.id = id || 0;
    this.firstName = firstName;
    this.lastName = lastName;
		this.email = email;
		this.roleId = roleId;
    this.role = role;
		this.active = active;
    this.password = password || "";
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