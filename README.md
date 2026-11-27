# Lema

Workspace personal para tomar apuntes académicos, dibujar en pizarra infinita, editar proyectos LaTeX y organizar conocimiento conectado con asistencia de IA.

## Funcionalidades principales

- **Editor de documentos por bloques** (`BlockNote`) con soporte de matemáticas en KaTeX y autocompletado rápido.
- **Pizarra infinita** (`tldraw`) con importación de PDF multipágina, imágenes y conversión de bocetos a código TikZ/LaTeX.
- **Visor y editor de proyectos LaTeX** con compilación en el navegador vía WebAssembly (`texlyre-busytex`) o en servidor (`tectonic`), y visor PDF integrado.
- **Grafo de conocimiento** interactivo para visualizar y analizar relaciones entre notas y proyectos.
- **Carpetas jerárquicas**, búsqueda rápida (`CommandPalette`) y exportación a LaTeX.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Estado:** Zustand + SWR
- **Base de datos:** Prisma + SQLite / Turso (`@libsql/client`)
- **IA:** Google Gemini (`@google/genai`) y Groq (fallback)

## Configuración local

1. Instala las dependencias:

```bash
npm install
```

2. Crea tu archivo `.env` a partir de `.env.example` y configura tus credenciales:

```bash
cp .env.example .env
```

3. Sincroniza el esquema en la base de datos local (`dev.db`) o remota (Turso):

```bash
node sync-turso-schema.js --local
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre `http://localhost:3000` en tu navegador.
