---
name: lema-apuntes
description: Genera, compila con Tectonic y sube directamente a la base de datos Turso de Lema apuntes académicos, hojas de fórmulas (cheatsheets) y guías de estudio en LaTeX (Palatino, landscape, 2 columnas) para Roberto León Landeros. Úsala siempre que el usuario pida crear, redactar, resumir, actualizar o subir apuntes de cualquier materia en Lema.
---

# Skill: Generación y Subida Directa de Apuntes en `Lema`

Esta skill define el estándar exacto de formato, rigor académico y flujo de base de datos (Turso) para crear apuntes dentro de `Lema`. Cuando el usuario pida *"hazme apuntes de X"* o entregue material (texto, PDF, diapositivas, notas sueltas, código o temario), ejecuta este flujo de principio a fin sin pedirle detalles de infraestructura.

---

## 1. Estándar Visual y Tipográfico (Plantilla Basal LaTeX)

La plantilla base se encuentra en `.agents/skills/lema-apuntes/templates/plantilla-cheatsheet.tex`:

```latex
\documentclass[10pt, landscape, twocolumn]{article}

% --- Librerías Requeridas ---
\usepackage[margin=0.5in, columnsep=0.4in]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage[table]{xcolor}
\usepackage{tabularx}
\usepackage{tikz}
\usetikzlibrary{arrows.meta, positioning, calc, shapes.geometric, fit, backgrounds}
\usepackage{enumitem}
\usepackage{mathpazo} % Tipografía Palatino
\usepackage{booktabs}

% --- Configuración de Formato ---
\pagestyle{empty} % Sin números de página
\setlength{\parindent}{0pt}
\setlength{\parskip}{2pt}
\raggedbottom

% Ajuste de espacios en ecuaciones
\AtBeginDocument{
  \setlength{\abovedisplayskip}{3pt}
  \setlength{\belowdisplayskip}{3pt}
  \setlength{\abovedisplayshortskip}{1pt}
  \setlength{\belowdisplayshortskip}{1pt}
}

% --- Definición de Colores ---
\definecolor{themeblue}{RGB}{0, 90, 160}
\definecolor{themegray}{RGB}{80, 80, 80}
\definecolor{setblue}{RGB}{240, 244, 255}
\definecolor{setred}{RGB}{255, 240, 240}
\definecolor{setborderblue}{RGB}{0, 60, 140}
\definecolor{setborderred}{RGB}{150, 0, 0}

% --- Comandos Personalizados para Títulos ---
\newcommand{\cheatsheetsection}[1]{
    \vspace{0.6em}
    {\color{themeblue}\large\bfseries #1} \par
    \vspace{-0.5em}
    {\color{themeblue}\rule{\linewidth}{1pt}} \par
    \vspace{0.2em}
}

\newcommand{\cheatsheetsubsection}[1]{
    \vspace{0.4em}
    {\color{themeblue}\normalsize\bfseries #1} \par
    \vspace{0.1em}
}
```

### Reglas de Maquetación en Dos Columnas (`twocolumn`, `landscape`)
1. **Cabecera estándar:**
   ```latex
   \begin{center}
       \vspace{-1em}
       {\color{themeblue}\huge\bfseries Título del Tema}\\[0.1em]
       {\color{themegray}\small Subtítulo descriptivo con los subtemas cubiertos}\\[0.4em]
       {\color{themegray}\footnotesize \textbf{Por Roberto León Landeros}}
   \end{center}
   \vspace{-0.8em}
   ```
2. **Cero entornos flotantes (`table` / `figure`):** En modo `twocolumn` de densidad alta, no uses `\begin{table}` ni `\begin{figure}`. Inserta las tablas directamente con `\begin{tabularx}{\linewidth}{...}` y los diagramas TikZ dentro de `\begin{center} \begin{tikzpicture} ... \end{tikzpicture} \end{center}`.
3. **Control de ancho de columna (~4.8 pulgadas):**
   - En tablas usa siempre `tabularx{\linewidth}` con al menos una columna `X` (ej. `{|p{0.28\linewidth}|X|}` o `{|l|p{0.25\linewidth}|X|}`).
   - En ecuaciones largas usa `aligned` o `multline*` para evitar `Overfull \hbox` que invadan la columna vecina.
   - Si el tema incluye bloques de código (SQL, C/C++, Java, Python), usa `\usepackage{listings}` con `basicstyle=\ttfamily\footnotesize`, `breaklines=true`, `frame=single`, `backgroundcolor=\color{setblue}`.
4. **Rigor académico y matemático:**
   - Usa cuantificadores ($\forall, \exists$) y notación simbólica precisa en lugar de prosa redundante.
   - Usa $:=$ estrictamente al definir un objeto, conjunto o función por primera vez.
   - Reserva $\equiv$ únicamente para identidades algebraicas o relaciones de congruencia.
   - Usa $=$ para igualdades entre expresiones ya definidas, predicados lógicos y valores de verdad.
   - Prioriza deducción desde primeros principios, intuición geométrica, casos límite y tablas comparativas densas.

---

## 2. Organización de Carpetas y Numeración en `Lema`

Las materias en `Lema` están organizadas jerárquicamente en la tabla `Folder` (`id`, `name`, `parentId`).
- Cuando una materia tiene varios apuntes secuenciales (por ejemplo, en `Bases de Datos`: `1. Modelo E-R y Relacional`, `2. Álgebra Relacional, Integridad y Normalización`, `3. Sistemas de Gestión de Bases de Datos (SGBD) y Conectividad`, `4. Fundamentos de MySQL: DDL y Workbench`), **consulta primero los títulos existentes en esa carpeta** para continuar la numeración (`5. ...`) y mantener coherencia en el subtítulo (`description`).
- Si el material que pasa el usuario es muy extenso (por ejemplo, toda una unidad o curso con varios módulos distintos), divídelo en apuntes modulares bien estructurados (de 2 a 4 páginas densas cada uno) o pregúntale si prefiere un solo documento o varios módulos numerados.

---

## 3. Cómo Compilar y Subir a la Base de Datos (Turso)

Usa el script `scripts/upload-apunte.mjs`, que se conecta automáticamente a `TURSO_DATABASE_URL` usando `.env`, compila con `./bin/tectonic.exe` y guarda tanto en `LatexProject` (con `pdfBase64` y `compiledAt`) como en `LatexFile` (`filename: "main.tex"`, `isMain: true`).

### Paso 1: Inspeccionar carpetas y apuntes existentes
```powershell
node scripts/upload-apunte.mjs --list-folders
```
Para ver los apuntes actuales dentro de una carpeta específica:
```powershell
node scripts/upload-apunte.mjs --list-projects --folder-id <folderId>
```

### Paso 2: Crear carpeta o subcarpeta (solo si no existe)
```powershell
node scripts/upload-apunte.mjs --create-folder "Nombre de Subcarpeta" --parent-id <idCarpetaPadre>
```

### Paso 3: Compilar el `.tex` con Tectonic y subirlo a Turso
Guarda el código LaTeX en un archivo temporal (por ejemplo en la carpeta `scratch` de la conversación o `.tmp-apunte.tex`) y ejecuta:
```powershell
node scripts/upload-apunte.mjs --tex .tmp-apunte.tex --title "Título del Apunte" --description "Subtítulo descriptivo de los temas" --folder-id <folderId> --cleanup
```

- **Qué hace internamente el comando:**
  1. Verifica que el archivo `.tex` exista y no tenga BOM inválido.
  2. Lo compila con `./bin/tectonic.exe --keep-logs`.
  3. **Si falla la compilación LaTeX:** imprime el extracto de errores del `.log` y devuelve código de salida `1` **sin subir nada a Turso**. Corrige el `.tex` y vuelve a ejecutar hasta que compile limpio (`0` errores).
  4. **Si compila con éxito:** convierte el PDF generado a Base64 (`pdfBase64`), crea (o actualiza si coincide `title` + `folderId` o si pasas `--project-id <id>`) el `LatexProject` y su `LatexFile` (`main.tex`), sincroniza también `dev.db` local si existe, y borra `.tmp-apunte.tex` cuando pasas `--cleanup`.

---

## 4. Alternativa: Apuntes de Bloques (`BlockNote` / Tabla `Document`)

Solo si el usuario pide explícitamente un **apunte editable por bloques (BlockNote)** en lugar de un proyecto LaTeX/PDF:
- Usa `--doc-json <ruta.json>` con `scripts/upload-apunte.mjs`:
  ```powershell
  node scripts/upload-apunte.mjs --doc-json .tmp-blocks.json --title "Título del Apunte" --folder-id <folderId> --cleanup
  ```
- Formato del JSON (`BlockNote` AST array):
  - Bloques estándar: `heading` (`props: { level: 1 | 2 | 3 }`), `paragraph`, `bulletListItem`, `numberedListItem`.
  - Bloques matemáticos formales (`math_box`):
    ```json
    {
      "id": "uuid-v4",
      "type": "math_box",
      "props": {
        "boxType": "theorem",
        "title": "Teorema Fundamental del Cálculo",
        "latexContent": "Sea $f : [a,b] \\to \\mathbb{R}$ continua. Si $F(x) := \\int_a^x f(t)\\,dt$, entonces $\\forall x \\in (a,b)$, $F'(x) = f(x)$."
      },
      "content": [],
      "children": []
    }
    ```
    (`boxType` soporta: `"definition"`, `"theorem"`, `"lemma"`, `"proposition"`, `"corollary"`, `"proof"`, `"example"`, `"note"`).
