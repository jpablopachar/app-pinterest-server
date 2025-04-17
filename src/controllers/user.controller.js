/* eslint-disable no-unused-vars */

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, NODE_ENV } from '../constants/config.js'
import Follow from '../models/follow.model.js'
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

/**
 * Autentica a un usuario existente.
 *
 * Este controlador recibe el email/nombre de usuario y la contraseña desde el cuerpo de la solicitud,
 * verifica que las credenciales sean correctas, genera un token JWT y lo almacena
 * en una cookie HTTP-only. Devuelve los detalles del usuario autenticado
 * (sin la contraseña) en la respuesta.
 *
 * @async
 * @function loginUser
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener login (email o username) y password en el body.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const loginUser = async (req, res) => {
  debug('Iniciando inicio de sesión de usuario', { body: req.body })

  try {
    const { email, password } = req.body

    // Buscar usuario por email o username
    const user = await User.findOne({ email })

    if (!user) {
      error(`Usuario no encontrado con email: ${email}`)

      return responseReturn(res, 401, {
        message: 'Credenciales incorrectas',
      })
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)

    if (!isPasswordValid) {
      error(
        `Las credenciales con el email: ${email} y la contraseña: ${password} son incorrectas`
      )

      return responseReturn(res, 401, {
        message: 'Credenciales incorrectas',
      })
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET)

    // Guardar token en cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'prod',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    })

    const { hashedPassword, ...detailsWithoutPassword } = user.toObject()

    info('Usuario autenticado con éxito', detailsWithoutPassword)

    responseReturn(res, 200, detailsWithoutPassword)
  } catch (err) {
    error('Error al iniciar sesión', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al iniciar sesión',
      error: err.message,
    })
  }
}

/**
 * Obtiene la información de un usuario por su nombre de usuario.
 *
 * Este controlador busca un usuario en la base de datos utilizando el nombre
 * de usuario proporcionado como parámetro en la URL. Devuelve los detalles
 * del usuario encontrado (sin la contraseña) o un error si el usuario no existe.
 *
 * @async
 * @function getUser
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el username como parámetro de ruta.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const getUser = async (req, res) => {
  debug('Iniciando búsqueda de usuario por nombre de usuario', {
    params: req.params,
  })

  try {
    const { username } = req.params

    const user = await User.findOne({ username })

    if (!user) {
      error(`Usuario no encontrado con el nombre de usuario: ${username}`)

      return responseReturn(res, 404, {
        message: `No se encontró un usuario con el nombre de usuario: ${username}`,
      })
    }

    const { hashedPassword, ...detailsWithoutPassword } = user.toObject()

    const followerCount = await Follow.countDocuments({ following: user._id })

    const followingCount = await Follow.countDocuments({ follower: user._id })

    const token = req.cookies.token

    if (!token) {
      const response = {
        ...detailsWithoutPassword,
        followerCount,
        followingCount,
        isFollowing: false,
      }

      info('Usuario encontrado sin token', detailsWithoutPassword)

      return responseReturn(res, 200, response)
    } else {
      jwt.verify(token, JWT_SECRET, async (errorJwt, payload) => {
        if (!errorJwt) {
          const isExists = await Follow.exists({
            follower: payload.userId,
            following: user._id,
          })

          const response = {
            ...detailsWithoutPassword,
            followerCount,
            followingCount,
            isFollowing: isExists ? true : false,
          }

          info('Usuario encontrado con token', response)

          responseReturn(res, 200, response)
        }
      })
    }
  } catch (err) {
    error('Error al buscar el usuario', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al buscar el usuario',
      error: err.message,
    })
  }
}

/**
 * Permite a un usuario seguir a otro usuario.
 *
 * Este controlador busca al usuario objetivo por su nombre de usuario,
 * verifica que el usuario que realiza la acción esté autenticado y
 * crea una nueva relación de seguimiento si no existe previamente.
 *
 * @async
 * @function followUser
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el username como parámetro de ruta y el token del usuario autenticado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP correspondiente.
 */
export const followUser = async (req, res) => {
  debug('Iniciando seguimiento de usuario', {
    params: req.params,
    userId: req.userId,
  })

  try {
    const { username } = req.params
    const followerUserId = req.userId

    // Buscar al usuario a seguir por su nombre de usuario
    const userToFollow = await User.findOne({ username })

    if (!userToFollow) {
      error(`Usuario a seguir no encontrado: ${username}`)

      return responseReturn(res, 404, {
        message: `No se encontró un usuario con el nombre de usuario: ${username}`,
      })
    }

    // Verificar si ya existe la relación de seguimiento
    const existingFollow = await Follow.exists({
      follower: followerUserId,
      following: userToFollow._id,
    })

    if (existingFollow) {
      await Follow.deleteOne({
        follower: followerUserId,
        following: userToFollow._id,
      })

      info(`El usuario ${followerUserId} dejó de seguir a ${username}`)
    } else {
      await Follow.create({
        follower: followerUserId,
        following: userToFollow._id,
      })

      info(`El usuario ${followerUserId} comenzó a seguir a ${username}`)
    }

    responseReturn(res, 200, { message: 'Satisfactorio' })
  } catch (err) {
    error('Error al seguir al usuario', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al seguir al usuario',
      error: err.message,
    })
  }
}

export const logoutUser = async (_, res) => {
  debug('Iniciando cierre de sesión de usuario')

  try {
    res.clearCookie('token')

    responseReturn(res, 200, { message: 'Sesión cerrada con éxito' })

    info('Sesión cerrada con éxito')
  } catch (err) {
    error('Error al cerrar sesión', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al cerrar sesión',
      error: err.message,
    })
  }
}
