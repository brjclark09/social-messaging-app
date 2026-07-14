const express = require('express');
const app = express();
const pool = require("./db");

// Set up the logging (note that the errorLogStream is used below in the error handler)
const {setUpLogging, errorLogStream} = require('./logger');
setUpLogging(app);

const helmet = require("helmet");
app.use(helmet());

// HTTP to HTTPS redirect (only in production environment)
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy'); 
  app.use((req, res, next) => {  
    if (req.secure) {
      // Request is already HTTPS, continue to the next middleware
      next();
    }else{
      // Redirect to HTTPS with 301 status code
      res.redirect(301, 'https://' + req.headers.host + req.url);
    }
  });
}

const cors = require('cors');
// You can get specific about how you configure CORS like so
const corsOptions = {
  //origin: 'http://localhost:5173', //this would only allow Cors requests from localhost:5173 
  //credientials: true, //allows cookies to be sent (you must set 'withCredentials' to true in Axios calls)  
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  exposedHeaders: ['Authorization']
}
app.use(cors(corsOptions));


/*
// Or you can just allow all origins:
app.options('*', cors()) ;
*/

// console.log("NODE_ENV: ", process.env.NODE_ENV);
// console.log("DB_HOST is " + process.env.DB_HOST);
// console.log("DB_NAME is " + process.env.DB_NAME);
// console.log("DB_USER is " + process.env.DB_USER);
// console.log("DB_PASSWORD is " + process.env.DB_PASSWORD);
// console.log("DB_ALLOW_MULTIPLE_STATEMENTS is " + process.env.DB_ALLOW_MULTIPLE_STATEMENTS);

// MIDDLEWARE
app.use(express.json());

// ROUTES
app.get('/', async (req, res, next) => {

  /*
  // Test the connection to the database
  try{
    console.log("Runnning a test query...");
    const connection = await pool.getConnection();
    const sql = "SELECT * FROM users"
    const [rows, fields] = await connection.query(sql);
    console.log("ROWS", rows);
  }catch(err){
    next(err);
  }
  */

  res.json({ message: 'Something' });
});

app.use("/roles", require("./roles/role.routes"));
app.use("/users", require("./users/user.routes"));
app.use("/auth", require("./auth/auth.routes"));
app.use("/preferences", require("./userpreferences/userpreferences.routes"));
app.use("/messages", require("./usermessages/usermessages.routes"));
app.use("/activity", require("./useractivity/useractivity.routes"));

app.all("*", (req, res, next) => {
  res.status(404).json({message: "Resource not found"});
})

// // ERROR HANDLER
// app.use((err, req, res, next) => {
//   const requestedUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
//   const statusCode = err.statusCode ||  500;

//   console.log("REQUESTED URL", requestedUrl);
//   console.log("REQUEST METHOD: " + req.method);
//   console.log("STATUS CODE: " + statusCode);
//   console.log("ERROR", err);
//   console.log("STACKTRACE", err.stack);
  
//   if(process.env.NODE_ENV == "production"){
//     res.status(statusCode).json({message: "There has been an error!"});
//   }else{
//     res.status(statusCode).json({message: err});
//   }
// });

// ERROR HANDLER
app.use((err, req, res, next) => {
 
  const statusCode = err.statusCode || 500;
    
  const errorDetails = `
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    URL: ${req.originalUrl}
    Message: ${err.message}
    Stack: ${err.stack}
  `;
  
  if(process.env.NODE_ENV == "production"){
    // In production: log the error details to the error log file
    errorLogStream.write(errorDetails);
    // In production: respond with a generic error message  // Respond with a generic error message
    res.status(statusCode).json({message: "There has been an error!"});
  }else{
    // In dev: log the error details to the console and in the response
    console.error(errorDetails);
    res.status(statusCode).json({message: errorDetails});
  }
});

module.exports = app;
