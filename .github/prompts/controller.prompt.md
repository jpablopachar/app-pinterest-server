# Express Controller Generator

## Meta
This prompt generates Express controller modules following best practices, SOLID principles, and the project's code style.

## Response Format
- The generated code will use ES Modules
- Will include complete documentation in Spanish with JSDoc
- Will follow the pattern of existing controllers
- Will use camelCase for function and variable names
- Will implement proper error handling with try/catch blocks
- Will use async/await for asynchronous operations

## Warnings
- Do not mix controller logic with model or route logic
- Ensure all controller functions validate input parameters
- Always include appropriate HTTP status codes in responses
- Use the project's standard response format via responseReturn utility
- Implement proper logging using the project's logger utility
- Keep controller functions focused on a single responsibility

## Additional Context
To generate a specific controller, provide:
1. Resource name (singular, camelCase)
2. Required operations (CRUD and any special operations)
3. Required validations
4. Required relations with other resources
5. Special business rules or requirements

### Controller Example

```javascript
import Model from '../models/model.js'
import { debug, error, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Crea un nuevo recurso en la base de datos.
 * 
 * Este controlador recibe los datos del recurso desde el cuerpo de la solicitud,
 * valida los campos requeridos y crea un nuevo documento en la colección correspondiente.
 *
 * @async
 * @function createResource
 * @param {import('express').Request} req - Objeto de solicitud de Express con los datos del recurso en el body.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const createResource = async (req, res) => {
  debug('Iniciando creación de recurso', { body: req.body })

  try {
    const { field1, field2, field3 } = req.body

    const resource = await Model.create({
      field1,
      field2,
      field3,
      owner: req.user._id,
    })

    info('Recurso creado con éxito', resource)

    responseReturn(res, 201, resource)
  } catch (err) {
    error('Error al crear el recurso', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al crear el recurso',
      error: err.message,
    })
  }
}

/**
 * Obtiene todos los recursos con soporte para paginación.
 *
 * @async
 * @function getAllResources
 * @param {import('express').Request} req - Objeto de solicitud de Express con parámetros de consulta para paginación.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const getAllResources = async (req, res) => {
  debug('Obteniendo lista de recursos', { query: req.query })

  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: 'owner',
    }

    const resources = await Model.paginate({}, options)

    info('Recursos obtenidos con éxito', { count: resources.docs.length })

    responseReturn(res, 200, resources)
  } catch (err) {
    error('Error al obtener recursos', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al obtener recursos',
      error: err.message,
    })
  }
}

/**
 * Obtiene un recurso específico por su ID.
 *
 * @async
 * @function getResourceById
 * @param {import('express').Request} req - Objeto de solicitud de Express con el ID del recurso en params.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const getResourceById = async (req, res) => {
  const { id } = req.params
  debug('Obteniendo recurso por ID', { id })

  try {
    const resource = await Model.findById(id).populate('owner')

    if (!resource) {
      return responseReturn(res, 404, {
        message: 'Recurso no encontrado',
      })
    }

    info('Recurso obtenido con éxito', resource)

    responseReturn(res, 200, resource)
  } catch (err) {
    error('Error al obtener el recurso', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al obtener el recurso',
      error: err.message,
    })
  }
}

/**
 * Actualiza un recurso existente por su ID.
 *
 * @async
 * @function updateResource
 * @param {import('express').Request} req - Objeto de solicitud de Express con el ID del recurso en params y los datos a actualizar en body.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const updateResource = async (req, res) => {
  const { id } = req.params
  debug('Actualizando recurso', { id, body: req.body })

  try {
    const resource = await Model.findById(id)

    if (!resource) {
      return responseReturn(res, 404, {
        message: 'Recurso no encontrado',
      })
    }

    // Verificar permisos
    if (resource.owner.toString() !== req.user._id.toString()) {
      return responseReturn(res, 403, {
        message: 'No tienes permisos para actualizar este recurso',
      })
    }

    const updatedResource = await Model.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    info('Recurso actualizado con éxito', updatedResource)

    responseReturn(res, 200, updatedResource)
  } catch (err) {
    error('Error al actualizar el recurso', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al actualizar el recurso',
      error: err.message,
    })
  }
}

/**
 * Elimina un recurso existente por su ID.
 *
 * @async
 * @function deleteResource
 * @param {import('express').Request} req - Objeto de solicitud de Express con el ID del recurso en params.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const deleteResource = async (req, res) => {
  const { id } = req.params
  debug('Eliminando recurso', { id })

  try {
    const resource = await Model.findById(id)

    if (!resource) {
      return responseReturn(res, 404, {
        message: 'Recurso no encontrado',
      })
    }

    // Verificar permisos
    if (resource.owner.toString() !== req.user._id.toString()) {
      return responseReturn(res, 403, {
        message: 'No tienes permisos para eliminar este recurso',
      })
    }

    await Model.findByIdAndDelete(id)

    info('Recurso eliminado con éxito', { id })

    responseReturn(res, 200, {
      message: 'Recurso eliminado correctamente',
    })
  } catch (err) {
    error('Error al eliminar el recurso', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al eliminar el recurso',
      error: err.message,
    })
  }
}
```