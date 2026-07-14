const {
  generateRandomSalt, 
  saltPassword,
  saltAndHashPassword,
  verifyPassword,
  getToken,
  decodeToken
} = require("../src/auth/auth.helpers")

/*
// To see how the token is created and decoded:
const userId = 1;
const roleId = 2; 
const token = getToken(userId, roleId);
console.log(`THE TOKEN IS: ${token}`);
const decodedToken = decodeToken(token);
console.log(`THE DECODED TOKEN IS: ${JSON.stringify(decodedToken)}`);
*/

/*
// I put this in here so that we could quickly create passwords and hashes of it
// if we need to.
*/
async function passwordTest() {
  const password = "test123";
  const salt =  await generateRandomSalt();
  const saltedPassword = saltPassword(salt, password);
  const saltedAndHashedPassword = await saltAndHashPassword(salt, password);
  console.log(
    `IF SALT IS: ${salt} AND PASSWORD IS: ${password} \n
    THEN THE HASHED PASSWORD IS ${saltedAndHashedPassword}`
  );
  const result = await verifyPassword(password, salt, saltedAndHashedPassword);
  console.log(`THE PASSWORD VERIFICATION RESULT IS: ${result}`);
}
passwordTest();

describe("Auth Helpers", () => {

  describe("generateRandomSalt()", () => {
    it("should return a string that's 29 characters long", async () => {
      const randomString = await generateRandomSalt();
      expect(randomString.length).toBe(29);
    })
  }) // end of generateRandomSalt()

  describe("saltPassword()", () => {
    it("should apply the salt correctly to the password", () => {
      const saltedPassword = saltPassword("xxx", "test123");
      expect(saltedPassword).toBe("xxxtest123xxx");
    })
  }) // end of saltPassword

  describe("saltAndHashPassword()", () => {
    it("should return the proper result", async () => {
      const salt = "xxx";
      const password = "test123"
      const result = await saltAndHashPassword(salt, password);
      expect(result).toBeTruthy();
      expect(result.length).toBeLessThan(255); // make sure it fits in the database
    })
  }) // end of saltAndHashPassword

  describe("verifyPassword()", () => {
    it("should return true if the first two params match the third param after applying salt and hashing", async () => {
      const salt = "xxx";
      const password = "test123"
      const saltedAndHashedPassword = await saltAndHashPassword(salt, password);
      const result = await verifyPassword(password, salt, saltedAndHashedPassword);
      expect(result).toBe(true);
      //console.log(`IF SALT IS ${salt} AND PASSWORD IS ${password} THEN THE HASHED PASSWORD IS ${saltedAndHashedPassword}`)
    })

    it("should return false if the first two params do NOT match the third param after applying salt and hashing", async () => {
      const salt = "xxx";
      const password = "test123"
      const saltedAndHashedPassword = await saltAndHashPassword(salt, password);
      const wrongPassword = "test123A"
      const result = await verifyPassword(wrongPassword, salt, saltedAndHashedPassword);
      expect(result).toBe(false);
    })
  }) // end of verifyPassword
 

  describe("getToken()", () => {
    it("should return truthy", () => {
      const userId = 1;
      const roleId = 2;
      const token = getToken(userId, roleId);
      expect(token).toBeTruthy();
    })
  }) // end of getToken

  describe("decodeToken()", () => {
    it("should return the decoded token", async () => {
      const userId = 1;
      const roleId = 2;
      const token = getToken(userId, roleId);
      const result = await decodeToken(token);
      //console.log("RESULT:", result); 
      // Note: the result includes 'iat' and 'exp' props which are the number of SECONDS (not ms) since the epoch 
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("userId", 1);
      expect(result).toHaveProperty("roleId", 2);
    })

    it("should throw an error if the token passed in is not valid", () => {
      expect(() => decodeToken("BLAH!")).toThrow();
    })

  }) // end of decodeToken


})