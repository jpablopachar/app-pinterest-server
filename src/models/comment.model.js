import { Schema, model } from 'mongoose'

/**
 * Esquema para comentarios en pins.
 *
 * Define la estructura de los documentos de comentario, incluyendo los siguientes campos:
 * @typedef {Object} Comment
 * @property {string} description - Contenido del comentario. Campo requerido.
 * @property {Schema.Types.ObjectId} pin - Referencia al pin que se comenta. Campo requerido.
 * @property {Schema.Types.ObjectId} user - Referencia al usuario que escribe el comentario. Campo requerido.
 * @property {Date} createdAt - Fecha en que se creó el comentario (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización (generada automáticamente).
 */
const commentSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    pin: {
      type: Schema.Types.ObjectId,
      ref: "Pin",
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

export default model('Comment', commentSchema)
