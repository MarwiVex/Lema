# Análisis Profundo del Proyecto "Lema"

Tras una revisión exhaustiva de la base de código, la arquitectura actual, los esquemas de bases de datos y los planes originales (ARCHITECTURE_BLUEPRINT y PENDIENTES.md), se presenta a continuación un análisis detallado sobre el estado del proyecto. Este documento cubre qué características faltan, áreas críticas de optimización de rendimiento, problemas arquitectónicos a solucionar y sugerencias para escalar la aplicación de forma robusta.

---

## 1. Alineación con el Plan Inicial (Estado Actual)

El proyecto ha logrado implementar gran parte del núcleo descrito en el `ARCHITECTURE_BLUEPRINT.md`:
- **Framework Base:** Se utiliza Next.js 15 (App Router) con TypeScript.
- **Base de Datos:** Se ha configurado Prisma con SQLite/LibSQL para persistencia local.
- **Seguridad Básica:** Existe un middleware (`middleware.ts`) que implementa la autenticación de sesión requerida.
- **Editor y LaTeX:** BlockNote está integrado, la exportación a LaTeX se está realizando y se cuenta con el soporte de Tectonic (mediante `texlyre-busytex` / WebAssembly) para la compilación de PDF local.
- **IA (Gemini / Groq):** Se han integrado motores de OCR e IA, con el protocolo de fallback a Groq implementado según `PENDIENTES.md`.

Sin embargo, hay áreas críticas que **faltan** para completar la visión original.

---

## 2. Características Faltantes (Pendientes del Roadmap Original)

De acuerdo con el documento de planificación y el estado del código actual, las siguientes características no están completamente implementadas o necesitan desarrollo:

1. **Bocetos a Código (Sketch to TikZ en Pizarra):**
   - **Falta:** La capacidad de detectar diagramas en el lienzo (Whiteboard) y enviar solo esa porción a la IA para generar código TikZ/LaTeX que se inserte en el editor.
2. **Anotación y Extracción en PDFs (Pizarra):**
   - **Falta:** Integrar `pdfjs-dist` directamente dentro de la interfaz de la pizarra (tldraw) para usar PDFs como lienzo de fondo y permitir el dibujo/anotación interactivo sobre ellos.
3. **Búsqueda de Texto Completo (Full-Text Search):**
   - **Falta:** Actualmente, el contenido de los documentos se guarda como un JSON string del AST de BlockNote (`content` en Prisma). Esto hace imposible hacer búsquedas de palabras clave directamente mediante SQL. Se requiere implementar un mecanismo de indexación local (ej. extraer el texto plano de los bloques al guardar) para permitir búsquedas rápidas.
4. **Galería de Plantillas Dinámica:**
   - **Falta:** Una UI en la aplicación para previsualizar, seleccionar y gestionar temas de la Cheat Sheet (ej. 2 columnas, modo oscuro, compacto).

---

## 3. Rendimiento y Optimización (Cuellos de Botella Críticos)

Existen múltiples problemas arquitectónicos que degradarán fuertemente el rendimiento de la aplicación conforme crezca el volumen de apuntes.

### 3.1. Almacenamiento de Binarios en SQLite (Crítico)
- **Problema:** En el esquema de Prisma, el PDF compilado (`LatexProject.pdfBase64`) y los archivos binarios (`LatexFile.content` si `isBinary` es true) se guardan directamente como cadenas en Base64 dentro de la base de datos SQLite.
- **Consecuencia:** SQLite no está diseñado para almacenar archivos pesados directamente. Al guardar PDFs e imágenes allí, el archivo `dev.db` (que ya pesa ~12MB) crecerá exponencialmente. Esto ralentizará drásticamente todas las consultas y corromperá el rendimiento.
- **Solución Sugerida:** Guardar los archivos binarios (PDFs, Imágenes) en el sistema de archivos local (`public/uploads` o similar) o en un servicio externo, y almacenar únicamente la ruta (URL/Path) en la base de datos.

### 3.2. Deuda Técnica en React: Monolito en `Dashboard.tsx`
- **Problema:** El archivo `src/components/dashboard/Dashboard.tsx` tiene más de 1,000 líneas de código (51KB) y maneja demasiadas responsabilidades (estados de navegación, listas de carpetas, listas de documentos, UI de modales de LaTeX, lógica de extracción de ZIPs, renderizado del Grafo).
- **Consecuencia:** Cada vez que cambia un estado menor (ej. el texto del buscador de carpetas `folderSearch`), se re-renderiza todo el Dashboard. Esto generará lag en la interfaz.
- **Solución Sugerida:** Dividir este componente monolítico en componentes más pequeños: `<Sidebar />`, `<DocumentList />`, `<Modals/ImportLatexModal />`, y `<TopNavbar />`.

### 3.3. Manejo de Estado Local Ineficiente y Fetching
- **Problema:** El estado global de carpetas y documentos se maneja pasando props y usando `useState` local y llamadas a `fetch` con `cache: 'no-store'`.
- **Consecuencia:** Es propenso a inconsistencias, dobles cargas y prop drilling. Además, Next.js re-solicita toda la data sin cacheo en cada navegación interna.
- **Solución Sugerida:** Aprovechar que **Zustand** ya está instalado en el `package.json` para crear una store global (ej. `useLemaStore`). Para llamadas a la API, implementar `React Query` (o `SWR`) para manejar estados de carga automáticos, caché inteligente y actualizaciones optimistas al crear o borrar notas.

### 3.4. Operaciones de ZIP y Compilación en el Main Thread
- **Problema:** La importación y extracción de archivos `.zip` en el Dashboard (mediante `jszip`) se ejecuta en el hilo principal de React.
- **Consecuencia:** Al subir un ZIP de proyecto LaTeX pesado (ej. con decenas de imágenes), la interfaz de usuario se congelará hasta que termine la extracción y conversión a Base64.
- **Solución Sugerida:** Delegar la extracción y parseo de ZIPs, así como la pre-compilación de los WASM, a **Web Workers** para no bloquear la UI.

---

## 4. Sugerencias de Arquitectura y UX a Futuro

Para que Lema pase de ser un "prototipo funcional" a una aplicación robusta de grado de producción ("Segundo Cerebro Matemático"), se recomienda lo siguiente:

1. **Virtualización de Listas:**
   Si un usuario tiene cientos de documentos y carpetas, renderizar todas las listas simultáneamente ralentizará el navegador. Se debe usar librerías como `@tanstack/react-virtual` para el renderizado infinito del listado lateral de archivos.
2. **Auto-Guardado Resiliente y Sincronización:**
   Actualmente la edición de documentos envía el payload al backend. Para evitar pérdidas de datos en un entorno local, se recomienda añadir soporte de **IndexedDB** en el lado del cliente. De forma que el documento se guarde localmente en microsegundos y se sincronice con SQLite (backend) de forma asíncrona (Debounce).
3. **Compilación LaTeX Incremental:**
   Tectonic compila todo el PDF de cero cada vez. Si el proyecto crece, la compilación de LaTeX tardará segundos. Explorar configuraciones donde los archivos grandes o imágenes no cambien para aprovechar los archivos auxiliares (.aux) en memoria y recompilar en caliente (Hot-Reload de PDF).
4. **Validación Zod para Endpoints API:**
   Asegurar que los payloads recibidos por las API Routes de Next.js estén correctamente formateados. Un simple error tipográfico en la IA podría enviar un bloque AST inválido a la BD, rompiendo el renderizado de la nota. Integrar `Zod` protegerá la integridad de los datos.

## Resumen del Plan de Acción Inmediato:
1. **Refactorizar `Dashboard.tsx`:** Extraer modales y sidebar a componentes separados.
2. **Migrar el Estado a Zustand:** Eliminar el prop drilling.
3. **Modificar Esquema Prisma:** Dejar de guardar PDFs y Binarios de LaTeX en Base64, cambiarlo a un sistema de archivos local (`fs` en backend).
4. **Finalizar Features de Pizarra:** Implementar la lógica "Sketch to TikZ" invocando la API visual ya funcional.
