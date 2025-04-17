import { Schema, model } from 'mongoose'

/**
 * Esquema de pin para la base de datos.
 *
 * Define la estructura de los documentos de pin, incluyendo los siguientes campos:
 * @typedef {Object} Pin
 * @property {string} media - URL de la imagen o media del pin. Campo requerido.
 * @property {number} width - Ancho de la imagen en píxeles. Campo requerido.
 * @property {number} height - Altura de la imagen en píxeles. Campo requerido.
 * @property {string} title - Título del pin. Campo requerido.
 * @property {string} description - Descripción del pin. Campo requerido.
 * @property {string} [link] - Enlace externo asociado al pin. Campo opcional.
 * @property {Schema.Types.ObjectId} [board] - Tablero al que pertenece el pin. Campo opcional.
 * @property {string[]} [tags] - Etiquetas asociadas al pin. Campo opcional.
 * @property {Schema.Types.ObjectId} user - Usuario que creó el pin. Campo requerido.
 * @property {Date} createdAt - Fecha de creación del pin (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización del pin (generada automáticamente).
 */
const pinSchema = new Schema(
  {
    media: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    tags: {
      type: [String],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

export default model('Pin', pinSchema)
