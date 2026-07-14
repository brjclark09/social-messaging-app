/*
The function in this module gets executed before all tests run
If you look in package.json you'll see that the 'jest' settings 'globalSetup' refers to this module

The SQL that initializeTestDatabase() executes will drop and re-create the project_x_test database
There's a lot of queries that must be run in order to do all this, so I decided to use the
fs module to load all the queries from the setup-tests-database.sql file
*/

const fs = require("fs");
const pool = require("../src/db");

initializeTestDatabase = async () => {
  try{
    console.log("\nSETTING UP THE TEST DATABASE...");
    const connection = await pool.getConnection();
    const sql = fs.readFileSync(__dirname + "/setup-test-database.sql","utf-8");
    await connection.query(sql);
    connection.release();
    //pool.end();
  }catch(e){
    console.log(e);
  }
}

module.exports = initializeTestDatabase