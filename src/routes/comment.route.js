import { Router } from 'express'
import {
  addComment,
  getPostComments,
} from '../controllers/comment.controller.js'
import { verifyToken } from '../middlewares/verifyToken.validator.js'

/**
 * Router para gestionar los comentarios de la aplicación.
 *
 * Este router define las rutas para las operaciones relacionadas con los comentarios,
 * como obtener los comentarios de un post y crear un nuevo comentario.
 *
 * @module commentRouter
 */
export const commentRouter = Router()

/**
 * Obtiene todos los comentarios de un post específico.
 *
 * @name GET /comments/:postId
 * @function
 * @memberof module:commentRouter
 */
commentRouter.get('/:postId', getPostComments)

/**
 * Crea un nuevo comentario en un post.
 * Requiere autenticación mediante token.
 *
 * @name POST /comments
 * @function
 * @memberof module:commentRouter
 */
commentRouter.post('/', verifyToken, addComment)
