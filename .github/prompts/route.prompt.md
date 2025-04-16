# Express Router Generator

## Meta
This prompt generates Express router modules following best practices, RESTful principles, and the project's code style.

## Response Format
- The generated code will use ES Modules
- Will include complete documentation in Spanish with JSDoc
- Will follow the pattern of existing routes
- Will use camelCase for variable and function names
- Will integrate properly with Express middleware

## Warnings
- Do not mix route definitions with controller logic
- Use appropriate HTTP methods for each endpoint (GET, POST, PUT, DELETE)
- Implement proper middleware for validation and authentication
- Follow RESTful conventions for route naming
- Group related routes together for better organization
- Remember to update the main app.js or index.js file to include the new router

## Additional Context
To generate a specific router, provide:
1. Resource name (plural, lowercase)
2. Required endpoints (CRUD and any special operations)
3. Required middleware for validation and authentication
4. Relations with other resources for nested routes
5. Special route parameters or query parameters

### Router Example

```javascript
import { Router } from 'express'
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  // Import other controller functions as needed
} from '../controllers/resource.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validateResourceData } from '../middlewares/resource.validator.js'

/**
 * Router para gestionar los recursos de la aplicación.
 * 
 * Este router define las rutas para las operaciones CRUD básicas sobre los recursos,
 * así como rutas especializadas para operaciones específicas. Incluye:
 * - Rutas públicas (no requieren autenticación)
 * - Rutas protegidas (requieren autenticación)
 * - Rutas anidadas (para recursos relacionados)
 * - Operaciones especializadas
 *
 * @module resourceRouter
 */
export const resourceRouter = Router()

// Rutas públicas (no requieren autenticación)
/**
 * Obtiene todos los recursos con soporte para paginación.
 * 
 * @name GET /resources
 * @function
 * @memberof module:resourceRouter
 */
resourceRouter.get('/', getAllResources)

/**
 * Obtiene un recurso específico por su ID.
 * 
 * @name GET /resources/:id
 * @function
 * @memberof module:resourceRouter
 */
resourceRouter.get('/:id', getResourceById)

// Rutas protegidas (requieren autenticación)
/**
 * Crea un nuevo recurso.
 * 
 * @name POST /resources
 * @function
 * @memberof module:resourceRouter
 */
resourceRouter.post('/', authMiddleware, validateResourceData, createResource)

/**
 * Actualiza un recurso existente por su ID.
 * 
 * @name PUT /resources/:id
 * @function
 * @memberof module:resourceRouter
 */
resourceRouter.put('/:id', authMiddleware, validateResourceData, updateResource)

/**
 * Elimina un recurso existente por su ID.
 * 
 * @name DELETE /resources/:id
 * @function
 * @memberof module:resourceRouter
 */
resourceRouter.delete('/:id', authMiddleware, deleteResource)

/**
 * Código para actualizar el archivo index.js:
 * 
 * import { resourceRouter } from './routes/resource.route.js'
 * 
 * // Agregar el router a la aplicación Express
 * app.use('/resources', resourceRouter)
 */
```