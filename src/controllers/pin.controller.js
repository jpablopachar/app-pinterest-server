import Pin from '../models/pin.model.js'
import { debug, error, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Obtiene todos los pines con soporte para paginación.
 *
 * Este controlador recupera pines de la base de datos con opciones de paginación.
 * Permite filtrar, ordenar y limitar los resultados según los parámetros de consulta.
 *
 * @async
 * @function getPins
 * @param {import('express').Request} req - Objeto de solicitud de Express con parámetros de consulta para paginación.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const getPins = async (req, res) => {
  debug('Iniciando recuperación de pines', { query: req.query })

  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: 'creator',
    }

    const pins = await Pin.paginate({}, options)

    info('Pines recuperados con éxito', { count: pins.docs.length })

    responseReturn(res, 200, pins)
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
