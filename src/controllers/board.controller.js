import Board from '../models/board.model.js'
import Pin from '../models/pin.model.js'
import { debug, error, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Obtiene los tableros de un usuario específico, incluyendo detalles adicionales como la cantidad de pines
 * y el primer pin de cada tablero.
 *
 * @async
 * @function getUserBoards
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el parámetro userId.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Devuelve una respuesta HTTP con el listado de tableros y sus detalles, o un error en caso de fallo.
 *
 * @throws {Error} Si ocurre un error al obtener los tableros del usuario, se retorna un error 500.
 */
export const getUserBoards = async (req, res) => {
  debug('Iniciando la obtención de tableros del usuario...', {
    params: req.params,
  })

  try {
    const { userId } = req.params

    const boards = await Board.find({ user: userId })

    info('Tableros obtenidos:', {
      userId,
      boardsCount: boards.length,
    })

    const boardsWithPinDetails = await Promise.all(
      boards.map(async (board) => {
        const pinCount = await Pin.countDocuments({ board: board._id })
        const firstPin = await Pin.findOne({ board: board._id })

        return {
          ...board.toObject(),
          pinCount,
          firstPin,
        }
      })
    )

    info('Detalles de los tableros obtenidos:', boardsWithPinDetails)

    return responseReturn(res, 200, boardsWithPinDetails)
  } catch (err) {
    error('Error al obtener los tableros del usuario:', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al obtener los tableros del usuario',
      error: err.message,
    })
  }
}
