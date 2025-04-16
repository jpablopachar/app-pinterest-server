# Code Review Instructions

## Code Analysis Approach
1. **Readability**: Ensure the code is easy to read and understand. Focus on clear ES6+ syntax, consistent formatting, and appropriate JSDoc comments for our Express/MongoDB backend.
2. **Functionality**: Verify that API endpoints perform their intended functions correctly. Check for proper request validation, error handling, and response formatting.
3. **Efficiency**: Assess database query efficiency, particularly with MongoDB/Mongoose. Look for proper indexing, efficient query patterns, and appropriate use of methods like `populate()` and `lean()`.
4. **Best Practices**: Ensure the code follows Node.js and Express best practices. This includes proper middleware usage, route organization, and controller patterns.
5. **Security**: Check for authentication/authorization implementation, proper password hashing, JWT handling, and protection against common web vulnerabilities.
6. **Testing**: Ensure that routes and controllers have appropriate test coverage, with proper mocking of database operations.
7. **Documentation**: Verify that the API endpoints are well-documented with JSDoc comments and that models have clear schema definitions.

## Issues to Identity

### Structural Issues
- **Controller Bloat**: Look for controller functions that handle too many responsibilities and should be split into smaller, more focused functions.
- **Middleware Organization**: Check if middleware functions are properly organized and reused across similar routes.
- **Model-Controller Separation**: Ensure business logic is properly separated between models and controllers, following the MVC pattern.
- **Route Organization**: Verify that routes are organized logically by resource and that route parameters are used consistently.
- **Inconsistent Response Format**: Check for consistent response formatting across all API endpoints using the utility functions.
- **Error Handling Patterns**: Look for consistent error handling patterns across controllers, particularly for async/await usage.
- **Configuration Management**: Ensure environment variables and configuration settings are properly managed and not hardcoded.
- **Mongoose Schema Design**: Check if Mongoose schemas are well-designed with appropriate validation, indexes, and relationships.
- **Authentication Flow**: Verify that the authentication flow is consistent across protected routes using proper middleware.
- **File Upload Handling**: Ensure proper handling of file uploads with appropriate validations, processing, and storage.
- **Insufficient Documentation**: Check for comprehensive JSDoc comments on controllers, models, and utility functions.

### Performance Issues
- **Inefficient Mongoose Queries**: Look for queries that could be optimized with proper indexing, projection, or lean() execution.
- **N+1 Query Problems**: Identify instances where multiple database queries are executed in loops instead of using more efficient batch operations.
- **Missing Database Indexes**: Check if appropriate indexes are defined for frequently queried fields, especially in large collections.
- **Excessive Population**: Look for deep or nested population operations that could be optimized or simplified.
- **Image Processing Bottlenecks**: Identify potential bottlenecks in image processing operations using Sharp or other libraries.
- **Unoptimized Aggregation Pipelines**: Check for MongoDB aggregation pipelines that could be optimized for better performance.
- **Authentication Overhead**: Look for repeated token validation or user lookups that could be optimized.
- **Excessive Middleware**: Check for routes with too many middleware functions that could impact request processing time.

### Security Issues
- **SQL Injection**: Look for instances where user input is directly used in SQL queries without proper sanitization or parameterization.
- **Cross-Site Scripting (XSS)**: Identify areas where user input is displayed on the web page without proper escaping or sanitization, leading to potential XSS attacks.
- **Cross-Site Request Forgery (CSRF)**: Check for proper CSRF protection in web applications, ensuring that state-changing requests are protected against CSRF attacks.
- **Sensitive Data Exposure**: Look for instances where sensitive data, such as passwords or API keys, are exposed in the code or logs.
- **Insecure Dependencies**: Check for the use of outdated or vulnerable libraries and dependencies. Ensure that all dependencies are up to date and secure.
- **Improper Authentication**: Identify areas where authentication is not properly implemented, such as weak password policies or lack of two-factor authentication.
- **Insecure Communication**: Look for instances where sensitive data is transmitted over insecure channels, such as HTTP instead of HTTPS.
- **Improper Input Validation**: Check for proper input validation to ensure that user input is sanitized and validated before being processed.

### Code Style Issues
- **Inconsistent Formatting**: Look for inconsistent formatting, such as indentation, spacing, and line breaks. Ensure that the code follows a consistent style guide.
- **Long Lines**: Identify lines that are too long and should be broken up for better readability. This includes lines that exceed the maximum line length specified in the style guide.
- **Trailing Whitespace**: Check for trailing whitespace at the end of lines, which can lead to unnecessary diffs in version control.
- **Unnecessary Semicolons**: Check for unnecessary semicolons in ES6+ modules. Since this is a modern Node.js application, verify consistent semicolon usage across files.
- **Unused Imports**: Identify unused imports from packages like express-validator, mongoose, or authentication libraries that could increase bundle size unnecessarily.
- **Unnecessary Comments**: Look for redundant JSDoc comments that don't provide meaningful context beyond what the code already expresses, particularly in controllers and route files.
- **Inconsistent Comment Style**: Ensure consistent JSDoc format across the codebase, with proper description, @param, @returns tags in Spanish as per project guidelines.

### Response Format
- **Summary**: Provide a structured summary of the code review for the Pinterest-like backend, highlighting API design, controller implementation, image handling, and authentication issues.
- **Positive Feedback**: Include specific positive feedback on model design, validation implementation, error handling practices, and documentation quality.

## Common Anti-patterns to Look For
- **Controller Bloat**: Controllers that handle too many responsibilities instead of focusing on request handling, delegating business logic to services.
- **Router Spaghetti**: Route definitions that are disorganized, with inconsistent parameter naming or middleware application across similar endpoints.
- **Mongoose Anti-patterns**: Repeated query patterns that could be abstracted into model methods or improper use of Mongoose features like virtuals and middleware.
- **Error Handling Inconsistency**: Inconsistent error handling approaches across different controllers or route handlers.
- **Authentication Duplication**: Reimplementing authentication logic across multiple controllers rather than using centralized middleware.

## Performance Optimization Suggestions
- **MongoDB Query Optimization**: Use proper indexing on frequently queried fields like username, pin categories, and search terms.
- **Image Processing Pipeline**: Implement efficient image processing pipelines using Sharp with proper caching of processed images.
- **Pagination Implementation**: Use cursor-based pagination for large collections like pins and user feeds instead of offset-based pagination.
- **Mongoose Projection**: Use field projection in Mongoose queries to retrieve only necessary fields, especially for large documents.
- **Connection Pooling**: Configure proper MongoDB connection pooling settings based on expected application load.

## Security Best Practices
- **JWT Best Practices**: Implement proper JWT handling with appropriate expiration times, refresh token rotation, and secure cookie settings.
- **Image Upload Validation**: Validate image uploads thoroughly for file type, size, and content before processing and storage.
- **Rate Limiting**: Implement rate limiting for sensitive endpoints like authentication, pin creation, and user operations.
- **Content Security Policy**: Establish appropriate CSP headers for API responses, especially when serving user-generated content.
- **Environment Variable Security**: Ensure proper separation of development and production environment variables, with secure storage of sensitive values.

## Code Style Recommendations
- **ES Module Consistency**: Ensure consistent usage of ES modules with proper import/export syntax across the codebase.
- **Express Middleware Organization**: Organize middleware functions logically, separating validation, authentication, and business logic concerns.
- **Controller Method Naming**: Follow the established naming convention for controller functions (e.g., `createPin`, `getUserPins`, etc.).
- **Error Response Format**: Maintain a consistent error response format across all API endpoints, using the defined response utility functions.
- **Mongoose Schema Definitions**: Follow a consistent pattern for schema definitions with proper types, validations, and index declarations.
