# Parent-Focused Social Messaging Platform

A full-stack school portfolio project that I continued expanding after the course that's built to demonstrate practical experience with web and mobile application architecture, REST API development, authentication, relational databases, and automated backend testing.

The parent-focused messaging concept provided a realistic domain for implementing user accounts, permissions, communication, preferences, and activity logging. This repository is presented as a portfolio project rather than a production-ready parental-control platform.

## Technology Stack

**Frontend**
- React Native
- JavaScript
- HTML
- CSS

**Backend**
- Node.js
- Express.js
- REST API architecture

**Database**
- MySQL
- Relational data modeling
- Primary and foreign key relationships

**Security and Testing**
- JSON Web Token authentication
- Role-based authorization
- Jest
- Supertest

**Development Tools**
- Git
- GitHub
- npm
- Visual Studio Code

## Architecture

The application uses a separated client-server architecture:

```text
React Native Frontend
      |
      | HTTP requests and JSON responses
      v
Node.js + Express REST API
      |
      | Authentication, authorization,
      | validation, and business logic
      v
MySQL Database
```

This structure separates presentation, application logic, and data persistence, making the project easier to maintain, test, and extend.

## Technical Implementation

The React Native frontend manages interface state, form input, and communication with the backend.

The Express backend provides resource-based API routes for:

- Authentication
- Users
- Messages
- Preferences
- Roles and permissions
- Activity records

Authentication middleware verifies JSON Web Tokens before protected routes are executed. Role-based middleware provides an additional authorization layer for restricted operations.

MySQL stores persistent application data using related tables for users, roles, messages, preferences, and activity events.

## What the Features Demonstrate

### Messaging

The messaging system demonstrates:

- Relational records involving multiple users
- Sender and recipient validation
- Ownership and access-control checks
- Timestamped data
- Conversation-history queries
- Structured JSON responses

### User Roles

Role-based permissions demonstrate:

- Authentication versus authorization
- Reusable Express middleware
- Protected API routes
- Separation of security logic from route handlers

### Preferences

Persisted user settings demonstrate:

- User-owned database records
- CRUD operations
- Form-to-API-to-database data flow
- Persistent application state

### Activity Logging

Activity records demonstrate:

- Audit-style event tracking
- User-to-event database relationships
- Timestamped and categorized records
- Queryable application histories
- Cross-cutting backend behavior

## Testing

Jest and Supertest are used to test the backend at the HTTP layer.

Test coverage includes areas such as:

- Successful and failed authentication
- Protected route access
- Role-restricted operations
- Validation failures
- Record creation
- Response status codes
- JSON response structures

These tests verify API behavior without requiring manual browser testing and provide protection against regressions.

## Skills Demonstrated

- Full-stack JavaScript development
- React Native frontend development
- Node.js and Express backend development
- REST API design
- MySQL database design
- Relational data modeling
- CRUD operations
- JWT authentication
- Role-based access control
- Express middleware
- Request validation
- Error handling
- Activity and audit logging
- Automated API testing
- Asynchronous client-server communication
- Git-based version control
- Separation of concerns

## Design Choices

Several design decisions were made to keep the project organized and extensible:

- Frontend, backend, and database responsibilities are separated.
- Authentication and authorization are implemented as reusable middleware.
- Application data is stored in a relational schema instead of frontend-only state.
- API routes are organized by resource and responsibility.
- Activity history is stored separately from primary user and message data.
- Environment variables are used for database credentials and application secrets.
- Automated tests verify backend behavior and protected routes.

## Local Setup

### Requirements

- Node.js
- npm
- MySQL
- Git

### Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Configure Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=replace_with_a_secure_secret
```

### Create the Database

```bash
mysql -u your_database_user -p your_database_name < database/schema.sql
```

### Run the Application

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

### Run Backend Tests

```bash
cd backend
npm test
```

## Portfolio Context

This project was completed as school work to apply and demonstrate full-stack development concepts in a complete application.

It highlights my ability to:

- Design a relational database
- Build a custom REST API
- Connect a frontend to a backend
- Implement authentication and permissions
- Organize application logic with middleware and routes
- Test backend behavior
- Make architectural choices that support maintainability and future expansion

The application is not presented as a finished commercial product. Its purpose is to demonstrate the technologies, development practices, and software design skills I can apply to web and software development roles.

## Author

**Brandon Clark**

Web and software developer with experience building custom frontends, REST APIs, authentication systems, relational databases, and automated backend tests.
