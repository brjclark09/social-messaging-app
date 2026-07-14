class Role{
  constructor({id, name, description}){
    this.id = id || 0;
    this.name = name;
    this.description = description || "";
  }

  validate(){
    const errorMessages = {};
    let isValid = true;

    // validate id
    // Note that an id of 0 indicates that the user has not yet been created in the database
    
    // if(isNaN(this.id)){ <-- this is what I started with, but it doesn't account for float numbers
   
    if(!Number.isInteger(this.id)){
      errorMessages.id = "The role id must be an integer number";
      isValid = false;
    }else if((this.id >= 0) == false){
      errorMessages.id = "The role id must be 0 or greater";
      isValid = false;
    }

    // validate name
    if(!this.name){
      errorMessages.name = "Name is required";
      isValid = false;
    }else if(this.name.length > 30){
      errorMessages.name = "Name must be 30 characters or less";
      isValid = false;
    }

    // validate description
    if(this.description.length > 255){
      errorMessages.description = "Description must be 255 characters or less";
      isValid = false;
    }

    return [isValid, errorMessages];

  }
}

module.exports = Role;