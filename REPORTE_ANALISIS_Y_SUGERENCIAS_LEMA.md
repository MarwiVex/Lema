# REPORTE DE ANÁLISIS, MEJORAS Y SUGERENCIAS: PROYECTO LEMA

Tras una revisión profunda de la base de código, la arquitectura, los esquemas de bases de datos y la recolección de todos los planes anteriores del proyecto (documentos previos fusionados), a continuación se presenta un reporte exhaustivo sobre el estado de Lema y las recomendaciones para elevar su rendimiento, usabilidad y diseño a un estándar de grado de producción.

---

## 1. Alineación con el Plan Inicial (Estado Actual)

El proyecto ha logrado implementar gran parte del núcleo arquitectónico original y resolver su deuda técnica inicial. Entre los avances detectados se encuentran:
- **Refactorización de UI Completada:** Componentes masivos como el antiguo `Dashboard.tsx` han sido divididos correctamente en `<Sidebar />`, `<DocumentList />`, `<TopNavbar />` y modales.
- **Gestión de Estado:** La integración de `Zustand` (`useLemaStore`) está manejando de forma eficiente la apertura de modales y las vistas de gráficos.
- **Integración IA y OCR:** Ya existe funcionalidad para enviar datos a la API de Gemini mediante los endpoints `/api/ai/delta`, `/api/ai/generate` y `/api/ai/ocr`.
- **Editor en Tiempo Real:** `BlockNote` está bien configurado con soporte matemático (`KaTeX`) y extensiones a medida.

Sin embargo, hay cuellos de botella y características de usabilidad que **requieren atención prioritaria**.

---

## 2. Optimizaciones Críticas (Rendimiento y Arquitectura)

### 2.1 Almacenamiento de Binarios en SQLite (Crítico)
- **Problema:** En el esquema de Prisma (`schema.prisma`), el PDF compilado (`LatexProject.pdfBase64`) y los archivos binarios (`LatexFile.content` para imágenes) se están guardando directamente como cadenas largas en Base64 dentro de la base de datos SQLite.
- **Impacto:** SQLite no está diseñado para el almacenamiento directo de archivos pesados. Guardar Base64 infla drásticamente el tamaño del archivo `.db`, lo que ralentizará *todas* las operaciones de lectura/escritura y provocará bloqueos completos del backend.
- **Sugerencia:** Migrar el almacenamiento de estos archivos (PDFs e imágenes) al sistema de archivos local (`/public/uploads` o una carpeta externa de datos de usuario) y almacenar **solo la ruta relativa o URL** en la base de datos.

### 2.2 Operaciones Intensivas en el Hilo Principal (Main Thread)
- **Problema:** La importación, extracción y parseo de proyectos LaTeX en `.zip` (mediante `jszip`), así como la pre-compilación de WASM, pueden bloquear el hilo de ejecución principal de React.
- **Impacto:** Al subir un `.zip` pesado, la interfaz se "congela" sin permitir interacciones hasta que el archivo se procesa.
- **Sugerencia:** Delegar toda esta lógica de compresión y parseo a **Web Workers** nativos del navegador, asegurando que el renderizado de Next.js se mantenga fluido.

### 2.3 Búsqueda de Texto Completo (Full-Text Search) Limitada
- **Problema:** El contenido de cada documento se guarda como un string JSON estructurado (`AST` de BlockNote). Esto imposibilita realizar búsquedas nativas SQL eficientes por palabra clave (ej. buscar "Álgebra").
- **Sugerencia:** Implementar un campo `plainText` oculto en la base de datos que se llene automáticamente (usando un hook de Prisma o al momento de guardar) extrayendo solo el texto legible de los bloques. Así, los algoritmos de búsqueda serán ultrarrápidos y precisos.

### 2.4 Modularización de Componentes Pesados
- **Problema:** Aunque se refactorizó `Dashboard.tsx`, archivos como `BlockEditor.tsx` (casi 700 líneas y 30KB) y `LatexProjectViewer.tsx` (34KB) han comenzado a convertirse en nuevos monolitos.
- **Sugerencia:** Separar los modales de IA (`AiModal`, `AiGenerateModal`) y las barras de herramientas a componentes secundarios para mantener la lógica de renderizado del editor limpia e independiente de la gestión de la IA.

---

## 3. Mejoras de Diseño (UI/UX) y Usabilidad Web

Para que la experiencia visual (WOW-factor) sea verdaderamente premium y se sienta como una aplicación moderna y dinámica:

### 3.1 Diseño de Plantillas LaTeX Visual
- **Situación:** Los usuarios pueden exportar a LaTeX, pero no tienen feedback visual sobre cómo se verá la plantilla final.
- **Sugerencia:** Crear un **Selector Dinámico de Temas y Plantillas** con vistas previas en miniatura (thumbnails) renderizados previamente. Opciones como "Compacto", "Académico" o "Modo Oscuro" deberían previsualizarse con transiciones suaves y *hover effects* vibrantes.

### 3.2 Feedback Táctil y Micro-animaciones (Glassmorphism)
- **Sugerencia:** Reforzar el diseño premium actual implementando:
  - **Framer Motion:** Animaciones sutiles al cambiar entre vistas (ej. de Listado de Documentos al Editor de Nodos/Grafo).
  - **Efectos Glassmorphism:** Agregar desenfoque (`backdrop-blur`) más notorio a modales y *tooltips*.
  - Mejor retroalimentación visual al utilizar el *drag & drop* en la barra lateral o en el editor de bloques.

### 3.3 Auto-Guardado Inteligente y Resiliente (IndexedDB)
- **Problema:** Enviar actualizaciones al backend con cada letra o cambio de bloque (aunque se tenga debouncing) es arriesgado y costoso.
- **Sugerencia:** Usar la API nativa de **IndexedDB** en el lado del cliente como caché primaria. Esto permite guardar cada *keystroke* de inmediato sin latencia web, y enviar un lote (batch) de sincronización al backend solo cuando el usuario haga una pausa larga o cierre el documento.

### 3.4 Virtualización de Listas
- **Sugerencia:** Si un usuario crea 500 notas, renderizarlas de golpe en el Sidebar o en el DocumentList será lento. Implementar `@tanstack/react-virtual` para que solo se rendericen en el DOM los archivos visibles en la pantalla en ese instante.

---

## 4. Roadmap Consolidado de Funcionalidades Pendientes

A partir de los planes anteriores, estas son las funcionalidades clave restantes por integrar:

1. **Bocetos a Código (Sketch to TikZ en Pizarra):**
   - **Avance:** Pizarra configurada.
   - **Siguiente Paso:** Al presionar "OCR", detectar si la porción dibujada es un esquema e invocar a la IA para traducirlo a código gráfico TikZ, inyectándolo directamente en las notas como un bloque renderizable.

2. **Anotación Avanzada sobre PDFs (Pizarra):**
   - **Avance:** Lógica de `tldraw` y OCR básica existiendo.
   - **Siguiente Paso:** Integrar `pdfjs-dist` para establecer las páginas de un PDF importado como *fondo (background)* del lienzo de `tldraw`, permitiendo rayar y trazar por encima del documento real y poder "extraer" fragmentos mediante el OCR ya construido.

3. **Grafo de Conocimiento Interactivo:**
   - **Avance:** Detección básica de sintaxis `[[NombreNota]]` en el esquema.
   - **Siguiente Paso:** Mejorar visualmente `GraphView.tsx` (que ya usa `react-force-graph`) con interacciones ricas: enfocar nodos al hacer clic, usar partículas de colores de acuerdo al tag o folder del documento, y permitir saltar a los documentos con animaciones cinemáticas (Framer Motion).

---

### Resumen de Próximos Pasos de Acción
1. **Prioridad 1 (Backend/DB):** Modificar la lógica y esquema para guardar binarios (PDF/imágenes) en carpeta local en lugar de Base64 dentro de SQLite.
2. **Prioridad 2 (Frontend):** Dividir los monolitos `BlockEditor.tsx` y `LatexProjectViewer.tsx` para mejorar la mantenibilidad del código React.
3. **Prioridad 3 (UX):** Integrar Web Workers para procesos pesados e implementar `IndexedDB` para guardado local sin fallos.
4. **Prioridad 4 (Features):** Culminar los planes con la pizarra para trazos "Sketch to TikZ" y anotación de PDFs.

> *Nota: Este documento ha fusionado todos los reportes, análisis y pendientes anteriores en una sola fuente de verdad actualizada.*
