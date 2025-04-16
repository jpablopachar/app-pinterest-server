import { validationResult } from 'express-validator'
import { responseReturn } from '../utils/response'

/**
 * Middleware para manejar errores de validación en las solicitudes.
 * Utiliza el resultado de la validación para verificar si existen errores.
 * Si hay errores, responde con un estado 400 y un arreglo de errores.
 * Si no hay errores, continúa con el siguiente middleware.
 *
 * @async
 * @function handleValidationErrors
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
export const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return responseReturn(res, 400, { errors: errors.array() })
  }

  next()
}