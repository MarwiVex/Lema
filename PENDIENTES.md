# 📋 LEMA: Lista de Pendientes & Plan de Desarrollo

> Este documento consolida el **Análisis de Viabilidad** con el nivel gratuito de la API de Gemini, los **Bugs Críticos Inmediatos** (exportación a PDF con plantillas y OCR de pizarra) y el **Roadmap de Mejoras** para la plataforma Lema.

---

## 🔍 1. Análisis de Viabilidad (Gemini API - Plan Gratuito)

Debido a que el proyecto es de **uso personal (1 solo usuario)** y se utiliza la **versión gratuita de Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`)**, se evalúa la factibilidad técnica considerando los límites gratuitos (15 Solicitudes por Minuto / 1M de tokens de contexto por llamada):

| Funcionalidad propuesta                   |     Viabilidad     | Evaluación Técnica & Estrategia para Nivel Gratuito                                                                                                                                                                                                 |
| :---------------------------------------- | :----------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bocetos a Código (Sketch to TikZ)**     | 🟢 **100% Viable** | 1 solicitud por cada gráfico generado (~1,000 tokens). Gemini Vision 2.0 Flash procesa la imagen del canvas en 1-2 segundos. Muy por debajo del límite de 15 RPM.                                                                                   |
| **Chatbot Contextual (RAG)**              | 🟢 **100% Viable** | Gracias a la enorme ventana de contexto de **1 millón de tokens** en Gemini Flash, **NO necesitas una base de datos vectorial compleja**. Se puede enviar todo el texto/notas activas directamente en la instrucción. Latencia de ~1.5s y $0 costo. |
| **Anotación sobre PDFs (Pizarra)**        | 🟢 **100% Viable** | El renderizado y dibujo sobre PDFs se realiza **100% local en el navegador** (`pdfjs-dist` + `tldraw`). La IA solo se invoca bajo demanda cuando pidas extraer o analizar texto/fórmulas de una página específica.                                  |
| **Grafo de Conocimiento (`[[Enlaces]]`)** | 🟢 **100% Viable** | **No consume API de IA**. Es lógica 100% local en JavaScript (parseo de sintaxis wikilink `[[Nota]]` + renderizado de red de nodos interactiva con librerías livianas como `react-force-graph` o `vis-network`).                                    |
| **Generación Libre Multibloque**          | 🟢 **100% Viable** | Gemini Flash genera respuestas estructuradas en JSON de varios bloques en una sola llamada (~3-5 segundos). Consumo eficiente de tokens y cero impacto en límites de cuotas.                                                                        |

---

## 🚨 2. Bugs Críticos & Correcciones Inmediatas

### 🛠️ 2.1 Reparación de Exportación a PDF con Plantillas (`plantillas/`)

- [x] **Fallo Actual:** La exportación a PDF produce documentos en blanco o no respeta la plantilla LaTeX definida en `plantillas/plantilla_base.tex` y `plantilla_simple.tex`.
- [x] **Mapeo Fiel del AST a LaTeX:** Reescribir el motor de transpilación para que los bloques de BlockNote (`math_box`, `heading`, `paragraph`, `code`, `table`) se traduzcan exactamente a las macros de la plantilla:
  - `math_box` (definición) $\to$ `\begin{definition}[Título] ... \end{definition}`
  - `math_box` (teorema) $\to$ `\begin{theorem}[Título] ... \end{theorem}`
  - Soporte de columnas `multicol` y cajas `tcolorbox`.
- [x] **Soporte Completo de Gráficos y TikZ:** Garantizar que los bloques de código `TikZ` / `pgfplots` se incluyan correctamente en el archivo `.tex` entre `\begin{tikzpicture}` y `\end{tikzpicture}` sin romper el compilador Tectonic.
- [x] **Verificación del Microservicio Tectonic:** Probar y validar el pipeline `/api/compile` para capturar errores de sintaxis LaTeX y asegurar que devuelva el Buffer PDF binario renderizado correctamente.

### 🎨 2.2 Reparación y Optimización de la Pizarra (Whiteboard OCR)

- [x] **Fallo Actual:** La opción "Analizando con IA..." en la pizarra se queda congelada o no devuelve la estructura de bloques adecuada a BlockNote.
- [x] **Depuración del Endpoint `/api/ai/ocr`:**
  - Validar la exportación del canvas de `tldraw` a imagen Base64 (MIME Type `image/png`).
  - Corregir el parseo JSON de la respuesta de Gemini para asegurar compatibilidad con el esquema de `InlineContent` de BlockNote.
  - Añadir manejo de errores robusto en la UI: timeout, notificaciones Toast de error y botón de reintento.

---

## ⚡ 3. Potenciación de la IA (Generación Libre & Multibloque)

### 🤖 3.0 Sistema de Fallback Multi-Proveedor (Gemini + Groq)

- [x] **Fallback Automático a Groq API:** Configurar los endpoints de la IA (`/api/ai/delta` y `/api/ai/ocr`) para que, en caso de cuota excedida (Error 429) o fallos de Gemini, redirijan automáticamente la solicitud a la API de Groq (`llama-3.3-70b-versatile` para texto y `llama-3.2-11b-vision-preview` para OCR) sin interrumpir al usuario.

### 🤖 3.1 Motor de Generación Dinámica (AI Prompter Libre)

- [x] **Superar la restricción de 1 solo bloque (Delta Edit):** Implementar un nuevo modo de IA en la interfaz que permita dar prompts abiertos (ej. _"Crea una guía de estudio sobre Álgebra Lineal con definiciones, teoremas, un código de ejemplo y un diagrama TikZ"_).
- [x] **Creación de Múltiples Bloques en Cascada:**
  - Configurar Gemini para que devuelva un array dinámico de bloques AST (`Array<Block>`) decidiendo libremente qué tipos de bloques crear (`paragraph`, `heading`, `math_box`, `code`, `tikz_graph`).
  - Permitir a la IA intercalar texto explicativo, notación KaTeX y código gráfico dentro de la misma respuesta.
    [x] Añadir mas tipos de bloques para que la IA pueda crear mas variedad de cosas.
- [x] **Personalización de Prompts y Estilos:** Crear un selector rápido de tono (Académico Riguroso, Resumido para Examen, Explicación Intuitiva) para guiar la generación de la IA.
      (ejemplo no definitivo
      Intenta aumentar ligeramente el rigor. Siempre trata de usar simbología adecuada en lugar de usar el texto que represente esta, usar más los cuantificadores y considera usar un poco el := o el congruente a si aplica, si no usar el = convencional. No exagerar en esto.
      )

---

## 🚀 4. Nuevas Funcionalidades Seleccionadas (Roadmap)

### 📐 4.1 Bocetos a Código (Sketch to TikZ en Pizarra)

- [x] Al hacer OCR detectar los diagramas y el texto **"Convertir Dibujo a TikZ"**.
- [x] Capturar el área seleccionada de la pizarra y enviarla a Gemini Vision con prompt especializado en generación de código TikZ/LaTeX.
- [x] Insertar automáticamente el código TikZ generado como un bloque gráfico en las notas.

### 📄 4.3 Anotación y Extracción de PDFs en Pizarra

- [x] Integrar lector/renderizador de PDF (`pdfjs-dist`) dentro del lienzo de `tldraw`.
- [x] Permitir importar documentos PDF como lienzo de fondo y dibujar o hacer trazos encima.
- [x] Agregar la función de "Seleccionar y Extraer a Notas" usando Gemini Vision.

### 🕸️ 4.4 Grafo de Conocimiento (Knowledge Graph)

- [x] Implementar detección de sintaxis `[[Nombre de Nota]]` dentro del editor BlockNote.
- [x] Construir un índice local de notas y enlaces entre documentos en SQLite/Prisma.
- [x] Crear una vista de mapa de red interactivo (Grafo 2D/3D) para navegar visualmente entre materias y conceptos relacionados.

---
