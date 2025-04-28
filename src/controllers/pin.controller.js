import ImageKit from 'imagekit'
import jwt from 'jsonwebtoken'
import sharp from 'sharp'
import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
  JWT_SECRET,
} from '../constants/config.js'
import Board from '../models/board.model.js'
import Like from '../models/like.model.js'
import Pin from '../models/pin.model.js'
import Save from '../models/save.model.js'
import { debug, error, info } from '../utils/logger.js'
import { responseReturn } from '../utils/res.util.js'

/**
 * Recupera una lista paginada de pines según los parámetros de consulta proporcionados.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express, que puede contener los siguientes parámetros de consulta:
 *   @param {string} [req.query.cursor] - Cursor de paginación (número de página).
 *   @param {string} [req.query.search] - Término de búsqueda para filtrar pines por título o etiquetas.
 *   @param {string} [req.query.userId] - ID del usuario para filtrar pines creados por ese usuario.
 *   @param {string} [req.query.boardId] - ID del tablero para filtrar pines asociados a ese tablero.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP con los pines recuperados o un mensaje de error.
 *
 * @description
 * Esta función permite recuperar pines de la base de datos aplicando filtros opcionales por búsqueda, usuario o tablero.
 * Implementa paginación utilizando un cursor y un límite fijo de resultados por página.
 * En caso de éxito, retorna un objeto con los pines y el cursor para la siguiente página (si existe).
 * En caso de error, retorna un mensaje descriptivo del problema encontrado.
 */
export const getPins = async (req, res) => {
  debug('Iniciando recuperación de pines', { query: req.query })

  const { cursor, search, userId, boardId } = req.query

  const pageNumber = Number(cursor) || 0
  const limit = 21

  try {
    const pins = await Pin.find(
      search
        ? {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { tags: { $in: [search] } },
            ],
          }
        : userId
        ? { user: userId }
        : boardId
        ? { board: boardId }
        : {}
    )
      .limit(limit)
      .skip(pageNumber * limit)

    const hasNextPage = pins.length === limit

    const response = { pins, nextCursor: hasNextPage ? pageNumber + 1 : null }

    info('Pines recuperados con éxito', response)

    return responseReturn(res, 200, response)
  } catch (err) {
    error('Error al recuperar pines', {
      error: err.message,
      stack: err.stack,
    })

    return responseReturn(res, 500, {
      message: 'Error al recuperar pines',
      error: err.message,
    })
  }
}

/**
 * Recupera un pin específico por su ID.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express que contiene el ID del pin en los parámetros.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP con el pin recuperado o un mensaje de error.
 *
 * @description
 * Esta función busca y recupera un pin específico de la base de datos utilizando su ID.
 * En caso de éxito, retorna el objeto del pin completo.
 * Si el pin no existe, retorna un mensaje de error 404.
 * En caso de otros errores, retorna un mensaje descriptivo del problema encontrado.
 */
export const getPin = async (req, res) => {
  debug('Iniciando recuperación de pin por ID', { params: req.params })

  try {
    const { id } = req.params

    const pin = await Pin.findById(id).populate(
      'user',
      'username img displayName'
    )

    if (!pin) {
      return responseReturn(res, 404, {
        message: 'Pin no encontrado',
      })
    }

    info('Pin recuperado con éxito', pin)

    return responseReturn(res, 200, pin)
  } catch (err) {
    error('Error al recuperar pin', {
      error: err.message,
      stack: err.stack,
    })

    return responseReturn(res, 500, {
      message: 'Error al recuperar pin',
      error: err.message,
    })
  }
}

/**
 * Crea un nuevo pin en la base de datos.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express que contiene los datos del pin en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, pero envía la respuesta HTTP con el pin creado o un mensaje de error.
 *
 * @description
 * Esta función crea un nuevo pin utilizando los datos proporcionados en el cuerpo de la solicitud.
 * Asocia automáticamente el pin al usuario autenticado que realiza la solicitud.
 * En caso de éxito, retorna el objeto del pin recién creado con un estado 201.
 * En caso de error, retorna un mensaje descriptivo del problema encontrado con un estado 500.
 */
export const createPin = async (req, res) => {
  debug('Iniciando creación de pin', { body: req.body })

  try {
    const {
      title,
      description,
      link,
      board,
      tags,
      textOptions,
      canvasOptions,
      newBoard,
    } = req.body

    const media = req.files.media

    const parsedTextOptions = JSON.parse(textOptions || '{}')
    const parsedCanvasOptions = JSON.parse(canvasOptions || '{}')

    const metadata = await sharp(media.data).metadata()

    const originalOrientation =
      metadata.width < metadata.height ? 'portrait' : 'landscape'
    const originalAspectRatio = metadata.width / metadata.height

    let clientAspectRatio
    let width
    let height

    if (parsedCanvasOptions.size !== 'original') {
      clientAspectRatio =
        parsedCanvasOptions.size.split(':')[0] /
        parsedCanvasOptions.size.split(':')[1]
    } else {
      if (parsedCanvasOptions.orientation === originalOrientation) {
        clientAspectRatio = originalOrientation
      } else {
        clientAspectRatio = 1 / originalAspectRatio
      }
    }

    width = metadata.width
    height = metadata.width / clientAspectRatio

    const imageKit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    })

    const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375)

    const textTopPosition = Math.round(
      (parsedTextOptions.top * height) / parsedCanvasOptions.height
    )

    let croppingStrategy = ''

    if (parsedCanvasOptions.size !== 'original') {
      if (originalAspectRatio > clientAspectRatio) {
        croppingStrategy = ',cm-pad_resize'
      }
    } else {
      if (
        originalOrientation === 'landscape' &&
        parsedCanvasOptions.orientation === 'portrait'
      ) {
        croppingStrategy = ',cm-pad_resize'
      }
    }

    const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(
      1
    )}${
      parsedTextOptions.text
        ? `,l-text,i-${parsedTextOptions.text},fs-${
            parsedTextOptions.fontSize * 2.1
          },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
            1
          )},l-end`
        : ''
    }`

    imageKit
      .upload({
        file: media.data,
        fileName: media.name,
        folder: 'app-pinterest',
        transformation: { pre: transformationString },
      })
      .then(async (result) => {
        let newBoardId

        if (newBoard) {
          const res = await Board.create({
            title: newBoard,
            user: req.userId,
          })

          newBoardId = res._id
        }

        const newPin = await Pin.create({
          user: req.userId,
          title,
          description,
          link: link || null,
          board: newBoardId || board || null,
          tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
          media: result.filePath,
          width: result.width,
          height: result.height,
        })

        info('Pin creado con éxito', newPin)

        return responseReturn(res, 201, newPin)
      })
      .catch((errorTemp) => {
        error('Error al subir la imagen a ImageKit', {
          error: errorTemp.message,
          stack: errorTemp.stack,
        })

        return responseReturn(res, 500, {
          message: 'Error al subir la imagen a ImageKit',
          error: errorTemp.message,
        })
      })
  } catch (err) {
    error('Error al crear pin', {
      error: err.message,
      stack: err.stack,
    })

    return responseReturn(res, 500, {
      message: 'Error al crear pin',
      error: err.message,
    })
  }
}

/**
 * Verifica la interacción de un usuario con un pin específico.
 *
 * Este controlador obtiene el número de "likes" de un pin y determina si el usuario autenticado
 * ha dado "like" o ha guardado el pin. Si el usuario no está autenticado, solo retorna el contador de "likes".
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP de Express.
 * @param {import('express').Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna ningún valor directamente, responde al cliente con los datos de interacción.
 *
 * @throws Retorna un error 500 si ocurre algún problema al recuperar la información del pin.
 */
export const interactionCheck = async (req, res) => {
  debug('Iniciando verificación de interacción', { params: req.params })

  try {
    const { id } = req.params

    const token = req.cookies.token
    const likeCount = await Like.countDocuments({ pin: id })

    info('Contador de likes recuperado con éxito', {
      likeCount,
      isLiked: false,
      isSaved: false,
    })

    if (!token)
      return responseReturn(res, 200, {
        likeCount,
        isLiked: false,
        isSaved: false,
      })

    jwt.verify(token, JWT_SECRET, async (errorJwt, payload) => {
      if (errorJwt) {
        info('Token inválido', errorJwt)

        return responseReturn(res, 200, {
          likeCount,
          isLiked: false,
          isSaved: false,
        })
      }

      const userId = payload.userId

      const isLiked = await Like.findOne({ user: userId, pin: id })
      const isSaved = await Save.findOne({ user: userId, pin: id })

      info('Contador de likes recuperado con éxito', {
        likeCount,
        isLiked: isLiked ? true : false,
        isSaved: isSaved ? true : false,
      })

      return responseReturn(res, 200, {
        likeCount,
        isLiked: isLiked ? true : false,
        isSaved: isSaved ? true : false,
      })
    })
  } catch (err) {
    error('Error al recuperar pin', {
      error: err.message,
      stack: err.stack,
    })

    return responseReturn(res, 500, {
      message: 'Error al recuperar pin',
      error: err.message,
    })
  }
}

/**
 * Controlador para interactuar con un pin (dar like o guardar).
 * Permite al usuario alternar entre dar/quitar like o guardar/quitar guardado en un pin específico.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el ID del pin en los parámetros y el tipo de interacción ('like' o 'save') en el cuerpo.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Devuelve una respuesta HTTP con el resultado de la interacción.
 *
 * @throws {Error} Retorna un error 500 si ocurre algún problema durante la interacción.
 */
export const interact = async (req, res) => {
  debug('Iniciando interacción con el pin', {
    params: req.params,
    body: req.body,
  })

  try {
    const { id } = req.params

    const { type } = req.body

    const userId = req.userId

    if (type === 'like') {
      const isLiked = await Like.findOne({ pin: id, user: userId })

      info('Verificando like', { isLiked })

      if (isLiked) {
        await Like.deleteOne({ pin: id, user: userId })

        info('Like eliminado con éxito', { pinId: id, userId: userId })
      } else {
        await Like.create({ pin: id, user: userId })

        info('Like agregado con éxito', { pinId: id, userId: userId })
      }
    } else {
      const isSaved = await Save.findOne({ pin: id, user: userId })

      info('Verificando guardado', { isSaved })

      if (isSaved) {
        await Save.deleteOne({ pin: id, user: userId })

        info('Guardado eliminado con éxito', { pinId: id, userId: userId })
      } else {
        await Save.create({ pin: id, user: userId })

        info('Guardado agregado con éxito', { pinId: id, userId: userId })
      }
    }

    return responseReturn(res, 200, { message: 'Interacción exitosa' })
  } catch (err) {
    error('Error al interactuar con el pin', {
      error: err.message,
      stack: err.stack,
    })

    return responseReturn(res, 500, {
      message: 'Error al interactuar con el pin',
      error: err.message,
    })
  }
}
