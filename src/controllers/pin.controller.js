import ImageKit from 'imagekit'
import sharp from 'sharp'
import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from '../constants/config.js'
import Board from '../models/board.model.js'
import Pin from '../models/pin.model.js'
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

    responseReturn(res, 200, response)
  } catch (err) {
    error('Error al recuperar pines', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
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

    responseReturn(res, 200, pin)
  } catch (err) {
    error('Error al recuperar pin', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
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

        responseReturn(res, 201, newPin)
      }).catch((errorTemp) => {
        error('Error al subir la imagen a ImageKit', {
          error: errorTemp.message,
          stack: errorTemp.stack,
        })

        responseReturn(res, 500, {
          message: 'Error al subir la imagen a ImageKit',
          error: errorTemp.message,
        })
      })
  } catch (err) {
    error('Error al crear pin', {
      error: err.message,
      stack: err.stack,
    })

    responseReturn(res, 500, {
      message: 'Error al crear pin',
      error: err.message,
    })
  }
}
