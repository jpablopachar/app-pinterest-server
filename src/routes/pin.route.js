import { Router } from 'express'
import { getPins } from '../controllers/pin.controller.js'

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
