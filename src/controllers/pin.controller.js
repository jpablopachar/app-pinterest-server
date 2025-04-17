import Pin from '../models/pin.model.js'
import { debug, error, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Recupera una lista paginada de pines según los parámetros de consulta proporcionados.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express, que puede contener los siguientes parámetros de consulta:
 *   @param {string} [req.query.cursor] - Cursor de paginación (número de página).
 *   @param {string} [req.query.search] - Término de búsqueda para filtrar pines por título o etiquetas.
 *   @param {string} [req.query.userId] - ID del usuario para filtrar pines creados por ese usuario.
 *   @param {string} [req.query.boardId] - ID del tablero para filtrar pines asociados a ese tablero.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP con los pines recuperados o un mensaje de error.
 *
 * @description
 * Esta función permite recuperar pines de la base de datos aplicando filtros opcionales por búsqueda, usuario o tablero.
 * Implementa paginación utilizando un cursor y un límite fijo de resultados por página.
 * En caso de éxito, retorna un objeto con los pines y el cursor para la siguiente página (si existe).
 * En caso de error, retorna un mensaje descriptivo del problema encontrado.
 */
export const getPins = async (req, res) => {
  debug('Iniciando recuperación de pines', { query: req.query })

  const { cursor, search, userId, boardId } = req.query

  const pageNumber = Number(cursor) || 0
  const limit = 21

  try {
    const pins = await Pin.find(
      search
        ? {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { tags: { $in: [search] } },
            ],
          }
        : userId
        ? { user: userId }
        : boardId
        ? { board: boardId }
        : {}
    )
      .limit(limit)
      .skip(pageNumber * limit)

    const hasNextPage = pins.length === limit

    const response = { pins, nextCursor: hasNextPage ? pageNumber + 1 : null }

    info('Pines recuperados con éxito', response)

    responseReturn(res, 200, response)
  } catch (err) {
    error('Error al recuperar pines', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al recuperar pines',
      error: err.message,
    })
  }
}

/**
 * Recupera un pin específico por su ID.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express que contiene el ID del pin en los parámetros.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP con el pin recuperado o un mensaje de error.
 *
 * @description
 * Esta función busca y recupera un pin específico de la base de datos utilizando su ID.
 * En caso de éxito, retorna el objeto del pin completo.
 * Si el pin no existe, retorna un mensaje de error 404.
 * En caso de otros errores, retorna un mensaje descriptivo del problema encontrado.
 */
export const getPin = async (req, res) => {
  debug('Iniciando recuperación de pin por ID', { params: req.params })

  try {
    const { id } = req.params

    const pin = await Pin.findById(id).populate('user', 'username img displayName')

    if (!pin) {
      return responseReturn(res, 404, {
        message: 'Pin no encontrado',
      })
    }

    info('Pin recuperado con éxito', pin)

    responseReturn(res, 200, pin)
  } catch (err) {
    error('Error al recuperar pin', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al recuperar pin',
      error: err.message,
    })
  }
}

/**
 * Crea un nuevo pin en la base de datos.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express que contiene los datos del pin en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP con el pin creado o un mensaje de error.
 *
 * @description
 * Esta función crea un nuevo pin utilizando los datos proporcionados en el cuerpo de la solicitud.
 * Asocia automáticamente el pin al usuario autenticado que realiza la solicitud.
 * En caso de éxito, retorna el objeto del pin recién creado con un estado 201.
 * En caso de error, retorna un mensaje descriptivo del problema encontrado con un estado 500.
 */
export const createPin = async (req, res) => {
  debug('Iniciando creación de pin', { body: req.body })

  try {
    const { title, description, media, width, height, link, board, tags } = req.body

    const newPin = await Pin.create({
      title,
      description,
      media,
      width,
      height,
      link,
      board,
      tags,
      user: req.userId
    })

    info('Pin creado con éxito', newPin)

    responseReturn(res, 201, newPin)
  } catch (err) {
    error('Error al crear pin', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al crear pin',
      error: err.message,
    })
  }
}
