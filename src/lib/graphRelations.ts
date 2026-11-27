import {
  getGeminiClient,
  GEMINI_MODEL,
  withTimeout,
  generateWithGroqJson,
  cleanJsonResponse,
} from '@/lib/ai';

export interface GraphNodeInput {
  id: string;
  title: string;
  group: string;
  type: string;
  textContent: string;
}

export interface DetectedEdge {
  source: string;
  target: string;
  label: string;
  weight: number;
  kind: 'AUTO' | 'AI';
}

// ─── Text Extractors ───────────────────────────────────────────────────────────

export function extractTextFromBlockNote(content: string): string {
  if (!content) return '';
  const chunks: string[] = [];

  try {
    const parsed = JSON.parse(content);
    const walk = (node: any) => {
      if (!node) return;
      if (typeof node === 'string') {
        chunks.push(node);
        return;
      }
      if (Array.isArray(node)) {
        for (const item of node) walk(item);
        return;
      }
      if (typeof node === 'object') {
        if (typeof node.text === 'string') chunks.push(node.text);
        if (typeof node.props?.title === 'string') chunks.push(node.props.title);
        if (typeof node.props?.note === 'string') chunks.push(node.props.note);
        if (node.content) walk(node.content);
        if (node.children) walk(node.children);
      }
    };
    walk(parsed);
  } catch {
    chunks.push(content);
  }

  return chunks.join(' ').slice(0, 4000);
}

export function extractTextFromWhiteboard(whiteboardData: string | null | undefined): string {
  if (!whiteboardData) return '';
  const chunks: string[] = [];
  try {
    const parsed = JSON.parse(whiteboardData);
    const walk = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        for (const item of obj) walk(item);
        return;
      }
      if (typeof obj.text === 'string' && obj.text.trim()) {
        chunks.push(obj.text.trim());
      }
      for (const key of Object.keys(obj)) {
        if (key === 'props' || key === 'store' || key === 'records' || key === 'document') {
          walk(obj[key]);
        }
      }
    };
    walk(parsed);
  } catch {
    // Ignore invalid JSON
  }
  return chunks.join(' ').slice(0, 2000);
}

export function extractTextFromLatexFiles(
  files: { filename: string; content: string; isBinary: boolean }[]
): string {
  const texFiles = files.filter((f) => !f.isBinary && f.content);
  if (texFiles.length === 0) return '';

  const chunks: string[] = [];
  for (const file of texFiles) {
    let raw = file.content;
    // Extract headings with extra prominence
    const headingMatches = raw.matchAll(/\\(?:title|chapter|section|subsection|subsubsection)\*?\{([^}]{1,150})\}/g);
    for (const m of headingMatches) {
      if (m[1]) chunks.push(m[1], m[1]);
    }
    // Strip preamble boilerplate & common commands
    raw = raw
      .replace(/%.*$/gm, ' ')
      .replace(/\\(?:documentclass|usepackage|geometry|hypersetup|bibliographystyle|bibliography|input|include)(?:\[[^\]]*\])?\{[^}]*\}/g, ' ')
      .replace(/\\(?:begin|end)\{[^}]*\}/g, ' ')
      .replace(/\\[a-zA-Z]+\*?/g, ' ')
      .replace(/[{}[\]$_^~&\\]/g, ' ');
    chunks.push(raw);
  }

  return chunks.join(' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
}

// ─── Bilingual & Domain Normalization ──────────────────────────────────────────

const STOPWORDS = new Set([
  // Spanish
  'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas', 'y', 'o', 'e', 'u',
  'en', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'hacia', 'desde', 'hasta', 'como',
  'que', 'se', 'su', 'sus', 'al', 'es', 'son', 'fue', 'ser', 'estar', 'hay', 'mas', 'pero',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'todo', 'toda', 'todos', 'cada', 'muy',
  // English
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'as', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'these', 'those', 'it', 'its',
  // Generic document/note words
  'cheat', 'sheet', 'formulario', 'english', 'espanol', 'spanish', 'introduccion', 'introduction',
  'fundamentos', 'fundamentals', 'basics', 'basic', 'level', 'nivel', 'practico', 'practical',
  'apunte', 'apuntes', 'nota', 'notas', 'tema', 'temas', 'parte', 'capitulo', 'chapter',
  'reference', 'referencia', 'guia', 'guide', 'resumen', 'summary', 'ejemplo', 'ejemplos',
  'latex', 'documento', 'document', 'sin', 'materia', 'archivo', 'pagina',
]);

// Map ES/EN phrases & stems to canonical concept tokens
const PHRASE_CANONICALS: [RegExp, string][] = [
  [/\b(algebra lineal|linear algebra)\b/g, 'concept_linear_algebra'],
  [/\b(calculo vectorial|vector calculus)\b/g, 'concept_vector_calculus'],
  [/\b(ecuaciones diferenciales ordinarias|ordinary differential equations|ecuaciones diferenciales|differential equations|ode)\b/g, 'concept_ode'],
  [/\b(geometria analitica|analytical geometry|analytic geometry)\b/g, 'concept_analytical_geometry'],
  [/\b(metodos numericos|numerical methods)\b/g, 'concept_numerical_methods'],
  [/\b(probabilidad e inferencia|probability and inference)\b/g, 'concept_probability_inference'],
  [/\b(analisis real|real analysis)\b/g, 'concept_real_analysis'],
  [/\b(calculo avanzado|advanced calculus)\b/g, 'concept_advanced_calculus'],
  [/\b(programacion orientada a objetos|object oriented programming|poo|oop)\b/g, 'concept_oop'],
  [/\b(entidad relacion|entity relationship)\b/g, 'concept_entity_relationship'],
  [/\b(teoria espectral|spectral theory)\b/g, 'concept_spectral_theory'],
  [/\b(valores propios|autovalores|eigenvalues?)\b/g, 'concept_eigen'],
  [/\b(vectores propios|autovectores|eigenvectors?)\b/g, 'concept_eigen'],
  [/\b(subespacios vectoriales|vector subspaces?|espacios vectoriales|vector spaces?)\b/g, 'concept_vector_space'],
  [/\b(transformaciones lineales|linear transformations?)\b/g, 'concept_linear_transformations'],
];

const TOKEN_CANONICALS: Record<string, string> = {
  trigonometria: 'concept_trigonometry',
  trigonometry: 'concept_trigonometry',
  probabilidad: 'concept_probability',
  probability: 'concept_probability',
  inferencia: 'concept_inference',
  inference: 'concept_inference',
  determinante: 'concept_determinant',
  determinantes: 'concept_determinant',
  determinant: 'concept_determinant',
  determinants: 'concept_determinant',
  ortogonalidad: 'concept_orthogonality',
  orthogonality: 'concept_orthogonality',
  ortogonal: 'concept_orthogonality',
  orthogonal: 'concept_orthogonality',
  matriz: 'concept_matrix',
  matrices: 'concept_matrix',
  matrix: 'concept_matrix',
  vector: 'concept_vector',
  vectores: 'concept_vector',
  vectors: 'concept_vector',
  vectorial: 'concept_vector',
  subespacios: 'concept_vector_space',
  subespacio: 'concept_vector_space',
  svd: 'concept_svd',
  espectral: 'concept_spectral_theory',
  spectral: 'concept_spectral_theory',
  transformaciones: 'concept_linear_transformations',
  transformations: 'concept_linear_transformations',
  series: 'concept_series',
  summation: 'concept_series',
  sumatoria: 'concept_series',
  identidades: 'concept_identities',
  identities: 'concept_identities',
  derivada: 'concept_derivative',
  derivadas: 'concept_derivative',
  derivative: 'concept_derivative',
  derivatives: 'concept_derivative',
  integral: 'concept_integral',
  integrales: 'concept_integral',
  integrals: 'concept_integral',
  calculo: 'concept_calculus',
  calculus: 'concept_calculus',
  algebra: 'concept_algebra',
  geometria: 'concept_geometry',
  geometry: 'concept_geometry',
  estadistica: 'concept_statistics',
  statistics: 'concept_statistics',
  guitarra: 'concept_guitar',
  guitar: 'concept_guitar',
  acordes: 'concept_chords',
  chords: 'concept_chords',
  berklee: 'concept_guitar',
  java: 'concept_java',
  clases: 'concept_oop',
  herencia: 'concept_oop',
  polimorfismo: 'concept_oop',
  javafx: 'concept_java',
  jdbc: 'concept_java',
  uml: 'concept_oop',
  microeconomico: 'concept_microeconomics',
  microeconomia: 'concept_microeconomics',
  microeconomics: 'concept_microeconomics',
  oferta: 'concept_supply_demand',
  demanda: 'concept_supply_demand',
  elasticidades: 'concept_elasticity',
  inpc: 'concept_microeconomics',
  sql: 'concept_databases',
  relacional: 'concept_databases',
  atributos: 'concept_entity_relationship',
  cardinalidad: 'concept_entity_relationship',
};

function normalizeRaw(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  let norm = normalizeRaw(text);
  if (!norm) return [];

  const extraTokens: string[] = [];
  for (const [regex, canonical] of PHRASE_CANONICALS) {
    if (regex.test(norm)) {
      extraTokens.push(canonical, canonical);
    }
  }

  const rawWords = norm.split(' ');
  const tokens: string[] = [...extraTokens];
  for (const w of rawWords) {
    if (w.length < 2 || /^\d+$/.test(w) || STOPWORDS.has(w)) continue;
    const mapped = TOKEN_CANONICALS[w];
    tokens.push(mapped || w);
  }
  return tokens;
}

function formatConceptLabel(token: string): string {
  const friendly: Record<string, string> = {
    concept_linear_algebra: 'Álgebra Lineal',
    concept_vector_calculus: 'Cálculo Vectorial',
    concept_ode: 'Ecuaciones Diferenciales',
    concept_analytical_geometry: 'Geometría Analítica',
    concept_numerical_methods: 'Métodos Numéricos',
    concept_probability_inference: 'Probabilidad e Inferencia',
    concept_real_analysis: 'Análisis Real',
    concept_advanced_calculus: 'Cálculo Avanzado',
    concept_trigonometry: 'Trigonometría',
    concept_probability: 'Probabilidad',
    concept_inference: 'Inferencia',
    concept_determinant: 'Determinantes',
    concept_orthogonality: 'Ortogonalidad',
    concept_eigen: 'Valores/Vectores Propios',
    concept_vector_space: 'Espacios Vectoriales',
    concept_spectral_theory: 'Teoría Espectral',
    concept_linear_transformations: 'Transformaciones Lineales',
    concept_svd: 'SVD',
    concept_matrix: 'Matrices',
    concept_vector: 'Vectores',
    concept_series: 'Series',
    concept_calculus: 'Cálculo',
    concept_algebra: 'Álgebra',
    concept_geometry: 'Geometría',
    concept_guitar: 'Guitarra',
    concept_chords: 'Acordes',
    concept_java: 'Java',
    concept_oop: 'POO',
    concept_databases: 'Bases de Datos',
    concept_entity_relationship: 'Modelo E-R',
    concept_microeconomics: 'Microeconomía',
  };
  return friendly[token] || token.replace(/^concept_/, '').replace(/_/g, ' ');
}

// ─── Heuristic Detector (TF-IDF + Bilingual Concepts) ──────────────────────────

export function detectHeuristicRelations(nodes: GraphNodeInput[]): DetectedEdge[] {
  if (nodes.length < 2) return [];

  const docTermFreqs: Map<string, number>[] = [];
  const titleTokenSets: Set<string>[] = [];
  const docFreq = new Map<string, number>();

  for (const node of nodes) {
    const titleTokens = tokenize(node.title);
    const contentTokens = tokenize(node.textContent);
    const tf = new Map<string, number>();

    titleTokenSets.push(new Set(titleTokens));

    // Title tokens carry 3x weight
    for (const t of titleTokens) {
      tf.set(t, (tf.get(t) || 0) + 3);
    }
    for (const t of contentTokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }

    for (const t of tf.keys()) {
      docFreq.set(t, (docFreq.get(t) || 0) + 1);
    }
    docTermFreqs.push(tf);
  }

  const N = nodes.length;
  const tfidfVectors: Map<string, number>[] = [];
  const norms: number[] = [];

  for (let i = 0; i < N; i++) {
    const tf = docTermFreqs[i];
    const vec = new Map<string, number>();
    let sqSum = 0;

    for (const [term, count] of tf.entries()) {
      const df = docFreq.get(term) || 1;
      // Smooth IDF
      const idf = Math.log(1 + N / df);
      const val = (1 + Math.log(count)) * idf;
      vec.set(term, val);
      sqSum += val * val;
    }

    tfidfVectors.push(vec);
    norms.push(Math.sqrt(sqSum) || 1);
  }

  // Score all pairs
  const candidatesByNode = new Map<number, { j: number; score: number; label: string }[]>();
  for (let i = 0; i < N; i++) candidatesByNode.set(i, []);

  for (let i = 0; i < N; i++) {
    const vecA = tfidfVectors[i];
    const normA = norms[i];
    const titleA = titleTokenSets[i];

    for (let j = i + 1; j < N; j++) {
      const vecB = tfidfVectors[j];
      const normB = norms[j];
      const titleB = titleTokenSets[j];

      let dot = 0;
      const sharedConcepts: { term: string; contrib: number }[] = [];

      for (const [term, valA] of vecA.entries()) {
        const valB = vecB.get(term);
        if (valB !== undefined) {
          const contrib = valA * valB;
          dot += contrib;
          sharedConcepts.push({ term, contrib });
        }
      }

      let score = dot / (normA * normB);

      // Direct shared title concept bonus
      let sharedTitleCount = 0;
      for (const t of titleA) {
        if (titleB.has(t)) sharedTitleCount++;
      }
      if (sharedTitleCount > 0) {
        score += Math.min(0.25, sharedTitleCount * 0.12);
      }

      // Same folder bonus (only when there's already some thematic overlap)
      const sameFolder =
        nodes[i].group !== 'Sin Materia' &&
        nodes[i].group === nodes[j].group;
      if (sameFolder && score > 0.05) {
        score += 0.08;
      }

      if (score >= 0.18) {
        sharedConcepts.sort((a, b) => b.contrib - a.contrib);
        const topTerms = sharedConcepts
          .slice(0, 2)
          .map((c) => formatConceptLabel(c.term));

        const isBilingualPair =
          (nodes[i].title.toLowerCase().includes('english') &&
            nodes[j].title.toLowerCase().includes('español')) ||
          (nodes[j].title.toLowerCase().includes('english') &&
            nodes[i].title.toLowerCase().includes('español'));

        let label = 'Tema relacionado';
        if (isBilingualPair && sharedTitleCount > 0) {
          label = 'Equivalente ES / EN';
        } else if (topTerms.length > 0) {
          label = topTerms.join(' · ');
        } else if (sameFolder) {
          label = `Materia: ${nodes[i].group}`;
        }

        const clampedWeight = Math.min(1, Math.round(score * 100) / 100);
        candidatesByNode.get(i)!.push({ j, score: clampedWeight, label });
        candidatesByNode.get(j)!.push({ j: i, score: clampedWeight, label });
      }
    }
  }

  // Keep top 5 strongest edges per node to avoid hairball graphs
  const selectedPairs = new Map<string, DetectedEdge>();
  for (let i = 0; i < N; i++) {
    const list = candidatesByNode.get(i)!;
    list.sort((a, b) => b.score - a.score);
    for (const item of list.slice(0, 5)) {
      const a = Math.min(i, item.j);
      const b = Math.max(i, item.j);
      const key = `${a}::${b}`;
      if (!selectedPairs.has(key)) {
        selectedPairs.set(key, {
          source: nodes[a].id,
          target: nodes[b].id,
          label: item.label,
          weight: item.score,
          kind: 'AUTO',
        });
      }
    }
  }

  return Array.from(selectedPairs.values());
}

// ─── AI-Powered Deep Relationship Detector ─────────────────────────────────────

const SYSTEM_INSTRUCTION_GRAPH = `
Eres un experto en organización del conocimiento académico y mapas conceptuales.
Recibirás una lista de nodos (apuntes, pizarrones y proyectos LaTeX) con su id, título, materia (folder) y un breve extracto de contenido.
Tu tarea es detectar relaciones conceptuales reales y útiles entre los nodos (por ejemplo: mismo tema en español/inglés, prerrequisito, continuación, subtema, teoría y aplicación, misma disciplina).

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con un objeto JSON válido con la forma:
   { "edges": [ { "source": "id1", "target": "id2", "label": "Relación corta (2-4 palabras)", "weight": 0.85 } ] }
2. Usa exactamente los "id" proporcionados en la entrada. Nunca inventes IDs.
3. No conectes nodos que no tengan una relación temática real (por ejemplo, no conectes Guitarra con Java o Álgebra Lineal solo por tener palabras genéricas como "Fundamentos" o "Introducción").
4. "weight" debe ser un número entre 0.3 y 1.0 según la fuerza de la relación.
5. No devuelvas aristas duplicadas ni auto-enlaces (source === target).
6. No envuelvas el JSON en backticks.
`;

export async function detectAIRelations(nodes: GraphNodeInput[]): Promise<DetectedEdge[]> {
  if (nodes.length < 2) return [];

  const validIds = new Set(nodes.map((n) => n.id));
  const catalog = nodes.map((n) => ({
    id: n.id,
    title: n.title,
    folder: n.group,
    type: n.type,
    snippet: n.textContent.slice(0, 240),
  }));

  const promptText = `Analiza estos ${nodes.length} temas y devuelve las aristas de relación conceptual:\n${JSON.stringify(catalog)}`;

  let resultText = '';

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptText,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_GRAPH,
            responseMimeType: 'application/json',
          },
        }),
        45_000,
        'Gemini Graph'
      );
      resultText = response.text || '';
    } catch (err: any) {
      console.warn('Gemini Graph detection failed, trying Groq fallback:', err.message);
    }
  }

  if (!resultText && process.env.GROQ_API_KEY) {
    resultText = await generateWithGroqJson(promptText, SYSTEM_INSTRUCTION_GRAPH, 40_000);
  }

  if (!resultText) {
    throw new Error('No hay proveedor de IA disponible (GEMINI_API_KEY o GROQ_API_KEY).');
  }

  const parsed = JSON.parse(cleanJsonResponse(resultText));
  const rawEdges = Array.isArray(parsed?.edges) ? parsed.edges : [];

  const dedup = new Map<string, DetectedEdge>();
  for (const e of rawEdges) {
    if (
      typeof e?.source !== 'string' ||
      typeof e?.target !== 'string' ||
      e.source === e.target ||
      !validIds.has(e.source) ||
      !validIds.has(e.target)
    ) {
      continue;
    }
    const [a, b] = e.source < e.target ? [e.source, e.target] : [e.target, e.source];
    const key = `${a}::${b}`;
    if (!dedup.has(key)) {
      const weight =
        typeof e.weight === 'number' && !Number.isNaN(e.weight)
          ? Math.max(0.2, Math.min(1, e.weight))
          : 0.75;
      dedup.set(key, {
        source: a,
        target: b,
        label: typeof e.label === 'string' && e.label.trim() ? e.label.trim().slice(0, 50) : 'Relacionado',
        weight,
        kind: 'AI',
      });
    }
  }

  return Array.from(dedup.values());
}
