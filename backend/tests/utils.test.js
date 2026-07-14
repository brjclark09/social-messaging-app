const {validateEmailAddress} = require("../src/utils");


describe("Utils tests", () => {

  describe("validateEmailAddress()", () => {
    
    it("should return true for valid emails", () => {
      expect(validateEmailAddress("xx@xx.com")).toBe(true);
      expect(validateEmailAddress("xx.xx@xx.com")).toBe(true);
    })

    it("should return false for INvalid emails", () => {
      expect(validateEmailAddress("xxxx.com")).toBe(false);
      expect(validateEmailAddress("xx.xx@xx")).toBe(false);
    })

  })

});