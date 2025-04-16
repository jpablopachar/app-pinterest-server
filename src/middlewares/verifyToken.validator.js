import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../constants/config'
import { responseReturn } from '../utils/res.util'

/**
 * Middleware para verificar la validez del token JWT en las cookies de la solicitud.
 *
 * Este middleware busca el token en las cookies de la petición. Si no se encuentra,
 * responde con un error 401. Si el token es inválido, responde con un error 403.
 * Si el token es válido, agrega el userId decodificado al objeto de la solicitud y
 * llama a la siguiente función middleware.
 *
 * @function
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 * @returns {void}
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return responseReturn(res, 401, { message: 'Token no proporcionado' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return responseReturn(res, 403, { message: 'Token inválido' })
    }

    req.userId = decoded.userId

    next()
  })
}
