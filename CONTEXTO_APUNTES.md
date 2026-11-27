# Contexto y Guía Maestra para Generación de Apuntes en `Lema`

Este documento (junto con `AGENTS.md` y la skill `.agents/skills/lema-apuntes/SKILL.md`) le da a **Antigravity** todo el contexto necesario para que cuando abras este repositorio y digas:

> *"Hazme apuntes de [tema / PDF / código / notas]"*

el agente redacte el apunte con tu estilo exacto, lo compile a PDF con `./bin/tectonic.exe`, verifique que no tenga errores de LaTeX y **lo suba directamente a tu base de datos Turso** dentro de la materia o subcarpeta correspondiente.

---

## 1. Arquitectura de Apuntes en la Base de Datos (`Turso` / `Prisma`)

En `Lema` existen dos modelos de apuntes:

1. **`LatexProject` + `LatexFile` (Predeterminado para todos tus apuntes y formularios):**
   - Tabla `LatexProject`: `{ id, title, description, pdfBase64, compiledAt, folderId }`.
   - Tabla `LatexFile`: `{ id, projectId, filename: "main.tex", content, isBinary: false, isMain: true }`.
   - Siempre se sube con `pdfBase64` precompilado mediante `./bin/tectonic.exe` para que al abrir `Lema` en desktop o Vercel (`lema-ten.vercel.app`) el PDF se visualice de inmediato sin esperar a WASM.
2. **`Document` (`type: "TEXT"`, solo cuando pidas explícitamente un apunte interactivo por bloques `BlockNote`):**
   - Tabla `Document`: `{ id, title, normalizedTitle, type: "TEXT", content: JSON.stringify(blocks), folderId }`.

---

## 2. Comandos Rápidos (`scripts/upload-apunte.mjs`)

El agente dispone del script `scripts/upload-apunte.mjs` que lee `.env` (`TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`):

- **Listar árbol de materias y subcarpetas:**
  ```powershell
  node scripts/upload-apunte.mjs --list-folders
  ```
- **Listar apuntes dentro de una materia (para continuar numeración `1.`, `2.`, `3.`):**
  ```powershell
  node scripts/upload-apunte.mjs --list-projects --folder-id <folderId>
  ```
- **Crear nueva materia o subcarpeta:**
  ```powershell
  node scripts/upload-apunte.mjs --create-folder "Nombre" --parent-id <idPadreOpcional>
  ```
- **Compilar `.tex` con Tectonic y subir/actualizar en Turso:**
  ```powershell
  node scripts/upload-apunte.mjs --tex .tmp-apunte.tex --title "Título" --description "Subtítulo descriptivo" --folder-id <folderId> --cleanup
  ```

---

## 3. Plantilla Basal LaTeX (`10pt, landscape, twocolumn`, Palatino `mathpazo`)

Ubicada también en `.agents/skills/lema-apuntes/templates/plantilla-cheatsheet.tex`:

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

% --- Inicio del Documento ---
\begin{document}

% --- Cabecera ---
\begin{center}
    \vspace{-1em}
    {\color{themeblue}\huge\bfseries Título de la Plantilla Basal}\\[0.1em]
    {\color{themegray}\small Subtítulo descriptivo o guía rápida para el tema seleccionado}\\[0.4em]
    {\color{themegray}\footnotesize \textbf{Por Roberto León Landeros}}
\end{center}
\vspace{-0.8em}

% --- Sección de Ejemplo ---
\cheatsheetsection{1. Primera Sección de Ejemplo}
Texto riguroso y directo en dos columnas con ecuaciones en línea ($E = mc^2$) o en bloque:
\[ \int_{a}^{b} f(x) \, dx = F(b) - F(a) \]

\cheatsheetsubsection{1.1 Subsección Detallada}
\begin{itemize}[leftmargin=*, nosep]
    \item \textbf{Primer punto:} Definición formal desde primeros principios.
    \item \textbf{Segundo concepto:} Implicaciones y casos límite.
\end{itemize}

% --- Ejemplo de Tabla ---
\cheatsheetsection{2. Referencia de Datos (Tabla)}
\vspace{0.2em}
\renewcommand{\arraystretch}{1.2}
\begin{tabularx}{\linewidth}{|p{0.3\linewidth}|X|}
\hline
\rowcolor{setblue}
\textbf{Categoría} & \textbf{Descripción o Aplicación} \\ \hline
Concepto A & Descripción detallada de cómo aplicar este concepto en un entorno práctico. \\ \hline
Concepto B & Nota sobre las limitaciones o excepciones de esta regla específica. \\ \hline
Fórmula C & $\nabla \cdot \mathbf{B} = 0$ --- Breve explicación de la ley física. \\ \hline
\end{tabularx}

\end{document}
```

---

## 4. Criterios de Calidad para Cada Apunte

1. **Sin resúmenes superficiales:** Si el usuario entrega un tema amplio o un documento largo, sintetiza **todos** los conceptos técnicos, definiciones, teoremas, algoritmos, sintaxis y tablas comparativas sin omitir detalles críticos.
2. **Notación matemática formal:**
   - Cuantificadores ($\forall, \exists$) en lugar de texto largo.
   - $:=$ para definiciones por primera vez.
   - $\equiv$ para identidades algebraicas o relaciones de congruencia.
   - $=$ para igualdades entre expresiones ya definidas.
3. **Diagramas `TikZ` y Tablas `tabularx`:**
   - Usa diagramas `TikZ` compactos para arquitecturas, autómatas, diagramas E-R, espacios vectoriales o flujos.
   - Usa `tabularx{\linewidth}` con bordes limpios o `\rowcolor{setblue}` para resumir operadores, complejidades, comandos SQL/CLI o propiedades algebraicas.
