import { Schema, model } from 'mongoose'

/**
 * Esquema para tableros que contienen pins.
 *
 * Define la estructura de los documentos de tablero, incluyendo los siguientes campos:
 * @typedef {Object} Board
 * @property {string} title - Título del tablero. Campo requerido.
 * @property {Schema.Types.ObjectId} user - Referencia al usuario propietario del tablero. Campo requerido.
 * @property {Date} createdAt - Fecha en que se creó el tablero (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización (generada automáticamente).
 */
const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

export default model('Board', boardSchema)
