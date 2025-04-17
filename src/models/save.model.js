import { Schema, model } from 'mongoose'

/**
 * Esquema para guardar pins por los usuarios.
 *
 * Define la estructura de los documentos de guardado, incluyendo los siguientes campos:
 * @typedef {Object} Save
 * @property {Schema.Types.ObjectId} pin - Referencia al pin que se guarda. Campo requerido.
 * @property {Schema.Types.ObjectId} user - Referencia al usuario que guarda el pin. Campo requerido.
 * @property {Date} createdAt - Fecha en que se guardó el pin (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización (generada automáticamente).
 */
const saveSchema = new Schema(
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

export default model('Save', saveSchema)
