# Auditoría Integral de Rendimiento, Estabilidad y Mejoras — `Lema`

**Fecha:** 2026-11-26  
**Enfoque:** App de uso **100% personal (single-user)** — priorizando velocidad, fluidez (60fps), cero pérdida de datos, estabilidad en editores (BlockNote, LaTeX/WASM, tldraw) y salud del entorno local/Turso.  
**Estado:** Olas 1, 2, 3 y 4 (`#1`–`#23`) implementadas y verificadas.

---

## Resumen Ejecutivo y Métricas en Vivo

La auditoría combinó 4 revisiones estáticas en paralelo (Backend/DB, Frontend/Dashboard, Editores/WASM y Salud del Repo) + pruebas reales en navegador (`http://localhost:3000`, solo lectura contra Turso).

### Qué está bien hoy
- **TypeScript (`npx tsc --noEmit`)**: **0 errores** (verificado con y sin caché incremental).
- **Peer dependencies (`npm ls`)**: **0 conflictos** con React `19.2.8` y Next.js `15.5.24`.
- **Bundle inicial del Dashboard (`/`)**: `GraphView`, `ImportLatexModal`, `react-force-graph-2d` y `jszip` ya usan carga dinámica (`next/dynamic` / `import()`).

### Hallazgos más críticos (medidos en vivo y en código)
| Área | Problema principal | Impacto real observado |
|---|---|---|
| **Visor PDF / LaTeX (`/latex/[id]`)** | Crash en cliente: `TypeError: Object.defineProperty called on non-object` en `react-pdf`/`pdfjs-dist/build/pdf.mjs` | **Bloquea por completo** abrir proyectos LaTeX con PDF compilado |
| **Autoguardado (`WhiteboardClient` / `DocEditorClient`)** | Race conditions + `WhiteboardClient` envía `content: "[]"` si no abres el panel de notas + `middleware` redirige `/api/*` a `/login` (status `200 OK`) | **Pérdida silenciosa** de apuntes y trazos |
| **Dashboard (`/`)** | Fetch duplicado `GET /api/folders` (~2.35s) tras SSR + flash de estado vacío + cambio de materia lento (~1s–3.2s) | Parpadeo al abrir y lag al cambiar entre materias |
| **Base de datos (Prisma/Turso)** | 0 índices en `schema.prisma`, over-fetching de blobs (`content`, `whiteboardData`, `pdfBase64`), `log: ['query']` activo en prod | Roundtrips lentos contra Turso (`~2.3s–3.0s`) y transferencia de MB innecesarios |
| **BusyTeX WASM** | ~685 MB de assets en `public/core/busytex/` sin caché HTTP inmutable + `rerun: true` siempre (doble pasada `pdflatex`) | Compilación ~2x más lenta y recarga/revalidación pesada |
| **Whiteboard (`tldraw`)** | Serialización `JSON.stringify` de 10–20 MB en el hilo principal cada 800ms + 50 requests a `cdn.tldraw.com` (duplicados) + carga inicial ~17.6s | Congelamientos al dibujar sobre PDFs/imágenes |
| **Repositorio en OneDrive** | **5.35 GB totales** (`.next` 1.62 GB, `--help/` duplicado 685 MB, `siama-mock-dataset/` 439 MB sin ignorar en git, `.git` 560 MB sin empacar) | Lentitud de disco/OneDrive y alto riesgo de `git add .` accidental |

---

## P0 — Crítico (Crashes bloqueantes y pérdida real de datos)

### [x] 1. Corregir crash bloqueante en `/latex/[id]` (`pdfjs-dist` / `react-pdf` + Webpack)
- **Ubicación:** `src/components/editor/CustomPdfViewer.tsx`, `src/components/editor/LatexProjectViewer.tsx:709`, `next.config.mjs`
- **Síntoma en vivo:** Al abrir proyectos LaTeX existentes (`/latex/b7b29bc5-...` y `/latex/d0245d95-...`) que tienen `pdfBase64`, la app crashea con `Runtime TypeError: Object.defineProperty called on non-object` al evaluar `react-pdf/node_modules/pdfjs-dist/build/pdf.mjs`. Impide ver árbol de archivos, editor y PDF.
- **Mejora recomendada:**
  - Configurar `next.config.mjs` para `pdfjs-dist` (deshabilitar alias `canvas: false`, revisar `transpilePackages` o `serverExternalPackages` / compatibilidad de `react-pdf@10.5.0` con Webpack en Next 15, o usar un visor PDF nativo vía `<iframe src={blobUrl}>` / `pdfjs-dist` estable).
  - Envolver `<CustomPdfViewer>` en un Error Boundary para que un fallo del visor PDF nunca tumbe el editor de código `.tex`.

### [x] 2. Evitar borrado accidental de notas en `WhiteboardClient`
- **Ubicación:** `src/components/editor/WhiteboardClient.tsx:66, 95-99, 352, 383-407`
- **Problema:**
  1. `currentBlocks` inicia en `[]` (ignorando `initialPropContent`) y `<BlockEditor>` solo se monta si abres el panel lateral de notas. Si dibujas en una pizarra que ya tenía apuntes escaneados sin abrir ese panel, el autoguardado envía `content: "[]"` y **borra las notas en DB**.
  2. Cambiar entre pestañas (`Editor` / `LaTeX` / `Vista PDF`) dentro del panel desmonta `<BlockEditor>` con `<AnimatePresence mode="wait">`, descartando cambios locales al volver.
- **Mejora recomendada:**
  - Inicializar `currentBlocks` con `initialPropContent` y llevar flags separados (`whiteboardDirtyRef`, `blocksDirtyRef`) para enviar `content` en el `PUT` **solo si realmente se editó**.
  - Ocultar las pestañas con CSS (`hidden`) en lugar de desmontar `<BlockEditor>`.

### [x] 3. Corregir race conditions de autoguardado y añadir protección al cerrar pestaña
- **Ubicación:** `src/components/editor/DocEditorClient.tsx:74-115`, `src/components/editor/WhiteboardClient.tsx:88-130`, `src/app/api/documents/route.ts:110-140`
- **Problema:**
  1. Al resolverse `PUT /api/documents`, se ejecuta `setHasUnsavedChanges(false)` incondicionalmente, marcando como "guardado" texto que escribiste mientras el request viajaba a Turso.
  2. Si falla el autoguardado, el error se silencia (`if (!isAutoSave) showToast(...)`) sin reintentar.
  3. No existe `beforeunload`, `visibilitychange` ni flush al pulsar "Volver al dashboard" (`router.push('/')`), perdiendo cambios dentro de la ventana del debounce de 2s.
- **Mejora recomendada:**
  - Sustituir `hasUnsavedChanges` por un contador monotónico (`dirtyVersionRef` vs `savedVersionRef`). Solo marcar limpio si `dirtyVersionRef.current === targetVersion`; si aumentó, disparar otro guardado inmediato.
  - Registrar `beforeunload` si hay cambios pendientes y hacer flush con `fetch(..., { keepalive: true })` al ocultar pestaña o salir.
  - Mostrar badge persistente de error + botón "Reintentar" si falla el autoguardado.

### [x] 4. Añadir autoguardado y validación de respuesta en `LatexProjectViewer`
- **Ubicación:** `src/components/editor/LatexProjectViewer.tsx:155-195, 206-248, 252-276`
- **Problema:**
  1. No tiene autoguardado, `Ctrl+S` ni `beforeunload`.
  2. En `handleCompileWasm`, `handleCompileServer` y `handleSaveFile`, los `PUT` no verifican `res.ok` ni usan `try/catch`, pero igual limpian `editedContents({})` aunque haya fallado el guardado.
  3. Si editas un `.tex` mientras WASM compila (3–15s), `onProjectUpdate({ ...project, files: filesWithEdits, pdfBase64 })` usa el closure antiguo y sobrescribe tus ediciones recientes.
- **Mejora recomendada:**
  - Añadir autoguardado (debounce 1.5–2s), `Ctrl+S` y `beforeunload`.
  - Verificar `if (!res.ok) throw ...` antes de limpiar claves en `editedContents` (y limpiar solo las que no cambiaron durante el request).
  - Usar updater funcional `setProject(prev => ({ ...prev, pdfBase64, compiledAt }))`.

### [x] 5. Corregir `middleware.ts` para devolver `401` en `/api/*` en vez de redirect a `/login`
- **Ubicación:** `src/middleware.ts:9-27`, `src/app/api/auth/login/route.ts:7`, `src/lib/auth.ts:4`
- **Problema:**
  1. Cuando la cookie expira, `middleware.ts` redirige las llamadas `fetch('/api/...')` a `/login`. `fetch` sigue el redirect, recibe HTML con `200 OK`, `res.ok === true`, y el editor cree que **guardó correctamente cuando nunca tocó la DB**.
  2. `pathname.includes('.')` permite bypass de auth en cualquier URL con un punto.
  3. Hay credenciales por defecto hardcodeadas si faltan env vars en producción.
- **Mejora recomendada:**
  - Responder `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` cuando `!isAuthenticated && pathname.startsWith('/api/')`.
  - Reemplazar `pathname.includes('.')` por regex estricta de extensiones estáticas al final del path.
  - Exigir `LEMA_APP_PASSWORD` y `LEMA_SESSION_SECRET` en producción sin fallback hardcodeado.

### [x] 6. Seguridad y robustez en compilación LaTeX de servidor (`/api/compile` y `/api/latex-projects`)
- **Ubicación:** `src/app/api/compile/route.ts:47-90`, `src/app/api/latex-projects/route.ts:195-237`
- **Problema:**
  1. `execAsync` pasa rutas por shell (riesgo de inyección) y tiene `maxBuffer` por defecto de **1 MB** (aborta con `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` si Tectonic genera logs largos con `--keep-logs`).
  2. `path.join(tmpDir, file.filename)` no valida path traversal (un `.zip` externo con `../` podría escribir fuera de `tmpDir`).
  3. `TECTONIC_CACHE_DIR: '/tmp/tectonic_cache'` es una ruta POSIX que no existe en Windows.
  4. Si Tectonic falla por error de sintaxis LaTeX, igual intenta `tectonic` en PATH y luego `docker info` (añadiendo hasta 10s de espera inútil).
- **Mejora recomendada:**
  - Unificar en `src/lib/tectonic.ts` usando `execFileAsync` (sin shell) con `maxBuffer: 10 * 1024 * 1024` y `path.join(os.tmpdir(), 'tectonic_cache')`.
  - Validar que `path.resolve(tmpDir, file.filename)` permanezca dentro de `tmpDir`.
  - Pasar al fallback solo cuando el error sea `ENOENT` (binario inexistente), no ante errores de sintaxis LaTeX.

---

## P1 — Alto Impacto en Rendimiento (Velocidad, 60fps, Red y Memoria)

### [x] 7. Eliminar el fetch duplicado y flash vacío del Dashboard (`/`)
- **Ubicación:** `src/app/page.tsx:9-21`, `src/app/ClientPage.tsx:1-10`, `src/lib/useFolders.ts:8-18`, `src/store/useLemaStore.ts:26`, `src/components/dashboard/Sidebar.tsx:23-27`
- **Síntoma en vivo:** `GET /api/folders` se dispara en el cliente **justo después del SSR**, tarda **~2.35s**, y durante ese tiempo el sidebar muestra `"Cargando..."` y el panel principal flashea `"Selecciona o crea una materia."`.
- **Mejora recomendada:**
  - Marcar `ClientPage.tsx` con `'use client'`, serializar fechas a ISO string en `page.tsx`, y pasar `revalidateOnMount: false` / `revalidateIfStale: false` (o `dedupingInterval: 10000`) en `SWRConfig`.
  - Usar una constante `EMPTY_FOLDERS = []` en `useFolders.ts` para no romper referencias en cada render.
  - Derivar `effectiveFolderId = activeFolderId ?? folders[0]?.id ?? null` para eliminar el flash del primer paint.

### [x] 8. Añadir índices en `prisma/schema.prisma` y desactivar `log: ['query']` en producción
- **Ubicación:** `prisma/schema.prisma:12-71`, `src/lib/prisma.ts:20`
- **Problema:** SQLite/Turso no crea índices automáticos en FKs. Cada carga del dashboard, cada autoguardado (`where: { title: { in: linkNames } }`) y cada carga de proyecto hace Full Table Scan sobre tablas con blobs grandes. Además `prisma.ts` imprime todas las queries SQL siempre.
- **Mejora recomendada:**
  - Añadir índices:
    - `Document`: `@@index([folderId])`, `@@index([title])`, `@@index([updatedAt])`
    - `LatexProject`: `@@index([folderId])`, `@@index([updatedAt])`
    - `LatexFile`: `@@index([projectId, isMain])`
    - `Folder`: `@@index([createdAt])`
  - Cambiar `src/lib/prisma.ts:20` a `log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']`.

### [x] 9. Eliminar over-fetching masivo de blobs (`content`, `whiteboardData`, `pdfBase64`) y roundtrips innecesarios
- **Ubicación:** `src/app/api/documents/route.ts:18-20, 116-140`, `src/app/api/latex-projects/route.ts:32-36, 101-109`, `src/app/api/graph/route.ts:6-36`, `src/components/editor/customBlocks.tsx:281-301`
- **Problema:**
  - `GET /api/documents` sin `id` (usado cada vez que haces click en un `[[wiki_link]]`) descarga **toda la tabla `Document` con todos los whiteboards y contenidos completos**, y luego navega con `window.location.href` (hard reload).
  - `PUT /api/documents` devuelve el documento completo (MBs de `whiteboardData`/`content`) cada 2s en autoguardado aunque el cliente ni siquiera lee el body, y corre `findMany({ where: { title: { in: [] } } })` incluso sin wikilinks.
  - `GET /api/latex-projects` sin `id` incluye `pdfBase64` (varios MB por proyecto).
  - `/api/graph` (tardó **~2.99s** en vivo) y `/api/export` hacen queries secuenciales en vez de `Promise.all`.
- **Mejora recomendada:**
  - Usar `select` ligero en listados y respuestas de `PUT` (`{ id, title, updatedAt }`).
  - Añadir `GET /api/documents?title=...` para `WikiLinkChip` y navegar con `router.push(...)`.
  - Saltar el `findMany` de wikilinks cuando `linkNames.length === 0`.
  - Paralelizar queries con `Promise.all` en `graph/route.ts` y `export/route.ts`, y añadir acción `update_files` en batch en `latex-projects/route.ts`.

### [x] 10. Optimizar BusyTeX WASM (caché HTTP inmutable + evitar doble compilación siempre)
- **Ubicación:** `src/components/editor/useLatexWasm.ts:32-56, 119-140`, `next.config.mjs:15-31`, `public/core/busytex/`
- **Problema:**
  1. Los 685 MB de assets WASM (`texlive-extra.data` solo pesa 325.8 MB) se sirven con `max-age=0, must-revalidate` (default de `public/`).
  2. `rerun: true` fuerza **2 pasadas completas de `pdflatex`** en cada compilación, incluso si cambiaste una sola letra y no hay referencias cruzadas.
  3. `DocEditorClient` no usa `useLatexWasm` (depende 100% de `/api/compile` en servidor) y tanto `DocEditorClient` como `LatexProjectViewer` desmontan `<CustomPdfViewer>` al compilar, reseteando zoom y scroll a la página 1.
- **Mejora recomendada:**
  - Añadir header `Cache-Control: public, max-age=31536000, immutable` para `/core/busytex/:path*` en `next.config.mjs`.
  - Usar `rerun: false` por defecto y re-ejecutar 2da pasada solo si el log indica `Rerun to get` / `Label(s) may have changed` (o toggle manual).
  - Evaluar carga bajo demanda de `texlive-extra.js` (325 MB).
  - Mantener `<CustomPdfViewer>` montado debajo de un overlay mientras recompila (sin limpiar `pdfBase64` hasta recibir el nuevo PDF).
  - Integrar `useLatexWasm` como motor primario en `DocEditorClient`.

### [x] 11. Eliminar lag y congelamientos en `WhiteboardEditor` (`tldraw`)
- **Ubicación:** `src/components/editor/WhiteboardEditor.tsx:134-155, 180-279, 442-454`, `src/components/editor/WhiteboardClient.tsx:64, 92-100`
- **Problema:**
  1. Cada página PDF o imagen importada se guarda como PNG Base64 (`scale: 2.0`, 1–3 MB/página) dentro del JSON de `tldraw`. Cada 800ms corre `JSON.stringify(getSnapshot(editor.store))` en el **hilo principal** (10–20 MB) y dispara `setWhiteboardData`, re-renderizando todo `WhiteboardClient`.
  2. `pdfjs.getDocument(...)` nunca llama `pdf.destroy()` ni `page.cleanup()` → **memory leak directo** al importar PDFs.
  3. En vivo se observaron **50 requests a `cdn.tldraw.com`** (traducciones `en.json`/`es.json` 4x, fuentes 2x) y carga inicial de ~17.6s en dev.
- **Mejora recomendada:**
  - Guardar `whiteboardData` en `useRef` (no `useState`) y subir debounce a `2000–2500ms`.
  - Exportar páginas PDF a `image/webp` (calidad `0.85`, 5–10x más ligero que PNG) y cerrar con `try { ... page.cleanup(); } finally { await pdf.destroy(); }`.
  - Servir los assets estáticos de `tldraw` localmente en `public/` (`assetUrls`) para eliminar dependencia y latencia de `cdn.tldraw.com`.

### [x] 12. Cortar re-renders en cascada en Dashboard y Editores + aliviar GPU (60fps)
- **Ubicación:**
  - `src/components/dashboard/Dashboard.tsx:26`
  - `src/components/dashboard/DocumentList.tsx:32-44, 206-345`
  - `src/app/globals.css:27-32`
  - `src/components/editor/DocEditorClient.tsx:56, 65-72, 178-184`
  - `src/components/editor/LatexProjectViewer.tsx:595-603, 709`
- **Síntoma en vivo:** Cambiar de materia en Dashboard tardó ~1s en carpetas pequeñas y ~3.2s en `Álgebra Lineal` (8 proyectos).
- **Mejora recomendada:**
  - Quitar `useFolders()` sin uso de `Dashboard.tsx:26`.
  - En `DocumentList`: extraer el formulario de creación (`newDocTitle`) a un subcomponente, memoizar `activeFolder` y las tarjetas (`React.memo`), y usar `<Link href={...}>` en lugar de `<div onClick={() => router.push(...)}>` para activar **prefetch automático** y `Ctrl+Click`.
  - En `globals.css`: quitar `backdrop-filter: blur(16px)` y `transition-all` de las tarjetas repetitivas (dejar blur solo en navbar/modales).
  - En `DocEditorClient` / `WhiteboardClient`: guardar `currentBlocks` en `useRef` y solo correr `exportToLatex()` cuando la pestaña `LaTeX` o `splitScreen` esté visible o al compilar.
  - En `LatexProjectViewer`: aislar el `<textarea>` en un subcomponente y memoizar `<CustomPdfViewer>` para que teclear no re-renderice el PDF ni el árbol de archivos.

### [x] 13. Alojar `pdf.worker.min.mjs` localmente y corregir bug de zoom en `CustomPdfViewer`
- **Ubicación:** `src/components/editor/CustomPdfViewer.tsx:10, 25-70, 105-116`, `src/components/editor/WhiteboardEditor.tsx:182`
- **Problema:**
  1. `workerSrc` apunta a `https://unpkg.com/...`, frágil con `Cross-Origin-Embedder-Policy: require-corp` y sin internet.
  2. `VirtualizedPdfPage` cachea `measuredSize` en píxeles escalados pero no lo recalcula al cambiar `scale`, causando saltos de scroll al hacer zoom.
  3. `atob(pdfBase64)` + bucle byte a byte corre síncrono en el hilo principal.
- **Mejora recomendada:**
  - Copiar `pdf.worker.min.mjs` a `public/` y cargar `/pdf.worker.min.mjs`.
  - Guardar tamaño base sin escala (`width / scale`, `height / scale`) y multiplicarlo por `scale`.
  - Pasar `Uint8Array` / `Blob` directo desde WASM cuando ya existe en memoria, evitando ida y vuelta a Base64.

---

## P2 — Bugs Funcionales, Estabilidad e Integraciones (AI, Export, Grafo, Import)

### [x] 14. Mejorar endpoints de IA (`/api/ai/*`): timeouts, singleton, streaming y fix de Groq
- **Ubicación:** `src/app/api/ai/{delta,generate,ocr,tikz}/route.ts`, `package.json:17`
- **Problema:**
  1. Ninguna llamada a Gemini ni Groq tiene timeout (`AbortSignal.timeout`).
  2. `'gemini-3.6-flash'` está duplicado en 4 archivos y `new GoogleGenAI` se instancia en cada request; `@google/genai` está en `0.2.0` (alpha antigua).
  3. En `/api/ai/generate`, Groq recibe `response_format: { type: 'json_object' }` pero el prompt exige un array `[...]` (suele devolver HTTP 400).
  4. `/api/ai/ocr` y `/api/ai/tikz` vuelcan respuestas crudas a `console.log` y no validan tamaño máximo de `imageBase64`.
- **Mejora recomendada:**
  - Crear `src/lib/ai.ts` con singleton lazy de `GoogleGenAI` y `GEMINI_MODEL` por env var.
  - Añadir `AbortSignal.timeout(30_000)`, arreglar el schema `{ "blocks": [...] }` para Groq, actualizar `@google/genai`, y evaluar streaming en `/api/ai/generate`.

### [x] 15. Arreglar bugs en `exportToLatex.ts` y `MathBoxInner`
- **Ubicación:** `src/lib/exportToLatex.ts:1, 93-120, 138-140, 297`, `src/components/editor/customBlocks.tsx:53-77, 90, 225`
- **Problema:**
  1. `exportToLatex.ts:297` emite `\begin{${envName}}[${title}]` sin escapar ni envolver en `{...}`: cualquier `_`, `%`, `&` o `]` en el título de un Teorema/Definición rompe la compilación LaTeX. Los nodos `link` tampoco se escapan.
  2. `MathBoxInner` inyecta texto fuera de `$...$` en `dangerouslySetInnerHTML` sin escapar HTML: escribir `x < y` o `<a, b>` desaparece al interpretarse como tag HTML.
  3. `exportToLatex.ts:1` usa `import { Block }` en lugar de `import type { Block }`.
- **Mejora recomendada:** Escapar HTML en `renderLatexText`, escapar títulos/links/llaves en `exportToLatex.ts` y cambiar a `import type`.

### [x] 16. Arreglar `/api/export` (Backup ZIP completo y rápido)
- **Ubicación:** `src/app/api/export/route.ts:8-65, 75-94, 115-177`
- **Problema:**
  1. Usa `atob()` + bucle JS en vez de `Buffer.from(str, 'base64')` (lento y alto pico de RAM).
  2. **Backup incompleto**: omite `LatexProject` con `folderId: null`, no exporta `whiteboardData` (`.tldraw.json`), descarta `wiki_link` y sub-bloques `children` al convertir a Markdown, y sobrescribe silenciosamente notas con el mismo título en la misma carpeta.
- **Mejora recomendada:** Usar `Buffer.from`, incluir proyectos LaTeX huérfanos y `.tldraw.json`, soportar `wiki_link`/`children` en Markdown y desambiguar nombres duplicados (`titulo (2).md`).

### [x] 17. Corregir `GraphView.tsx` (amontonamiento de nodos, cámara secuestrada y estabilidad)
- **Ubicación:** `src/components/dashboard/GraphView.tsx:45-185`, `src/app/api/graph/route.ts`
- **Síntoma en vivo:** Los nodos se concentran densamente en el centro con etiquetas superpuestas ilegibles.
- **Problemas en código:**
  1. `onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}` resetea tu zoom/pan cada vez que mueves un nodo.
  2. No filtra enlaces huérfanos (riesgo de crash en `d3-force`), dibuja etiquetas a cualquier nivel de zoom sin LOD, y no muestra estado de error si falla `/api/graph`.
  3. `src/app/api/graph/route.ts` no declara `export const dynamic = 'force-dynamic'`.
- **Mejora recomendada:** Aumentar repulsión (`d3Force('charge').strength(...)`) y distancia de enlaces, usar `hasFittedRef` para `zoomToFit` solo una vez, ocultar etiquetas cuando `globalScale < 0.6`, agregar `nodePointerAreaPaint`, filtrar links válidos y declarar `force-dynamic` en `/api/graph`.

### [x] 18. Corregir bugs en `ImportLatexModal.tsx`
- **Ubicación:** `src/components/dashboard/ImportLatexModal.tsx:43-175, 219-225`
- **Problema:**
  1. Si el primer archivo subido no es `.tex`, ninguno queda como `isMain: true` (y no hay selector en UI).
  2. El texto promete drag & drop de `.zip`, pero faltan `onDragOver`/`onDrop`.
  3. No filtra `__MACOSX/` ni `.DS_Store` dentro de los `.zip`.
  4. `setTimeout` de cierre no se limpia al desmontar, y clicar el tab activo borra los archivos cargados.
- **Mejora recomendada:** Detectar el primer `.tex` + botón para marcar principal, añadir handlers de drag & drop, filtrar basura macOS, limpiar timer y validar `activeFolderId`.

### [x] 19. Proteger contra borrado accidental en cascada + respuestas HTTP consistentes en APIs
- **Ubicación:** `prisma/schema.prisma:28, 55`, `src/app/api/{documents,folders,latex-projects}/route.ts`
- **Problema:**
  - Borrar una `Folder` elimina en cascada todos sus `Document` (`onDelete: Cascade`) pero deja `LatexProject` con `SetNull` (inconsistente y peligroso para uso personal).
  - Errores `P2025` (no encontrado) devuelven `500` en vez de `404`; `GET /api/documents?id=inexistente` devuelve `200` con `null`; `POST /api/documents` rechaza `content: ""`.
- **Mejora recomendada:** Unificar política de borrado (ej. `SetNull` o confirmación explícita con conteo de notas) y crear un helper `handleApiError(error)` para códigos Prisma.

---

## P3 — UX Personal, Estética y Limpieza del Repositorio

### [x] 20. Optimistic updates + reemplazar `window.alert()` por `ToastContainer` + atajos de teclado
- **Ubicación:** `src/components/dashboard/{DocumentList,Sidebar,TopNavbar}.tsx`, `src/components/ui/ConfirmModal.tsx`, `src/store/useEditorStore.ts`
- **Mejora recomendada:**
  - Usar `mutate(updater, { optimisticData, rollbackOnError: true, revalidate: false })` para que crear/renombrar/borrar materias y apuntes sea instantáneo (0ms percibidos) en vez de esperar 2 roundtrips a Turso.
  - Reemplazar todos los `window.alert()` por `useEditorStore.getState().showToast(...)` y mostrar errores en `handleRename*` en vez de tragarlos.
  - Cerrar `ConfirmModal` e `ImportLatexModal` con `Escape` y click en backdrop; añadir `Ctrl/Cmd + K` para enfocar búsqueda rápida en el dashboard.
  - Seleccionar automáticamente una materia recién creada.

### [x] 21. Arreglar vista móvil (`390px`) y detalles visuales en Whiteboard y BlockEditor
- **Observado en vivo:**
  - En móvil, elegir una materia no cierra el sidebar (`setMobileSidebarOpen(false)` faltante en `Sidebar.tsx:182`), y `Grafo` + `Backup ZIP` desaparecen (`hidden md:flex` en `TopNavbar.tsx:78`).
  - En Whiteboard (`tldraw`), el lienzo arranca en tema claro sobre el header oscuro de Lema y el botón `"Cargar Archivo"` se parte en dos líneas.
  - En `BlockEditor.tsx`, limpiar `setTimeout` en desmontaje, quitar doble disparo `queueMicrotask` de `onChange`, y poner tope al stack `aiUndoStackRef` (ej. 20 entradas).
  - En `DocEditorClient.tsx`, cambiar el enlace `<a href="data:application/pdf;base64,...">` por Blob URL bajo demanda y alinear el texto `"Compilar PDF"` / `"PDF"`.

### [x] 22. Limpieza urgente del repositorio y OneDrive (recuperar ~2.5+ GB y evitar accidentes en Git)
- **Hallazgos en disco (~5.35 GB totales):**
  1. **`--help/` (684.96 MB)**: duplicado accidental exacto de `public/core/busytex/`. Eliminar.
  2. **`siama-mock-dataset/` (439.16 MB, 22,282 archivos)**: aparece como **untracked (`??`)** en `git status`. Mover fuera del repo o añadir a `.gitignore` urgentemente antes de un `git add .` accidental.
  3. **`bin/tectonic.exe` (49.15 MB) y `bin/tectonic` (35.46 MB)**: binarios pesados trackeados en Git (junto con `.git/` de **560 MB** sin empacar / `in-pack: 0`). Considerar sacarlos de Git (o `git gc`) si ya usas WASM / descarga por script.
  4. **Archivos temporales sueltos en raíz**: `tectonic.tar.gz` (13.5 MB), `test_main.*`, `patch-dashboard.js`, `patch-latex-viewer.js`, `ts_errors.txt`, `compile_test*.txt`, `Discrete_mathematics.zip`, `scratch-test.mjs`, `test-*.js`.
  5. **Warning de workspace root en Next.js**: existe un `C:\Users\<usuario>\package-lock.json` que hace que Next.js infiera el root equivocado en `npm run dev` — fijar `outputFileTracingRoot` en `next.config.mjs` (o borrar el lockfile huérfano en `C:\Users\<usuario>`).
  6. **Consideración OneDrive**: tener `node_modules/` (1.2 GB / 49k archivos) y `.next/` (1.62 GB) dentro de OneDrive ralentiza compilaciones, `npm install` y el disco en Windows. Mover el repo a `C:\dev\Lema` (respaldado en GitHub) da un salto enorme en velocidad de desarrollo.

### [x] 23. Configuración técnica y mantenimiento menor
- **Ubicación:** `package.json`, `tsconfig.json`, `prisma7.config.ts`, `src/app/globals.css`, `src/app/login/page.tsx`
- **Mejoras:**
  - Configurar ESLint (`eslint` + `eslint-config-next`) si quieres usar `npm run lint` (hoy falla/pide setup interactivo).
  - Renombrar `prisma7.config.ts` → `prisma.config.ts` y alinearlo con `TURSO_DATABASE_URL` (o documentar flujo local vs Turso) y añadir `dotenv` si se mantiene `import "dotenv/config"`.
  - Actualizar `"target": "ES2017"` → `"ES2022"` en `tsconfig.json`.
  - Limpiar paquetes `extraneous` en `node_modules` (`npm prune`) y evaluar actualizar `@google/genai` (`0.2.0` → estable) y `@blocknote/*` (`0.26` → reciente, revisando breaking changes).
  - Limpiar CSS muerto (`animate-shake` inexistente en `login/page.tsx`, `.line-clamp-3` redundante, `@keyframes` sin usar en `globals.css`) y centralizar tipos de dominio (`FolderItem`, `DocumentSummary`, `LatexProjectSummary`) eliminando `any`.

---

## Orden Sugerido de Ejecución (si decides aplicarlo por fases)

1. **Ola 1 — Urgente / Cero pérdida de datos y crashes (1 sesión corta):** Items `#1`, `#2`, `#3`, `#4`, `#5`, `#6`.
2. **Ola 2 — Salto grande de velocidad (percepción instantánea):** Items `#7`, `#8`, `#9`, `#10`, `#12`, `#20`.
3. **Ola 3 — Whiteboard fluido, PDF sólido y herramientas sin bugs:** Items `#11`, `#13`, `#14`, `#15`, `#16`, `#17`, `#18`.
4. **Ola 4 — Higiene del repo y pulido personal:** Items `#19`, `#21`, `#22`, `#23`.
