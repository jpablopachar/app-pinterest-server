import { Router } from 'express'
import {
  createPin,
  getPin,
  getPins,
  interact,
  interactionCheck,
} from '../controllers/pin.controller.js'
import {
  validatePinIdParam,
  validatePinRequest,
} from '../middlewares/pin.validator.js'
import { verifyToken } from '../middlewares/verifyToken.validator.js'

/**
 * Router para gestionar los pines de la aplicación.
 *
 * Este router define las rutas para las operaciones relacionadas con los pines,
 * comenzando con la ruta básica para obtener todos los pines.
 *
 * @module pinRouter
 */
export const pinRouter = Router()

/**
 * Obtiene todos los pines con soporte para paginación.
 *
 * @name GET /pins
 * @function
 * @memberof module:pinRouter
 */
pinRouter.get('/', getPins)

/**
 * Obtiene un pin específico por su ID.
 *
 * @name GET /pins/:id
 * @function
 * @memberof module:pinRouter
 */
pinRouter.get('/:id', validatePinIdParam, getPin)

/**
 * Crea un nuevo pin.
 *
 * @name POST /pins
 * @function
 * @memberof module:pinRouter
 */
pinRouter.post('/', verifyToken, validatePinRequest, createPin)

/**
 * Verifica la interacción de un usuario con un pin específico.
 * Obtiene el contador de likes y si el usuario autenticado ha dado like o guardado el pin.
 *
 * @name GET /pins/interaction-check/:id
 * @function
 * @memberof module:pinRouter
 */
pinRouter.get('/interaction-check/:id', interactionCheck)

/**
 * Permite al usuario interactuar con un pin (dar like o guardar).
 * Requiere autenticación mediante token.
 *
 * @name POST /pins/interact/:id
 * @function
 * @memberof module:pinRouter
 */
pinRouter.post('/interact/:id', verifyToken, interact)
