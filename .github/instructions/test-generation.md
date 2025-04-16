# Test Generation Instructions

## Testing Patterns

### Unit Testing

- Use Jest as the primary testing framework
- Follow the Arrange-Act-Assert pattern for test structure
- Create separate test files for each module with naming convention: `*.test.js`
- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Use beforeEach/afterEach for test setup and cleanup
- Isolate tests by mocking external dependencies

### Integration Testing

- Test interactions between multiple components
- Focus on API endpoints and database operations
- Use supertest for HTTP endpoint testing
- Set up test database instances for integration tests

### End-to-End Testing

- Test complete user flows and scenarios
- Verify that all components work together correctly

## Test Coverage Goals

- 100% coverage for service layer
- Minimum 80% general coverage
- Test all branches of conditional logic
- Test input validation and error handling
- Verify that exceptions contain appropriate messages

## Mocking and Test Setup

### Mocking Dependencies

- Use Jest's mock functions (`jest.fn()`) for simple function mocks
- Use Jest's mock modules (`jest.mock()`) for entire module mocks
- Create mock implementations that return predictable test data
- Test both success and error scenarios by configuring mock returns

### Database Testing

- Use MongoDB Memory Server for database tests
- Set up seed data before tests and clean up after tests
- Isolate database tests to prevent test interference

### Authentication Testing

- Mock JWT verification for protected routes
- Create test users with different permission levels
- Test both authenticated and unauthenticated scenarios

## Example Controller Test Structure

```javascript
/**
 * Pruebas para el controlador de usuario
 *
 * Este archivo contiene pruebas unitarias para las funciones del controlador
 * de usuario, cubriendo casos normales y casos de error.
 */
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/user.controller.js'
import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Mock de las dependencias
jest.mock('../models/user.model.js')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')
jest.mock('../utils/logger.js', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}))

describe('User Controller', () => {
  let req
  let res

  // Configuración común antes de cada prueba
  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
      params: {},
      user: { _id: 'user123' },
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    }

    // Limpiar todos los mocks
    jest.clearAllMocks()
  })

  describe('registerUser', () => {
    /**
     * Prueba que verifica que el registro de usuario funciona correctamente
     * cuando se proporcionan datos válidos.
     */
    it('should register a new user and return user details with token', async () => {
      // Arrange
      const hashedPassword = 'hashedpassword123'
      const token = 'jwt-token-123'
      const createdUser = {
        _id: 'user123',
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          hashedPassword,
        }),
      }

      bcrypt.hash.mockResolvedValue(hashedPassword)
      User.create.mockResolvedValue(createdUser)
      jwt.sign.mockReturnValue(token)

      // Act
      await registerUser(req, res)

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        hashedPassword,
      })
      expect(jwt.sign).toHaveBeenCalled()
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        token,
        expect.any(Object)
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
        })
      )
      expect(res.json.mock.calls[0][0]).not.toHaveProperty('hashedPassword')
    })

    /**
     * Prueba que verifica el manejo adecuado de errores cuando falla
     * la creación del usuario.
     */
    it('should handle errors when user creation fails', async () => {
      // Arrange
      const errorMessage = 'Database connection failed'
      User.create.mockRejectedValue(new Error(errorMessage))

      // Act
      await registerUser(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          error: errorMessage,
        })
      )
    })
  })

  // Additional test groups for other controller functions
})
```

## Example Route Test Structure

```javascript
/**
 * Pruebas de integración para las rutas de usuario
 *
 * Este archivo contiene pruebas que verifican el comportamiento completo
 * de las rutas de API, incluyendo middleware, validación y controladores.
 */
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../index.js'
import User from '../models/user.model.js'

describe('User Routes', () => {
  let mongoServer

  // Configurar la base de datos antes de todas las pruebas
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  // Limpiar datos después de cada prueba
  afterEach(async () => {
    await User.deleteMany({})
  })

  // Cerrar la conexión después de todas las pruebas
  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  describe('POST /api/users/register', () => {
    /**
     * Prueba que verifica que la ruta de registro funciona correctamente
     * con datos válidos.
     */
    it('should register a new user successfully with valid data', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        displayName: 'New User',
        email: 'new@example.com',
        password: 'password123',
      }

      // Act
      const response = await request(app)
        .post('/api/users/register')
        .send(userData)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('username', 'newuser')
      expect(response.body).not.toHaveProperty('hashedPassword')

      // Verify cookie was set
      expect(response.headers['set-cookie']).toBeDefined()

      // Verify user was saved to database
      const savedUser = await User.findOne({ username: 'newuser' })
      expect(savedUser).toBeDefined()
    })

    /**
     * Prueba que verifica que la ruta de registro maneja correctamente
     * datos de entrada inválidos.
     */
    it('should return validation errors with invalid data', async () => {
      // Arrange
      const invalidData = {
        username: '',
        email: 'not-an-email',
        password: '123',
      }

      // Act
      const response = await request(app)
        .post('/api/users/register')
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('errors')
      expect(response.body.errors).toBeInstanceOf(Array)
    })
  })
})
```
