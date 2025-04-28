import Comment from '../models/comment.model.js'
import { debug, error, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Recupera los comentarios asociados a un post específico.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el parámetro postId en req.params.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Devuelve una respuesta HTTP con el listado de comentarios o un mensaje de error.
 *
 * @throws {Error} Si ocurre un error al recuperar los comentarios de la base de datos.
 *
 * @description
 * Esta función busca todos los comentarios relacionados con un post (pin) identificado por postId,
 * los ordena por fecha de creación descendente y los retorna en la respuesta. Además, realiza un populate
 * del usuario asociado a cada comentario, incluyendo los campos username, img y displayName.
 */
export const getPostComments = async (req, res) => {
  debug('Iniciando recuperación de comentarios', { params: req.params })

  try {
    const { postId } = req.params

    const comments = await Comment.find({ pin: postId })
      .sort({ createdAt: -1 })
      .populate('user', 'username img displayName')

    info('Comentarios recuperados con éxito', {
      pinId: postId,
      commentCount: comments.length,
    })

    return responseReturn(res, 200, comments)
  } catch (err) {
    error('Error al recuperar comentarios', {
      error: err.message,
      stack: err.stack,
    })

    return responseReturn(res, 500, {
      message: 'Error al recuperar comentarios',
      error: err.message,
    })
  }
}

/**
 * Agrega un nuevo comentario a un pin.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el cuerpo con la descripción y el ID del pin, además del userId autenticado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Devuelve una respuesta HTTP con el comentario creado o un mensaje de error.
 *
 * @throws {Error} Si ocurre un error durante la creación del comentario, se devuelve un mensaje de error y el código de estado 500.
 */
export const addComment = async (req, res) => {
  debug('Iniciando creación de comentario', {
    body: req.body,
    userId: req.userId,
  })

  try {
    const { description, pin } = req.body

    const userId = req.userId

    const comment = await Comment.create({
      description,
      pin,
      user: userId,
    })

    info('Comentario creado con éxito', { userId, pinId: pin, comment })

    return responseReturn(res, 201, comment)
  } catch (err) {
    error('Error al crear comentario', {
      error: err.message,
      stack: err.stack,
    })

    return responseReturn(res, 500, {
      message: 'Error al crear comentario',
      error: err.message,
    })
  }
}
