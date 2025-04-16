import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, NODE_ENV } from '../constants/config.js'
import User from '../models/user.model.js'
import { debug, error, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Registra un nuevo usuario en la base de datos.
 *
 * Este controlador recibe los datos del usuario desde el cuerpo de la solicitud,
 * crea un nuevo usuario con la contraseña hasheada, genera un token JWT y lo
 * almacena en una cookie HTTP-only. Devuelve los detalles del usuario registrado
 * (sin la contraseña) en la respuesta.
 *
 * @async
 * @function registerUser
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener username, displayName, email y password en el body.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const registerUser = async (req, res) => {
  debug('Iniciando registro de usuario', { body: req.body })

  try {
    const { username, displayName, email, password } = req.body

    const newHashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      displayName,
      email,
      hashedPassword: newHashedPassword,
    })

    const token = jwt.sign({ userId: user._id }, JWT_SECRET)

    res.cookie('token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'prod',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    const { hashedPassword, ...detailsWithoutPassword } = user.toObject()

    info('Usuario registrado con éxito', detailsWithoutPassword)

    responseReturn(res, 201, detailsWithoutPassword)
  } catch (err) {
    error('Error al registrar el usuario', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al registrar el usuario',
      error: err.message,
    })
  }
}
