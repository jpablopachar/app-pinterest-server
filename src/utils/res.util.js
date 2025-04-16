/**
 * Envía una respuesta HTTP con el código de estado y los datos proporcionados.
 *
 * @function
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {number} code - Código de estado HTTP a enviar.
 * @param {Object} data - Datos que se enviarán en formato JSON en la respuesta.
 */
export const responseReturn = (res, code, data) => {
  res.status(code).json(data)
}