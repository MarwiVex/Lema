<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Protocolo Automático de Creación y Subida de Apuntes en `Lema`

Cuando el usuario pida **hacer apuntes, formularios, hojas de referencia (cheatsheets), resúmenes o guías de estudio** de cualquier tema (pasando texto, temario, PDF, imágenes o solo el nombre de los temas), **NO le pidas instrucciones de formato ni de cómo subirlos**. Ejecuta directamente el flujo completo leyendo la skill `.agents/skills/lema-apuntes/SKILL.md` y el documento `CONTEXTO_APUNTES.md`.

## 1. Formato Estándar de Apuntes (Por Defecto: Proyecto LaTeX Compilado)
Salvo que el usuario pida explícitamente un apunte interactivo de bloques (`BlockNote` en la tabla `Document`), **todos los apuntes en `Lema` se crean como `LatexProject` + `LatexFile` (`main.tex`) con su PDF ya compilado (`pdfBase64`)**:
- **Clase y Geometría:** `\documentclass[10pt, landscape, twocolumn]{article}` con `\usepackage[margin=0.5in, columnsep=0.4in]{geometry}`.
- **Tipografía y Paquetes Base:** `\usepackage{mathpazo}` (Palatino), `amsmath, amssymb, amsthm`, `[table]{xcolor}`, `tabularx`, `tikz` (`arrows.meta, positioning, calc, shapes.geometric, fit, backgrounds`), `enumitem`, `booktabs`, y `\raggedbottom`.
- **Autor en Cabecera:** `Por Roberto León Landeros` (o `By Roberto León Landeros` si el apunte es en inglés).
- **Secciones:** Usar exclusivamente `\cheatsheetsection{N. Título}` y `\cheatsheetsubsection{N.M Subtítulo}` con colores `themeblue` (`RGB{0, 90, 160}`) y `themegray` (`RGB{80, 80, 80}`).
- **Rigor y Densidad:**
  - Alta densidad conceptual estilo *cheatsheet académica de ingeniería/matemáticas*: sin relleno verbal, priorizando definiciones formales, intuición geométrica/estructural, tablas comparativas (`tabularx{\linewidth}`), listas compactas (`\begin{itemize}[leftmargin=*, nosep]`) y diagramas vectoriales en `TikZ` cuando aporten claridad.
  - Rigor matemático estricto: cuantificadores ($\forall, \exists$), $:=$ para definiciones por primera vez, $\equiv$ para identidades/congruencias, $=$ para igualdades evaluadas.
  - **Prohibido usar entornos flotantes** (`\begin{table}`, `\begin{figure}`) dentro de `twocolumn`: usa `\begin{center} ... \end{center}` o `tabularx{\linewidth}` directo para evitar que LaTeX pierda o desplace bloques.

## 2. Flujo Directo de Compilación y Subida a Turso (`scripts/upload-apunte.mjs`)
1. **Consultar carpetas existentes en Turso:**
   ```powershell
   node scripts/upload-apunte.mjs --list-folders
   ```
   Si la materia o subcarpeta no existe, créala con:
   ```powershell
   node scripts/upload-apunte.mjs --create-folder "Nombre de Materia" --parent-id <idPadreOpcional>
   ```
2. **Escribir el archivo `.tex` temporal** (basado en `.agents/skills/lema-apuntes/templates/plantilla-cheatsheet.tex`) y **compilar + subir a Turso en un solo paso**:
   ```powershell
   node scripts/upload-apunte.mjs --tex <ruta-temporal.tex> --title "N. Título del Apunte" --description "Subtítulo descriptivo con los temas clave" --folder-id <folderId>
   ```
   - El script compila automáticamente el `.tex` con `./bin/tectonic.exe` (si hay error de sintaxis LaTeX, muestra las líneas del `.log` y aborta sin tocar la BD para que lo corrijas y reintentes).
   - Una vez compilado el PDF, inserta (o actualiza si ya existe ese título en la carpeta o si pasas `--project-id <id>`) el registro en `LatexProject` (con `pdfBase64` y `compiledAt`) y su `LatexFile` (`main.tex`, `isMain: true`) directamente en **Turso** (`.env`), y limpia el archivo temporal si se le pasa `--cleanup`.
