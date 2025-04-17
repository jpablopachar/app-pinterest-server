import { Schema, model } from 'mongoose'

/**
 * Esquema para los "me gusta" de los pins.
 *
 * Define la estructura de los documentos de like, incluyendo los siguientes campos:
 * @typedef {Object} Like
 * @property {Schema.Types.ObjectId} pin - Referencia al pin que recibe el like. Campo requerido.
 * @property {Schema.Types.ObjectId} user - Referencia al usuario que da el like. Campo requerido.
 * @property {Date} createdAt - Fecha en que se dio el like (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización (generada automáticamente).
 */
const likeSchema = new Schema(
  {
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

export default model('Like', likeSchema)
