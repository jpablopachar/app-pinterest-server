import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, NODE_ENV } from '../constants/config.js'
import User from '../models/user.model.js'
import { debug, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Registra un nuevo usuario en la base de datos.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene los datos del usuario en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta HTTP utilizado para enviar la respuesta al cliente.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía una respuesta HTTP al cliente.
 *
 * @description
 * Esta función crea un nuevo usuario en la base de datos y genera un token JWT.
 * El token se almacena en una cookie httpOnly.
 * Finalmente, responde con los detalles del usuario (sin la contraseña).
 */
export const registerUser = async (req, res) => {
  debug('Iniciando registro de usuario', { body: req.body });

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
    secure: NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject()

  info('Usuario registrado con éxito', detailsWithoutPassword)

  responseReturn(res, 201, detailsWithoutPassword)
}
