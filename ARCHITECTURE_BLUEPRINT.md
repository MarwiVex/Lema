# ARCHITECTURE & DEVELOPMENT BLUEPRINT
## Sistema de Notas Estilo Notion con Maquetación Automática LaTeX e IA (Gemini API)

---

> Este documento define la arquitectura completa, el modelo de datos AST, las estrategias de consumo de IA incremental (Delta Updates) y el plan de implementación por hitos para **Lema**, una plataforma privada de productividad y generación de Cheat Sheets en LaTeX.

---

## 1. Visión General de Arquitectura (System Architecture)

### 1.1 Diagrama de Componentes del Sistema

```mermaid
graph TD
    subgraph Client [" Dispositivos Privados (Laptop, Tablet, Mobile) "]
        A[Navegador Web / PWA] --> B[Middleware de Autenticación / Token Edge]
    end

    subgraph Tunnel [" Capa de Red Privada & Seguridad "]
        B --> C{Túnel Privado}
        C -->|Opción B: Tailscale VPN| D[Next.js App Server - Local Host]
        C -->|Opción B: Cloudflare Zero Trust| D
    end

    subgraph Backend [" Aplicación Principal (Next.js App Router) "]
        D --> E[Editor de Bloques - BlockNote / TipTap]
        D --> F[Delta Update & Ingestion Engine]
        D --> G[LaTeX AST Transpiler Engine]
        D --> H[Base de Datos SQLite / Prisma ORM]
    end

    subgraph External [" Servicios de Inteligencia & Compilación "]
        F -->|@google/genai SDK| I[Gemini 2.0 Flash API]
        G -->|Payload .tex| J[Tectonic LaTeX PDF Microservice]
        J -->|Buffer PDF| G
    end
```

### 1.2 Stack Tecnológico Recomendado

| Componente | Tecnología | Justificación Técnica |
| :--- | :--- | :--- |
| **Framework Base** | **Next.js 15 (App Router, React 19, TypeScript)** | Renderizado híbrido, API Routes integradas para microservicios de compilación/IA, y Server Actions eficientes. |
| **Editor por Bloques** | **BlockNote** (sobre **TipTap** y **ProseMirror**) | Soporta comandos de barra `/`, arrastrar y soltar bloques, bloques customizados y extensión directa con KaTeX. |
| **Renderizado Matemático Web** | **KaTeX** | Renderizado ultra-rápido en cliente para fórmulas en tiempo real en el editor sin sobrecargar el navegador. |
| **Base de Datos & ORM** | **SQLite + Prisma ORM** / **Drizzle ORM** | Base de datos ligera, autocontenida y embebida ideal para despliegue monousuario local de ultra-baja latencia. |
| **Procesamiento de IA & OCR** | **Gemini 2.0 Flash / 1.5 Pro** (`@google/genai SDK`) | Visión nativa multimodal para OCR de manuscritos y procesamiento estructurado JSON a velocidad excepcional y bajo costo. |
| **Compilador LaTeX backend** | **Tectonic Compiler Engine** (Docker/Microservicio) | Compilador LaTeX moderno autocontenido en Rust (XeTeX), elimina instalaciones pesadas de TeXLive y compila en milisegundos. |
| **Seguridad & Acceso Privado** | **Tailscale VPN / Cloudflare Tunnels + JWT Edge Middleware** | Acceso exclusivo desde dispositivos autorizados en la red virtual privada sin exponer puertos públicos a Internet. |

---

## 2. Modelo de Datos y Árbol de Sintaxis Abstracta (Block AST Schema)

El documento completo se compone de un **Document Tree** donde cada nota es un nodo que contiene una lista de **Bloques AST (Abstract Syntax Tree)**.

### 2.1 Esquema JSON del Documento y Bloques (`Block AST Schema`)

```typescript
// Tipos Principales del Sistema de Bloques
export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'math_block'
  | 'math_definition'
  | 'math_theorem'
  | 'code'
  | 'table'
  | 'column_list'
  | 'callout';

export interface BaseBlock {
  id: string; // UUID v4 o ksuid
  type: BlockType;
  props: Record<string, any>;
  children: Block[];
  createdAt: number;
  updatedAt: number;
}

export interface MathDefinitionBlock extends BaseBlock {
  type: 'math_definition';
  props: {
    title: string;          // Ej: "Espacio Métrico"
    symbol?: string;         // Ej: "(X, d)"
    content: string;         // Markdown + LaTeX KaTeX
    latex_template: string;  // Sintaxis LaTeX final para Tectonic
    color_theme?: string;    // Paleta de color para la caja en la Cheat Sheet
  };
}

export interface MathBlock extends BaseBlock {
  type: 'math_block';
  props: {
    latex: string;           // Código LaTeX crudo (ej: \int_{0}^{\infty} f(x)dx)
    displayMode: boolean;    // Inline vs Display mode
    caption?: string;
  };
}

export interface DocumentAST {
  id: string;
  title: string;
  template_config: {
    columns: 2 | 3 | 4;
    orientation: 'portrait' | 'landscape';
    font_size: '8pt' | '9pt' | '10pt';
    theme: 'academic' | 'modern_dark' | 'compact_vibrant';
  };
  blocks: Block[];
  metadata: {
    createdAt: number;
    updatedAt: number;
    tags: string[];
  };
}
```

### 2.2 Protocolo de Edición Incremental (Delta Updates JSON Patch)

Para evitar reescribir todo el documento al interactuar con Gemini API, la aplicación envía únicamente el **Bloque Seleccionado** o el **Fragmento Contextual Minimalista**.

#### Payload de Solicitud al Backend (`DeltaRequest`)
```json
{
  "document_id": "doc-9941",
  "target_block_id": "block-102",
  "user_instruction": "Agrega la condición de no negatividad y simetría a la definición de métrica.",
  "target_block": {
    "id": "block-102",
    "type": "math_definition",
    "props": {
      "title": "Espacio Métrico",
      "content": "Sea X un conjunto no vacío. Una métrica es una función d: X x X -> R..."
    }
  },
  "neighbor_context": [
    { "type": "paragraph", "content": "Contexto previo del tema..." }
  ]
}
```

#### Respuesta de la IA / Patch de Actualización (`DeltaResponse`)
```json
{
  "action": "UPDATE_BLOCK",
  "target_block_id": "block-102",
  "patch": {
    "props": {
      "title": "Espacio Métrico",
      "content": "Sea $X$ un conjunto no vacío. Una función $d: X \\times X \\to \\mathbb{R}$ es una métrica si cumple:\n1. $d(x,y) \\geq 0$ (No negatividad)\n2. $d(x,y) = 0 \\iff x = y$\n3. $d(x,y) = d(y,x)$ (Simetría)\n4. $d(x,z) \\leq d(x,y) + d(y,z)$ (Desigualdad triangular)",
      "latex_template": "\\begin{definition}[Espacio Métrico]\nSea $X$ un conjunto no vacío. Una función $d: X \\times X \\to \\mathbb{R}$ es una métrica si cumple...\n\\end{definition}"
    }
  }
}
```

---

## 3. Estrategia de Integración con Gemini API

### 3.1 Prompts de Sistema (System Instructions)

#### System Prompt 1: Ingesta & OCR Multimodal (Gemini Vision)
```text
Eres un experto transcriptor de matemáticas avanzadas, ciencia de la computación y código LaTeX.
Tu tarea es analizar la imagen/escaneo adjunto de apuntes o documentos y convertirlo strictly en una estructura JSON AST de bloques.

REGLAS DE SALIDA:
1. Responde ÚNICAMENTE en formato JSON válido alineado al esquema BlockAST.
2. Convierte todas las ecuaciones matemáticas a sintaxis LaTeX estándar para KaTeX (usa $...$ para inline y $$...$$ para bloques).
3. Identifica automáticamente definiciones, teoremas, ejemplos y fórmulas clave asignando los tipos: "math_definition", "math_theorem", "math_block", o "paragraph".
4. Estructura el código en bloques limpios y modulares sin explicaciones adicionales fuera del JSON.
```

#### System Prompt 2: Motor de Edición Diferencial (Delta Update Protocol)
```text
Eres un asistente especializado en edición incremental de documentos matemáticos estructurados por bloques.
Recibirás el bloque objetivo en formato JSON y una instrucción de modificación del usuario.

REGLAS ESTRICTAS:
1. NO regeneres el documento completo. Genera ÚNICAMENTE la actualización en formato JSON Patch para el bloque objetivo.
2. Mantén las claves JSON del bloque recibido y actualiza únicamente los campos afectados por la instrucción.
3. Asegura que cualquier sintaxis LaTeX dentro del contenido esté limpia, correcta y lista para renderizado KaTeX y compilación Tectonic.
4. Responde exclusivamente con el JSON Delta especificado.
```

---

## 4. Roadmap de Desarrollo Iterativo por Hitos (Phased Implementation Roadmap)

### Detalle de Hitos:

#### **Fase 1: Esqueleto del Editor de Bloques + Autenticación Privada + Túnel**
- Configuración de proyecto Next.js 15 (TypeScript, Tailwind / Vanilla CSS custom tokens).
- Integración de **BlockNote** con soporte KaTeX inline y bloque matemático extendido.
- Persistencia local mediante **SQLite + Prisma**.
- Middleware de seguridad monousuario (Session Token / Basic Auth Edge).
- Configuración del túnel de red privada (**Tailscale** / **Cloudflare Zero Trust**).

#### **Fase 2: Pipeline de Gemini API (OCR + Delta Editing Engine)**
- Integración del SDK oficial `@google/genai` (Gemini 2.0 Flash).
- Implementación del endpoint API `/api/ai/ocr` para procesamiento de imágenes a AST.
- Implementación del protocolo de edición diferencial `/api/ai/delta` para actualización individual de nodos con reducción del 80-90% de tokens.

#### **Fase 3: Renderizado y Exportador LaTeX con Compilador PDF Backend**
- Motor de conversión de Bloques AST a sintaxis LaTeX `.tex`.
- Creación de plantilla base Cheat Sheet (encabezados compactos, multicolumna `multicol`, paquetes `tcolorbox` para teoremas/definiciones).
- Microservicio en backend/Docker corriendo **Tectonic Engine** para compilación instantánea de `.tex` a PDF.

#### **Fase 4: Optimización de Interfaz, Shortcuts y Gestión de Plantillas**
- Galería de plantillas LaTeX de alta densidad visual (2 columnas, 3 columnas, temas oscuros/claros).
- Atajos de teclado para inserción rápida de bloques matemáticos (`/def`, `/theo`, `/math`).
- Vista previa en tiempo real split-screen (Editor de Bloques vs PDF Compilado).
- Ajustes de diseño de alta gama y micro-animaciones en la interfaz de usuario.
