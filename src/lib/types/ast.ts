// ─── Block types supported by the custom schema ──────────────────────────────
export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'math_box'
  | 'bulletListItem'
  | 'numberedListItem'
  | 'code'
  | 'codeBlock'
  | 'tikz_graph'
  | 'table'
  | 'image';

export type MathBoxType = 'definition' | 'theorem' | 'lemma' | 'corollary' | 'equation';

// ─── Dashboard / Domain Summary Types ─────────────────────────────────────────
export interface DocumentSummary {
  id: string;
  title: string;
  type: 'TEXT' | 'WHITEBOARD' | string;
  updatedAt: string;
  folderId?: string | null;
}

export interface LatexProjectSummary {
  id: string;
  title: string;
  description?: string | null;
  compiledAt?: string | null;
  updatedAt: string;
  folderId?: string | null;
}

export interface FolderSummary {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  documents: DocumentSummary[];
  latexProjects: LatexProjectSummary[];
}

// ─── Block prop schemas ────────────────────────────────────────────────────────
export interface MathBoxProps {
  type: MathBoxType;
  title: string;
}

export interface BaseBlockProps {
  title?: string;
  symbol?: string;
  content?: string;
  latex?: string;
  color_theme?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose';
  language?: string;
  [key: string]: any;
}

// ─── Generic BlockNote block representation ───────────────────────────────────
export interface BlockAST {
  id?: string;
  type: BlockType | string;
  props: BaseBlockProps | MathBoxProps | Record<string, any>;
  content?: any;
  children?: BlockAST[];
}

// ─── LaTeX export options ─────────────────────────────────────────────────────
export interface LatexOptions {
  columns: 1 | 2 | 3;
  title?: string;
}

// ─── Delta protocol — request / response ──────────────────────────────────────
/**
 * Sent by the frontend to /api/ai/delta
 * Contains the full target block object and the user's edit instruction.
 */
export interface DeltaRequest {
  /** The full BlockNote block object to be modified */
  target_block: BlockAST;
  /** Free-form instruction from the user */
  user_instruction: string;
}

/**
 * Returned by /api/ai/delta
 * Contains the action type and a partial block patch.
 */
export interface DeltaResponse {
  action: 'UPDATE_BLOCK' | 'REPLACE_BLOCK' | 'INSERT_AFTER';
  /** ID of the block that was targeted (for reference) */
  target_block_id?: string;
  /** Partial block update to apply via editor.updateBlock() */
  patch: {
    /** New inline content (string or BlockNote inline content array) */
    content?: any;
    /** Updated block props (e.g. title, type for math_box) */
    props?: Partial<MathBoxProps> | Partial<BaseBlockProps>;
    children?: BlockAST[];
  };
}
