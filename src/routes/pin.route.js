import { Router } from 'express'
import { createPin, getPin, getPins } from '../controllers/pin.controller.js'
import { validatePinIdParam, validatePinRequest } from '../middlewares/pin.validator.js'
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
