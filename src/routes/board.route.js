import { Router } from 'express'
import { getUserBoards } from '../controllers/board.controller.js'

/**
 * Router para gestionar los tableros de la aplicación.
 *
 * Este router define las rutas para las operaciones relacionadas con los tableros,
 * incluyendo la obtención de tableros por usuario.
 *
 * @module boardRouter
 */
export const boardRouter = Router()

/**
 * Obtiene todos los tableros de un usuario específico.
 * Incluye detalles adicionales como la cantidad de pines y el primer pin de cada tablero.
 *
 * @name GET /boards/:userId
 * @function
 * @memberof module:boardRouter
 */
boardRouter.get('/:userId', getUserBoards)
