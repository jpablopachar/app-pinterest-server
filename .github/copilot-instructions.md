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

Our models follow a consistent structure using Mongoose schemas. Below is an abstract example that can be applied to any entity in the system:

```javascript
// Example Model Pattern
import { Schema, model } from 'mongoose'

// Schema definition with common fields
const EntitySchema = new Schema(
  {
    // Basic identification
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    // Optional description
    description: {
      type: String,
      trim: true,
    },

    // Reference to another model (relation)
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Nested objects
    metadata: {
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active',
      },
    },

    // Array of simple values
    tags: [String],

    // Array of object references
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Export the model
export default model('Entity', EntitySchema)
```

### Controller Pattern

Our controllers follow a consistent pattern for handling CRUD operations and other specific actions. Here's an abstract example that can be applied to any entity in the system:

```javascript
// Example Controller Pattern
import Entity from '../models/entity.model.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Crea una nueva entidad en la base de datos.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene los datos de la entidad en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta HTTP utilizado para enviar la respuesta al cliente.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía una respuesta HTTP al cliente.
 *
 * @description
 * Esta función valida los campos requeridos del cuerpo de la solicitud.
 * Si falta algún campo requerido, responde con un error 400.
 * Si todos los campos están presentes, crea una nueva entidad en la base de datos
 * y responde con los detalles de la entidad.
 */
export const createEntity = async (req, res) => {
  try {
    const { name, description } = req.body

    // Validate required fields
    if (!name) {
      return responseReturn(res, 400, {
        message: 'All required fields must be provided',
      })
    }

    // Create entity
    const entity = await Entity.create({
      name,
      description,
      owner: req.user._id, // If authentication is required
    })

    // Return successful response
    responseReturn(res, 201, entity)
  } catch (error) {
    responseReturn(res, 500, {
      message: 'Error creating entity',
      error: error.message,
    })
  }
}

/**
 * Recupera todas las entidades con soporte de paginación.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP con parámetros de consulta para paginación.
 * @param {import('express').Response} res - Objeto de respuesta HTTP utilizado para enviar la respuesta al cliente.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía una respuesta HTTP al cliente.
 *
 * @description
 * Esta función recupera entidades de la base de datos con soporte de paginación.
 * Acepta parámetros de consulta para opciones de página, límite y ordenación.
 */
export const getAllEntities = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: 'owner', // If populates are needed
    }

    const entities = await Entity.paginate({}, options)

    responseReturn(res, 200, entities)
  } catch (error) {
    responseReturn(res, 500, {
      message: 'Error retrieving entities',
      error: error.message,
    })
  }
}

/**
 * Recupera una entidad por su ID.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP con el ID de la entidad en los parámetros.
 * @param {import('express').Response} res - Objeto de respuesta HTTP utilizado para enviar la respuesta al cliente.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía una respuesta HTTP al cliente.
 *
 * @description
 * Esta función recupera una entidad de la base de datos por su ID.
 * Si no se encuentra la entidad, responde con un error 404.
 */
export const getEntityById = async (req, res) => {
  try {
    const { id } = req.params

    const entity = await Entity.findById(id).populate('owner')

    if (!entity) {
      return responseReturn(res, 404, {
        message: 'Entity not found',
      })
    }

    responseReturn(res, 200, entity)
  } catch (error) {
    responseReturn(res, 500, {
      message: 'Error retrieving entity',
      error: error.message,
    })
  }
}

/**
 * Actualiza una entidad por su ID.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP con el ID de la entidad en los parámetros y los datos de actualización en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta HTTP utilizado para enviar la respuesta al cliente.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía una respuesta HTTP al cliente.
 *
 * @description
 * Esta función actualiza una entidad en la base de datos por su ID.
 * Primero comprueba si la entidad existe y si el usuario tiene permiso para actualizarla.
 * Si alguna comprobación falla, responde con un error apropiado.
 * De lo contrario, actualiza la entidad y responde con la entidad actualizada.
 */
export const updateEntity = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Options: new returns the updated document
    const options = { new: true, runValidators: true }

    // Check existence and permissions
    const entity = await Entity.findById(id)

    if (!entity) {
      return responseReturn(res, 404, {
        message: 'Entity not found',
      })
    }

    // Check permissions (example)
    if (entity.owner.toString() !== req.user._id.toString()) {
      return responseReturn(res, 403, {
        message: 'You do not have permission to update this entity',
      })
    }

    const updatedEntity = await Entity.findByIdAndUpdate(id, updates, options)

    responseReturn(res, 200, updatedEntity)
  } catch (error) {
    responseReturn(res, 500, {
      message: 'Error updating entity',
      error: error.message,
    })
  }
}

/**
 * Elimina una entidad por su ID.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP con el ID de la entidad en los parámetros.
 * @param {import('express').Response} res - Objeto de respuesta HTTP utilizado para enviar la respuesta al cliente.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía una respuesta HTTP al cliente.
 *
 * @description
 * Esta función elimina una entidad de la base de datos por su ID.
 * Primero comprueba si la entidad existe y si el usuario tiene permiso para eliminarla.
 * Si alguna comprobación falla, responde con un error apropiado.
 * De lo contrario, elimina la entidad y responde con un mensaje de éxito.
 */
export const deleteEntity = async (req, res) => {
  try {
    const { id } = req.params

    // Check existence and permissions
    const entity = await Entity.findById(id)

    if (!entity) {
      return responseReturn(res, 404, {
        message: 'Entity not found',
      })
    }

    // Check permissions (example)
    if (entity.owner.toString() !== req.user._id.toString()) {
      return responseReturn(res, 403, {
        message: 'You do not have permission to delete this entity',
      })
    }

    await Entity.findByIdAndDelete(id)

    responseReturn(res, 200, {
      message: 'Entity successfully deleted',
    })
  } catch (error) {
    responseReturn(res, 500, {
      message: 'Error deleting entity',
      error: error.message,
    })
  }
}
```

### Route Pattern

Our route definitions follow a consistent pattern using Express Router. Here's an abstract example that can be applied to any entity in the system:

```javascript
// Example Route Pattern
import { Router } from 'express'
import {
  createEntity,
  getAllEntities,
  getEntityById,
  updateEntity,
  deleteEntity,
  // Import other controller functions as needed
} from '../controllers/entity.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validateEntityData } from '../middleware/validation.middleware.js'

export const entityRouter = Router()

// Public routes (no authentication required)
entityRouter.get('/', getAllEntities)
entityRouter.get('/:id', getEntityById)

// Protected routes (authentication required)
entityRouter.post('/', authMiddleware, validateEntityData, createEntity)
entityRouter.put('/:id', authMiddleware, validateEntityData, updateEntity)
entityRouter.delete('/:id', authMiddleware, deleteEntity)

// Nested routes (for related resources)
entityRouter.get('/:id/related', getRelatedResources)
entityRouter.post('/:id/related', authMiddleware, addRelatedResource)

// Specialized operations
entityRouter.patch('/:id/status', authMiddleware, updateEntityStatus)
entityRouter.get('/search', searchEntities)
entityRouter.get('/categories/:categoryId', getEntitiesByCategory)

// Batch operations
entityRouter.post('/batch', authMiddleware, batchCreateEntities)
entityRouter.delete('/batch', authMiddleware, batchDeleteEntities)
```

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
- Always validate the parameters at the beginning of the functions
- Applies solid principles in all implementations
- Apply DRY (Don't Repeat Yourself) principles
- Apply clean code principles
- Use descriptive variable and function names
- Use consistent formatting (indentation, spacing, etc.)
- Use async/await for asynchronous operations
- Use try/catch blocks to handle errors gracefully
- Use environment variables for sensitive information (e.g., database connection strings, API keys)
- Use a consistent error handling strategy (e.g., custom error classes, middleware)