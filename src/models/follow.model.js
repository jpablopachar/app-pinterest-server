import { Schema, model } from 'mongoose'

/**
 * Esquema para relaciones de seguimiento entre usuarios.
 *
 * Define la estructura de los documentos de seguimiento, incluyendo los siguientes campos:
 * @typedef {Object} Follow
 * @property {Schema.Types.ObjectId} follower - Referencia al usuario que sigue. Campo requerido.
 * @property {Schema.Types.ObjectId} following - Referencia al usuario que es seguido. Campo requerido.
 * @property {Date} createdAt - Fecha en que se inició el seguimiento (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización (generada automáticamente).
 */
const followSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export default model('Follow', followSchema)
