import chalk from 'chalk'
import { NODE_ENV } from '../constants/config.js'

/**
 * Utilidad para registrar mensajes de depuración con colores e información adicional sobre el origen del mensaje.
 *
 * @module logger
 */

/**
 * Niveles de registro disponibles, cada uno con un estilo específico.
 * @type {Object}
 */
const LOG_LEVELS = {
  debug: { color: chalk.cyan, enabled: true },
  info: { color: chalk.green, enabled: true },
  warn: { color: chalk.yellow, enabled: true },
  error: { color: chalk.red, enabled: true },
}

/**
 * Obtiene información sobre la ubicación de la llamada en el código.
 *
 * @private
 * @returns {Object} Objeto con información sobre la ubicación del llamado (archivo, línea, columna, función).
 */
const getCallerInfo = () => {
  // Capturar el stack trace actual
  const err = new Error()
  const stackLines = err.stack.split('\n')

  // La línea que contiene la información del llamador está en index 3 (0: Error, 1: getCallerInfo, 2: logger.*, 3: caller)
  const callerLine = stackLines[3] || ''

  // Extraer información usando expresiones regulares
  const fileMatch = callerLine.match(
    /at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?)\)?/
  )

  if (!fileMatch)
    return { file: 'unknown', line: 0, column: 0, function: 'unknown' }

  const functionName = fileMatch[1] || 'anonymous'
  const fileName = fileMatch[2] ? fileMatch[2].split('/').pop() : 'unknown'
  const lineNumber = fileMatch[3] ? parseInt(fileMatch[3], 10) : 0
  const columnNumber = fileMatch[4] ? parseInt(fileMatch[4], 10) : 0

  return {
    file: fileName,
    line: lineNumber,
    column: columnNumber,
    function: functionName,
  }
}

/**
 * Registra un mensaje de depuración en la consola con información sobre la ubicación de la llamada.
 *
 * @param {string} message - Mensaje a registrar
 * @param {Object} [data] - Datos adicionales para registrar (opcional)
 * @param {string} [level='debug'] - Nivel de registro ('debug', 'info', 'warn', 'error')
 */
export const debug = (message, data = null, level = 'debug') => {
  // Solo registrar en entornos de desarrollo o si se ha configurado explícitamente
  if (
    NODE_ENV !== 'prod' || LOG_LEVELS[level]?.enabled
  ) {
    const { file, line, function: funcName } = getCallerInfo()
    const logLevel = LOG_LEVELS[level] || LOG_LEVELS.debug

    // Formatear el mensaje con información de ubicación y color
    const prefix = logLevel.color(`[${level.toUpperCase()}]`)
    const location = chalk.dim(`${file}:${line}`)
    const functionInfo = funcName ? chalk.blue(`[${funcName}]`) : ''
    const formattedMessage = `${prefix} ${location} ${functionInfo} - ${message}`

    // Registrar el mensaje
    if (data) {
      console.log(formattedMessage)
      console.dir(data, { depth: null, colors: true })
    } else {
      console.log(formattedMessage)
    }
  }
}

/**
 * Registra un mensaje informativo en la consola.
 *
 * @param {string} message - Mensaje a registrar
 * @param {Object} [data] - Datos adicionales para registrar (opcional)
 */
export const info = (message, data = null) => {
  debug(message, data, 'info')
}

/**
 * Registra un mensaje de advertencia en la consola.
 *
 * @param {string} message - Mensaje a registrar
 * @param {Object} [data] - Datos adicionales para registrar (opcional)
 */
export const warn = (message, data = null) => {
  debug(message, data, 'warn')
}

/**
 * Registra un mensaje de error en la consola.
 *
 * @param {string} message - Mensaje a registrar
 * @param {Object} [data] - Datos adicionales para registrar (opcional)
 */
export const error = (message, data = null) => {
  debug(message, data, 'error')
}

/**
 * Exportación por defecto con todos los métodos de registro.
 */
export default { debug, info, warn, error }
