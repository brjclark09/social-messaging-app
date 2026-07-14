const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
 
// Create write streams for access and error logs
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
 
function setUpLogging(app) {
  // Setup the logger for access logs
  app.use(morgan('combined', {
    stream: accessLogStream
  }));
}
 
 
module.exports = {setUpLogging, errorLogStream};