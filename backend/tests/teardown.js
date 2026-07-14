// This was another attempt to remove the connection pool
// because the tests were not completing.
// But using -- --foreExit (in the package.json file did the trick) 
module.exports = async () => {
  const pool = require("../src/db");
  await pool.end(); // Close the database connection pool
  console.log('Connection pool ended.');
  console.log("TEARDOWN COMPLETE: " + new Date().toString());
};
