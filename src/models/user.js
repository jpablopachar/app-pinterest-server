import { Schema, model } from 'mongoose'

/**
 * Esquema de usuario para la base de datos.
 *
 * Define la estructura de los documentos de usuario, incluyendo los siguientes campos:
 * @typedef {Object} User
 * @property {string} displayName - Nombre visible del usuario. Campo requerido.
 * @property {string} username - Nombre de usuario único. Campo requerido.
 * @property {string} email - Correo electrónico del usuario. Campo requerido.
 * @property {string} [img] - URL de la imagen de perfil del usuario. Campo opcional.
 * @property {string} hashedPassword - Contraseña del usuario en formato hash. Campo requerido.
 * @property {Date} createdAt - Fecha de creación del usuario (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización del usuario (generada automáticamente).
 */
const userSchema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default model('User', userSchema)
