# GitHub Copilot Project Instructions

## Project Overview

This project is a backend server for a Pinterest-like application. It uses Node.js with Express to handle HTTP routes, MongoDB for data storage via Mongoose, and several libraries for authentication, file handling, and image processing. The goal is to provide a robust API for managing users, images, and pin collections.

## Architecture Guidelines

### Folder Structure

- **.env**: Environment variables configuration file.
- **src/**: Main source code for the application.
  - **index.js**: Entry point for the server.
  - **constants/**: Application-wide constants and configuration.
  - **controllers/**: Route handler logic for different resources.
  - **models/**: Mongoose schemas and models.
  - **routes/**: Express route definitions.
  - **utils/**: Utility functions and helpers.

### Model Pattern

Models should follow this guidelines:
- Use Mongoose schemas to define the structure of the data.
- Use appropriate data types for each field (e.g., `String`, `Number`, `Date`, `Boolean`, `Array`, `ObjectId`).
- Use `required` and `default` properties to enforce validation rules.
- Use `ref` to create relationships between models (e.g., referencing other models).
- Use `timestamps` to automatically manage `createdAt` and `updatedAt` fields.
- Use `toJSON` and `toObject` options to customize the output of the model when converted to JSON or plain objects.
- Use `virtuals` to define computed properties that are not stored in the database but can be derived from existing fields.
- Use `pre` and `post` middleware to perform actions before or after certain operations (e.g., saving, removing).
- Use `index` to create indexes on fields for better query performance.
- Use `lean` queries for read operations to improve performance when you don't need Mongoose document methods.
- Use `populate` to retrieve related documents from referenced models.
- Use `aggregate` for complex queries that require data transformation or aggregation.
- Use `mongoose-paginate` or similar plugins for pagination support.
- Use `mongoose-unique-validator` to enforce unique constraints on fields.

### Controller Pattern

Controllers should follow this guidelines:
- Use async/await for asynchronous operations.
- Use try/catch blocks to handle errors gracefully.
- Use a consistent naming convention for controller functions (e.g., `createEntity`, `getEntityById`, etc.).
- Document the purpose and usage of each controller function clearly.
- Use appropriate HTTP status codes for responses (e.g., 200 for success, 201 for created, 400 for bad request, 404 for not found, etc.).
- Use a consistent error handling strategy, including logging errors and returning meaningful error messages to the client.

### Route Pattern

Routes should follow this guidelines:
- Use Express Router to define routes for each resource.
- Use a consistent folder structure for routes.
- Group related routes together for better organization.
- Ensure that all routes are properly documented.
- Implement middleware for authentication and validation as needed.
- Use appropriate HTTP methods (GET, POST, PUT, DELETE) for each route.
- Use meaningful route names and parameters.
- Follow RESTful conventions for route design.
- Ensure routes are properly documented with descriptions and parameter details.

This pattern demonstrates:
1. Grouping routes by access level (public vs protected)
2. Using middleware for authentication and validation
3. Supporting RESTful operations (CRUD)
4. Supporting nested resources and specialized operations
5. Including batch operations for efficiency

## Code Style Guidelines

### Naming Conventions
- Models: lowercase (e.g., `user.model.js`, `pin.model.js`)
- Controllers: lowercase (e.g., `user.controller.js`, `pin.controller.js`)
- Routes: lowercase (e.g., `user.routes.js`, `pin.routes.js`)
- Constants: lowercase (e.g., `config.js`)

### Documentation
- The generated documentation should be in Spanish.
- Use JSDoc comments for all functions, including parameters and return types.

## Good general practices
- Always validate the parameters at the beginning of the functions with express-validator
- Applies solid principles in all implementations
- Apply DRY (Don't Repeat Yourself) principles
- Apply clean code principles
- Use descriptive variable and function names
- Use consistent formatting (indentation, spacing, etc.)
- Use async/await for asynchronous operations
- Use try/catch blocks to handle errors gracefully
- Use environment variables for sensitive information (e.g., database connection strings, API keys)
- Use a consistent error handling strategy (e.g., custom error classes, middleware)