import { body, param } from 'express-validator'
import { handleValidationErrors } from './validation.js'

/**
 * Middleware de validación para solicitudes de usuario.
 *
 * Este array contiene una serie de middlewares que validan los campos requeridos
 * en una solicitud relacionada con usuarios. Verifica que el nombre de usuario sea
 * una cadena no vacía, que el correo electrónico tenga un formato válido y no esté vacío,
 * y que la contraseña sea una cadena de al menos 6 caracteres.
 * Si alguna validación falla, se manejan los errores de validación correspondientes.
 *
 * @constant
 * @type {Array<import('express').RequestHandler>}
 */
export const validateUserRequest = [
  body('username')
    .isString()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),
  body('email')
    .isEmail()
    .notEmpty()
    .withMessage('El correo electrónico es requerido'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors,
]

export const validateLoginRequest = [
  body('email')
    .isEmail()
    .notEmpty()
    .withMessage('El correo electrónico es requerido'),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors,
]

export const validateGetUserParams = [
  param('username')
    .isString()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),
]
