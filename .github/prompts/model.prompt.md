# MongoDB Model Generator

## Meta
This prompt generates MongoDB models using Mongoose following best practices and the project's code style.

## Response Format
- The generated code will use ES Modules
- Will include complete documentation in Spanish with JSDoc
- Will follow the pattern of existing models
- Will use camelCase for variable names

## Warnings
- Do not include controller logic in the models
- Ensure all fields have appropriate validations
- Always add the timestamps option

## Additional Context
To generate a specific model, provide:
1. Model name (singular, first letter uppercase)
2. Required fields with their types
3. Optional fields with their types
4. Relations with other models
5. Necessary indexes
6. Custom methods if needed

### Model Example

```javascript
import { Schema, model } from 'mongoose'

/**
 * Esquema para [nombre del modelo].
 * 
 * Define la estructura de los documentos de [nombre del modelo], incluyendo los siguientes campos:
 * @typedef {Object} [Nombre]
 * @property {string} name - Nombre del [concepto]. Campo requerido.
 * @property {string} [description] - Descripción del [concepto]. Campo opcional.
 * @property {Schema.Types.ObjectId} owner - Referencia al usuario propietario. Campo requerido.
 * @property {Date} createdAt - Fecha de creación (generada automáticamente).
 * @property {Date} updatedAt - Fecha de última actualización (generada automáticamente).
 */
const nombreSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Otros campos según necesidades
  },
  { timestamps: true }
)

export default model('Nombre', nombreSchema)