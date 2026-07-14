const { authenticateUser } = require("../src/auth/auth.data.service");

describe("Auth Data Service", ()=>{
  
  describe("authenticateUser()", () => {
    
    it('should authenticate the user', async () => {
        const user = await authenticateUser("john@doe.com", "test123");
        expect(user).toBeTruthy();
        expect(user).toHaveProperty("email", "john@doe.com");
        //console.log("USER:", user);
    });


    it('should throw an error if the email does not exist in the database', async () => {
      await expect(authenticateUser("BLAH@BLAH.com", "test123")).rejects.toThrow(/User not found/);
    });

    it('should throw an error if the user is not active in the database', async () => {
      await expect(authenticateUser("inactive@test.com", "test123")).rejects.toThrow(/User not active/);
    });

    it('should throw an error if the password is not correct', async () => {
      await expect(authenticateUser("john@doe.com", "BLAH")).rejects.toThrow(/Invalid password/);
    });


  });

});