# Parent-Focused Social Messaging Platform

A full-stack web application built to demonstrate REST API development, relational database design, authentication, authorization, automated testing, and communication between a JavaScript frontend and a custom backend.

This project was originally developed as part of my software development coursework. The application uses a parent-focused social messaging concept as the product domain, but the primary value of the project is the technical implementation behind it.

## Technical Overview

The application follows a separated client-server architecture:

- A frontend client handles the user interface and sends HTTP requests.
- A Node.js and Express backend contains the application logic.
- A MySQL database stores users, roles, messages, preferences, and activity records.
- JSON Web Tokens are used to authenticate requests.
- Authorization middleware restricts access based on user roles.
- Jest and Supertest are used to test backend routes and expected API behavior.

```text
React Client
     |
     | HTTP requests and JSON responses
     v
Express REST API
     |
     | Authentication
     | Authorization
     | Validation
     | Business logic
     | Activity logging
     v
MySQL Database
```

## Technology Stack

### Frontend

- React
- JavaScript
- HTML
- CSS
- Fetch or Axios-style HTTP communication

The frontend is responsible for rendering the interface, collecting user input, maintaining client-side state, and communicating with the backend through REST endpoints.

### Backend

- Node.js
- Express.js
- REST API architecture
- Middleware-based request processing

Express routes are separated by application responsibility, such as authentication, users, messaging, preferences, and activity records. Middleware is used for authentication, authorization, request validation, and error handling.

### Database

- MySQL
- Relational schema design
- Primary and foreign keys
- Structured relationships between application entities

The database stores persistent application data and enforces relationships between users, roles, messages, preferences, and logged activities.

### Authentication and Authorization

- JSON Web Tokens
- Protected API routes
- Role-based access control
- Password-based account authentication

After a successful login, the backend issues a token that identifies the authenticated user. Protected routes verify the token before allowing access. Role checks provide an additional authorization layer for routes that require elevated permissions.

### Testing

- Jest
- Supertest
- Automated API route testing

The backend test suite sends requests directly to the Express application and verifies response status codes, payloads, authentication requirements, and route behavior.

### Development Tools

- Git
- GitHub
- npm
- Visual Studio Code
- MySQL tooling

## Architecture

The project separates the user interface, application logic, and data persistence into distinct layers.

### Presentation Layer

The React frontend:

- Displays application data
- Collects form input
- Manages interface state
- Sends asynchronous requests
- Handles successful and failed API responses
- Stores or supplies authentication information for protected requests

### Application Layer

The Express backend:

- Defines REST endpoints
- Authenticates requests
- Applies role-based permissions
- Validates incoming data
- Executes business logic
- Creates activity records
- Returns standardized HTTP responses

### Data Layer

The MySQL database:

- Persists user and application data
- Models relationships between entities
- Supports messaging history
- Stores user preferences
- Preserves activity and monitoring records
- Provides structured data for API queries

This separation makes the application easier to maintain, test, and expand than an implementation where database access and interface code are tightly coupled.

## Request and Data Flow

A typical authenticated request follows this process:

1. The frontend sends an HTTP request to an API endpoint.
2. The request includes a JSON Web Token.
3. Authentication middleware verifies the token.
4. Authorization middleware checks the user's role when required.
5. The route validates the request body or parameters.
6. The backend performs the required database operation.
7. Relevant actions may create an activity record.
8. The API returns a JSON response and appropriate HTTP status code.
9. The frontend updates the interface based on the response.

This flow demonstrates how authentication, authorization, validation, business logic, database access, and response handling work together in a full-stack application.

## Database Design

The relational database was designed around several connected entities.

### Users

Stores account information used for authentication and application ownership.

Possible responsibilities include:

- User identity
- Login credentials
- Account status
- Role association
- Creation and update timestamps

### Roles

Defines access levels within the application.

From a technical perspective, roles support:

- Separation of permissions
- Reusable authorization checks
- Restricted endpoints
- Future expansion without hard-coding every user type

### Messages

Stores communication between users.

A message record demonstrates:

- Relationships between sender and recipient accounts
- Timestamped data
- User-generated content storage
- Conversation-history queries
- Ownership and access-control requirements

### Preferences

Stores user-specific application settings.

A preference table demonstrates:

- One-to-one or one-to-many user relationships
- Persistent configuration
- Updating individual account settings
- Separating optional profile data from core authentication data

### Activity Records

Stores important actions performed within the system.

This provides a technical example of:

- Audit-style event logging
- User-to-event relationships
- Timestamped records
- Event categorization
- Building queryable histories from application behavior

## REST API Design

The backend is organized around resource-based endpoints.

Representative API areas include:

```text
/api/auth
/api/users
/api/messages
/api/preferences
/api/activity
```

Depending on the resource, routes may support:

- `GET` for retrieving records
- `POST` for creating records
- `PUT` or `PATCH` for updating records
- `DELETE` for removing records

The API returns JSON and uses HTTP status codes to communicate the result of each request.

Examples include:

- `200 OK` for successful retrieval or updates
- `201 Created` for successful record creation
- `400 Bad Request` for invalid input
- `401 Unauthorized` for missing or invalid authentication
- `403 Forbidden` for insufficient permissions
- `404 Not Found` for missing records
- `500 Internal Server Error` for unexpected backend failures

## Authentication Implementation

The authentication system demonstrates several backend concepts:

1. A user submits login credentials.
2. The backend verifies the submitted information.
3. A JSON Web Token is generated for the authenticated account.
4. The client includes the token with protected requests.
5. Authentication middleware verifies the token.
6. The decoded user information is attached to the request.
7. The route continues only when authentication succeeds.

This approach allows the API to remain stateless because the server does not need to maintain a traditional session for every logged-in user.

## Role-Based Authorization

Authentication determines who the user is. Authorization determines what the user is allowed to do.

Role-based middleware is used to protect sensitive functionality. This design makes access-control logic reusable instead of repeating permission checks inside every route handler.

Technically, this feature demonstrates:

- Middleware composition
- Separation of concerns
- Permission-based route protection
- Reusable security logic
- Different access levels within the same API

## Messaging Implementation

The messaging feature is more than a user-facing communication tool. It demonstrates several technical requirements:

- Creating relational records
- Associating records with multiple users
- Validating sender and recipient information
- Restricting message access to authorized accounts
- Querying conversation history
- Sorting records by time
- Returning structured JSON to the frontend

A production implementation would also need to address pagination, real-time delivery, moderation, attachment handling, encryption decisions, and retention policies.

## Activity Logging

Activity logging is one of the most technically important parts of the project.

The application can create database records when meaningful events occur, such as account actions, messaging activity, preference changes, or other monitored operations.

From a software design perspective, this demonstrates:

- Event-oriented thinking
- Audit trail creation
- Cross-cutting backend behavior
- Structured logging in a relational database
- Querying records by user, action type, or timestamp
- Separating operational history from primary application data

A larger implementation could move this logic into dedicated services, reusable middleware, database triggers, or an asynchronous event-processing system.

## User Preferences

The preferences feature demonstrates how user-specific configuration can be stored outside the frontend.

Instead of resetting whenever the browser refreshes, preferences are persisted in MySQL and retrieved through the API.

Technically, this demonstrates:

- Persistent application state
- User-owned records
- CRUD operations
- Default-value handling
- Form-to-API-to-database data flow
- Updating related records without replacing the entire user account

## Validation and Error Handling

The backend is responsible for rejecting invalid or unauthorized requests before database changes are made.

Important validation areas include:

- Required fields
- Correct data types
- Valid user identifiers
- Existing recipients
- Allowed preference values
- Authentication state
- Role permissions

Error handling should return consistent JSON responses and appropriate HTTP status codes. Centralized Express error-handling middleware can reduce repeated logic and prevent internal implementation details from being exposed to the client.

## Automated Testing

Jest and Supertest are used to test the backend at the HTTP layer.

Representative test cases include:

- Successful login
- Rejected invalid credentials
- Access to a protected route with a valid token
- Rejection of a missing or invalid token
- Role-restricted endpoint behavior
- Successful creation of a record
- Validation failures
- Correct response status codes
- Expected JSON response structure

Supertest allows the test suite to send requests to the Express application without manually running a browser or external API client.

This demonstrates:

- Repeatable backend verification
- Regression testing
- Route-level integration testing
- Authentication testing
- Validation testing
- Confidence when modifying backend code

## Project Structure

A representative version of the project structure is shown below:

```text
project-root/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   ├── preferenceController.js
│   │   └── activityController.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── models/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── preferenceRoutes.js
│   │   └── activityRoutes.js
│   ├── services/
│   ├── tests/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
├── database/
│   └── schema.sql
├── .env.example
├── .gitignore
└── README.md
```

The exact file and directory names may differ from the final school project.

## Running the Project Locally

### Prerequisites

- Node.js
- npm
- MySQL
- Git

### Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Configure the Backend

Create a `.env` file in the backend directory.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=replace_with_a_secure_secret
```

Do not commit the `.env` file or real credentials to version control.

### Create the Database

Create a MySQL database and import the included schema.

```bash
mysql -u your_database_user -p your_database_name < database/schema.sql
```

### Start the Backend

```bash
cd backend
npm run dev
```

Use the following command if no development script is configured:

```bash
npm start
```

### Start the Frontend

```bash
cd frontend
npm run dev
```

### Run the Tests

```bash
cd backend
npm test
```

## Technical Challenges Addressed

This project required coordinating several independent parts of a full-stack application:

- Keeping frontend and backend data structures consistent
- Designing relational tables for connected user data
- Protecting routes with reusable authentication middleware
- Applying role-based authorization
- Passing authenticated identity through the request lifecycle
- Returning consistent API responses
- Logging important activity without duplicating route logic
- Testing protected endpoints
- Managing environment-specific database credentials
- Handling asynchronous frontend and backend operations

## Security Considerations

The project includes foundational security concepts, but a production version would require additional controls.

Important production considerations include:

- Strong password hashing
- Secure token storage
- Token expiration and rotation
- HTTPS
- Restricted CORS configuration
- Request rate limiting
- Input sanitization
- Parameterized SQL queries
- Protection against cross-site scripting
- Protection against cross-site request forgery where applicable
- Database least-privilege access
- Audit-log access restrictions
- Secure secret management
- Privacy and consent requirements
- Data-retention and deletion policies

Because the application domain involves parents and potentially managed accounts, a real deployment would also require careful legal, privacy, and child-safety review.

## Future Technical Improvements

- Replace repeated route logic with service-layer abstractions
- Add schema-based validation
- Add refresh-token support
- Add pagination to messages and activity history
- Add real-time messaging with WebSockets
- Add database migrations and seed scripts
- Add Docker development environments
- Add end-to-end frontend testing
- Add continuous integration
- Add API documentation with OpenAPI or Swagger
- Add centralized application logging
- Add message and activity search
- Add more granular permissions
- Add account-linking relationships
- Add production deployment configuration

## Skills Demonstrated

- Full-stack JavaScript development
- React frontend development
- Node.js and Express backend development
- REST API design
- MySQL database design
- Relational data modeling
- CRUD operations
- JSON Web Token authentication
- Role-based authorization
- Express middleware
- Request validation
- Error handling
- Activity and audit logging
- Automated API testing
- Asynchronous client-server communication
- Git-based version control
- Environment configuration
- Separation of concerns

## Project Status

This repository is a school project and portfolio piece. It demonstrates the construction of a full-stack application with a custom frontend, custom backend, relational database, authentication system, authorization rules, activity logging, and automated backend tests.

It is not presented as a production-ready parental-control platform. Its purpose is to demonstrate technical implementation, software architecture, and full-stack development experience.

## Author

**Brandon Clark**

Full-stack software developer with experience building custom web frontends, REST APIs, authentication systems, relational databases, and automated backend tests.
