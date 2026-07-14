# Project X

# STEP 1 - Starter Files
Log into your MySQL server and run the script in the **database.sql** file (which is
in the **dev-notes** folder). This script will create two databases, and populate them
with the initial tables that you'll be using for the project. 

Install the NPM modules
```md
npm install
```
Install Nodemon (globally) if you don't already have it installed:
```md
npm install nodemon -g
```
Look in the **package.json** file
- Notice the dependencies
- Notice the scripts (and that they are using dotenv)
  - **dev** starts the app for your development environment
  - **test** starts the Jest unit tests
  - **start** starts the app on the live/production server
- Note that we declared setup and teardown scripts for Jest (we'll talk about these in a minute)
  - globalSetup
  - globalTeardown

Note that **server.js** imports the app (from **app.js**) and starts the server.
The server.js module uses the **dotenv** module to load variables from the .env files.

We have 3 different .env files for each of the environments that our app will run in.
- .env.dev - for when we are doing development
- .env.test - for when we run the tests
- .env - for when the app runs in the live environment

Go back into the package.json file and note how the scripts use the **dotenv-cli**
module to specify which .env file to use

Note that **db.js** configures the database connection (using ENV variables) and that it
exports a **connection pool**.

Note that **utils.js** is a module/component that we can add utility functions to,
it currently has just one function that can be used to validate email addresses.

Run the app:
```md
npm run dev
```
Open your browser and to to **localhost:8888**, and you should
see a 'Hello World' message.

Go to the route for the homepage (in app.js) and remove the comments around
the try/catch block. This code will execute a SQL query and log the results.

Refresh the page in your browser and check the log on the server to make
sure the query ran successfully. 

If the query ran successfully, then delete (or comment out) the try/catch block.

Run the tests:
```md
npm run test
```
Hopefully they are all passing.

Note that when you run the tests, the **setup-test-database.js** script will
use the **setup-test-database.sql** file to drop all tables and recreate them 
in the project_x_test database. This script will run each time you run the
tests because of the jest globalSetup configuration in the package.json file.

Likewise, when all of the tests complete, the **teardown.js** will close
the connection pool.

Look in **utils.test.js** and make sure you understand the test code.

Look in **api.test.js** and note that it is using the **supertest** NPM
module. This module allows you to make API (ajax) calls to verify that
you app is returning the proper responses. It does by starting the app
(which you pass in as a param to the agent() method) and returning
an 'agent' object which you can use to make requests.

Note how the test are using the agent, for example:
```js
const response = await agent.get("/");
```
In this code, we use the agent to make a GET request to the home page.
The agent returns a response object that represents the response from
the server. We can then check the data inside the response object
to verify that our routes are working properly and returning the proper
response.

Try to understand the files that are in the project right now. It may take a while
to make sense of all of them now, but you'll need to understand the purpose of each one by the time you take over the project. And we'll be adding many more files as we move through the project.

Don't be afraid to ask questions in class!

### Questions
1. Explain the purpose of each of these files:
  - server.js
  - app.js
  - db.js
1. Why are we creating two versions of the database?
1. Explain how we configure Jest to recreate the test database when we run the unit tests.
1. Why did we separate the Express app code into two separate files (server.js and app.js)?
1. Why are we using the supertest package in our project?

# STEP 2 - User Roles
In this step we build the following components/modules:
- Role (a model class)
- role.data.service (does CRUD operations for the user_roles table)
  - getAll() - returns an array of Role objects
  - getById(id) - takes an id as a param, and returns a Role with that it
  - insert(role) - takes a Role as a param, and returns the id assigned to the Role
  - update(role) - takes a Role as a param, and updates the corresponding row in the user_roles table
  - remove(id) - takes an id as a param, and remove that row from the user_roles table
- role.routes - defines the routes and sets the corresponding request handler
- role.controller - defines the request handlers that handle the request and generate the response. This includes:
  - parsing the request body (JSON string) into Role model objects
  - calling the appropriate role.data.service function
  - stringifying Role model objects (into JSON strings) and adding them to the response body
  - handling errors

First we create the Role model class and test it (although we could add many more tests).

Then we create the role.data.service and test it (against the project_x_test database)

Then we create API tests to verify that the routes and controllers are working as expected.



# STEP 4 - Auth
## 4a - Handling Passwords
Make sure to install bcryptjs:
```md
npm install bcryptjs
```

## 4b - JWT Tokens
Install jsonwebtoken:
```md
npm install jsonwebtoken
```
Add the env vars:
```md
JWT_SECRET = R@ndom!Str1ng
JWT_EXPIRES_IN = 60m
```
Note that the production should use different secret

Add the import to auth.helpers.js

Add getToken() and decodeToken() to auth.helpers,js

Don't forget to export them

Add tests for them to auth.helpers.test.js

## 4c - added auth data service and the authenticateUser function to it
We need to make sure to salt and hash the passwords in the dev database and uncomment this line
in the setup-test-database.sql file:
```sql
UPDATE users SET user_password = '$2a$08$zvWApJkRSK1124iESJU5Puo9mUelLn3sgy9A.dPSySghLe7MMGGGS', user_salt = 'xxx';
```

## 4d - didn't do anything with this branch
Just made some notes about other functions we might/could add to the auth data service

## 4e - Auth API (controller and routes)
I had to add an admin user to the databases so that I could get the tests to pass.
```sql
INSERT INTO `users`(`user_first_name`, `user_last_name`, `user_email`, `user_password`, `user_salt`, `user_role_id`, `user_active`) VALUES ('Admin', 'admin','admin@admin.com', 'test123', 'xxx', '2', true);

UPDATE users SET user_password = '$2a$08$zvWApJkRSK1124iESJU5Puo9mUelLn3sgy9A.dPSySghLe7MMGGGS', user_salt = 'xxx';
```
**Make sure to add this user to the setup-test-database.sql file!**

# Next Steps
Apply the isLoggedIn and isAdmin middleware functions, then [update the requests in Postman to use a script to
apply the jwt token to all requests](https://webcoder.club/http/dealing-with-authentication-in-postman.html).

GOING LIVE!
- let's do this in a docker container
- AND on cPanel (uggh!)
  - we may have to make an app.js file outside of the src dir for cPanel
# Securing the ENV vars for the production envrirnment
# Enforcing HTTPS
# Dealing with CORS
# Using Helmut
# Logging








