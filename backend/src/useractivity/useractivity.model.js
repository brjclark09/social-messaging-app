class UserActivity {
  
  constructor({activityId, userId, activityType, activityDescription, activityTimestamp}){
    this.activityId = activityId || 0;
    this.userId = userId;
    this.activityType = activityType;
    this.activityDescription = activityDescription;
    this.activityTimestamp = activityTimestamp;
  }

  validate(){
    
    const errorMessages = {};
    let isValid = true;

    // validate activityId
    // Note that an id of 0 indicates that the activity has not yet been created in the database
    if(isNaN(this.activityId)){
      errorMessages.activityId = "The activity id must be a number";
      isValid = false;
    }else if((this.activityId >= 0) == false){
      errorMessages.activityId = "The activity id must be 0 or greater";
      isValid = false;
    }

    // validate userId
    if(typeof this.userId != "number"){
      isValid = false;
      errorMessages.userId = "The user id must be a number";
    }else if(this.userId <= 0){
      isValid = false;
      errorMessages.userId = "The user id must be greater than 0";
    }

    // validate activityType
    if(!this.activityType){
      errorMessages.activityType = "Activity type is required";
      isValid = false;
    }else if(this.activityType.length > 50){
      errorMessages.activityType = "Activity type must be 50 characters or less";
      isValid = false;
    }

    // validate activityDescription (optional)
    if(this.activityDescription && this.activityDescription.length > 1000){
      errorMessages.activityDescription = "Activity description must be 1000 characters or less";
      isValid = false;
    }
    
    return [isValid, errorMessages]

  }

}

module.exports = UserActivity;