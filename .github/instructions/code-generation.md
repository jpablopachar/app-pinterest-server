# Code Generation Instructions

## General Preferences

- Use EcmaScript 2020 syntax for JavaScript code.
- Follow JavaScript best practices and conventions.
- Use `const` and `let` instead of `var` for variable declarations.
- Use arrow functions for anonymous functions where appropriate.
- Use template literals for string interpolation.
- Use `async/await` for asynchronous code instead of callbacks or `.then()` chaining.
- Use `import` and `export` statements for module imports and exports.
- Use `async` functions for any function that contains asynchronous code.
- Use `try/catch` for error handling in asynchronous code.
- Keep functions short (<30 lines) and focused on a single responsibility.
- Document functions with JSDoc comments, including parameter and return types.
- Use `===` and `!==` for equality checks instead of `==` and `!=`.
- Include appropriate logging statements using `debug`, `info`, `warn`, and `error` levels.
- Follow the DRY (Don't Repeat Yourself) principle to avoid code duplication.

## Model/Entity Implementation Structure

Models should be implemented using Mongoose, a popular ODM (Object Data Modeling) library for MongoDB. The following guidelines should be followed:

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

## Controller Implementation Structure

Controllers should be implemented as ES6 modules, using async/await for asynchronous operations. The following guidelines should be followed:

```javascript
import Entity from '../models/entity.model.js'
import { responseReturn } from '../utils/res.util.js'
import { debug, error, info } from '../utils/logger.js'

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
  debug('Iniciando creación de entidad', { body: req.body })

  try {
    const { name, description } = req.body

    const entity = await Entity.create({
      name,
      description,
      owner: req.user._id,
    })

    info('Entidad creada con éxito', entity)

    responseReturn(res, 201, entity)
  } catch (err) {
    error('Error creando entidad', { error: err.message, stack: err.stack })

    responseReturn(res, 500, {
      message: 'Error creating entity',
      error: err.message,
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
  debug('Iniciando recuperación de entidades', { query: req.query })

  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: 'owner', // If populates are needed
    }

    const entities = await Entity.paginate({}, options)

    info('Entidades recuperadas con éxito', entities)

    responseReturn(res, 200, entities)
  } catch (err) {
    error('Error recuperando entidades', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error retrieving entities',
      error: err.message,
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
  debug('Iniciando recuperación de entidad por ID', { params: req.params })

  try {
    const { id } = req.params

    const entity = await Entity.findById(id).populate('owner')

    if (!entity) {
      return responseReturn(res, 404, {
        message: 'Entity not found',
      })
    }

    info('Entidad recuperada con éxito', entity)

    responseReturn(res, 200, entity)
  } catch (err) {
    error('Error recuperando entidad', { error: err.message, stack: err.stack })

    responseReturn(res, 500, {
      message: 'Error retrieving entity',
      error: err.message,
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
  debug('Iniciando actualización de entidad', {
    params: req.params,
    body: req.body,
  })

  try {
    const { id } = req.params
    const updates = req.body

    const options = { new: true, runValidators: true }

    const entity = await Entity.findById(id)

    if (!entity) {
      return responseReturn(res, 404, {
        message: 'Entity not found',
      })
    }

    if (entity.owner.toString() !== req.user._id.toString()) {
      return responseReturn(res, 403, {
        message: 'You do not have permission to update this entity',
      })
    }

    const updatedEntity = await Entity.findByIdAndUpdate(id, updates, options)

    info('Entidad actualizada con éxito', updatedEntity)

    responseReturn(res, 200, updatedEntity)
  } catch (err) {
    error('Error actualizando entidad', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error updating entity',
      error: err.message,
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
  debug('Iniciando eliminación de entidad', { params: req.params })

  try {
    const { id } = req.params

    const entity = await Entity.findById(id)

    if (!entity) {
      return responseReturn(res, 404, {
        message: 'Entity not found',
      })
    }

    if (entity.owner.toString() !== req.user._id.toString()) {
      return responseReturn(res, 403, {
        message: 'You do not have permission to delete this entity',
      })
    }

    await Entity.findByIdAndDelete(id)

    info('Entidad eliminada con éxito', { id })

    responseReturn(res, 200, {
      message: 'Entity successfully deleted',
    })
  } catch (err) {
    error('Error eliminando entidad', { error: err.message, stack: err.stack })

    responseReturn(res, 500, {
      message: 'Error deleting entity',
      error: err.message,
    })
  }
}
```
## Route Implementation Structure

Routes should be implemented using Express Router. The following guidelines should be followed:

```javascript
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