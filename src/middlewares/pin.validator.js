import { body, param } from 'express-validator'
import { handleValidationErrors } from './validation.js'

/**
 * Middleware de validación para solicitudes de creación de pines.
 *
 * Este array contiene una serie de middlewares que validan los campos requeridos
 * en una solicitud de creación de pin. Verifica que el título y la descripción sean
 * cadenas no vacías, y que la URL del media sea una cadena válida y no esté vacía.
 * Si alguna validación falla, se manejan los errores de validación correspondientes.
 *
 * @constant
 * @type {Array<import('express').RequestHandler>}
 */
export const validatePinRequest = [
  body('title')
    .isString()
    .notEmpty()
    .withMessage('El título es requerido'),
  body('description')
    .isString()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('media')
    .isString()
    .notEmpty()
    .withMessage('La URL del media es requerida'),
  handleValidationErrors,
]

/**
 * Middleware de validación para parámetros de ID de pin.
 *
 * Este array contiene un middleware que valida que el parámetro ID sea una cadena no vacía.
 * Si la validación falla, se manejan los errores de validación correspondientes.
 *
 * @constant
 * @type {Array<import('express').RequestHandler>}
 */
export const validatePinIdParam = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('El ID del pin es requerido'),
  handleValidationErrors,
]
