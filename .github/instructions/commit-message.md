# Commit Message Generation Instructions

## Format
- Use conventional format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Optional scope in parentheses (component, service, etc.)
- Concise description in imperative mood, no period at end
- You must keep the names if they are technical themes or programming code

## Content
- Describe WHAT changed and WHY, not HOW
- Use Spanish for the description
- Maintain consistency with previous commits
- Technical terms, class names, etc. remain in English

## Type Definitions
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

## Common Scopes
- `controller`: Changes to controller functions
- `model`: Changes to entity models
- `route`: Changes to routing
- `config`: Configuration changes
- `middleware`: Changes to middleware
- `exception`: Exception handling changes
- `util`: Utility functions
- `test`: Test-specific changes

## Examples
- `refactor(controller): extraer lógica de validación en ProductController`
- `test(controller): añadir tests para CartController`
- `fix(middleware): corregir error en autenticación de usuario`
- `feat(route): añadir nueva ruta para obtener productos por categoría`
- `docs(javadoc): actualizar documentación de funciones en CartController`
- `chore(deps): actualizar versiones de dependencias`
- `feat(model): añadir relación entre Order y Payment`
- `fix(controller): corregir error en manejo de excepciones en UserController`
- `feat(config): añadir soporte para múltiples entornos de configuración`
- `fix(exception): corregir error en manejo de excepciones en CartController`

## Special Considerations
- Always capitalize the first letter of the description
- Keep technical terms in English (class names, method names, etc.)
- Only translate the actual description text to Spanish
- Do not end the description with a period
- Use the complete scope name, not abbreviations