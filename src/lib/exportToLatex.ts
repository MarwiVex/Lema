import type { Block } from "@blocknote/core";
import type { LatexOptions } from "./types/ast";

export type { LatexOptions };

const getLatexPreamble = (options: LatexOptions) => {
  const classOptions = options.columns === 2 ? "[10pt, landscape, twocolumn]" : (options.columns === 1 ? "[10pt]" : "[10pt, landscape]");
  
  return `\\documentclass${classOptions}{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=0.5in, columnsep=0.4in]{geometry}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{xcolor}
\\usepackage{tabularx}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usetikzlibrary{arrows.meta, positioning, calc, shapes.geometric, 3d}
\\usepackage{enumitem}
\\usepackage{mathpazo}
\\usepackage{booktabs}
\\usepackage{multicol}
\\usepackage[most]{tcolorbox}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{4pt}

\\AtBeginDocument{
  \\setlength{\\abovedisplayskip}{4pt}
  \\setlength{\\belowdisplayskip}{4pt}
  \\setlength{\\abovedisplayshortskip}{2pt}
  \\setlength{\\belowdisplayshortskip}{2pt}
}

\\definecolor{themeblue}{RGB}{0, 90, 160}
\\definecolor{themegray}{RGB}{80, 80, 80}

\\newtcolorbox{definition}[1][]{colback=themeblue!10,colframe=themeblue,title={#1}}
\\newtcolorbox{theorem}[1][]{colback=red!5,colframe=red!75!black,title={#1}}
\\newtcolorbox{lemma}[1][]{colback=green!5,colframe=green!50!black,title={#1}}
\\newtcolorbox{corollary}[1][]{colback=violet!5,colframe=violet,title={#1}}
\\newtcolorbox{equationbox}[1][]{colback=magenta!5,colframe=magenta!75!black,title={#1}}

\\newcommand{\\cheatsheetsection}[1]{
    \\vspace{0.8em}
    {\\color{themeblue}\\large\\bfseries #1} \\par
    \\vspace{-0.4em}
    {\\color{themeblue}\\rule{\\linewidth}{1pt}} \\par
    \\vspace{0.3em}
}

\\newcommand{\\cheatsheetsubsection}[1]{
    \\vspace{0.5em}
    {\\color{themeblue}\\normalsize\\bfseries #1} \\par
    \\vspace{0.2em}
}

\\begin{document}
\\small
${options.columns === 3 ? '\\begin{multicols}{3}\n' : ''}${options.title ? `
\\begin{center}
    \\vspace{-1em}
    {\\color{themeblue}\\huge\\bfseries ${escapeLatexText(options.title)}}\\\\[0.1em]
    {\\color{themegray}\\small Generado por Lema}\\\\[0.4em]
\\end{center}
\\vspace{-1em}
` : ''}`;
};

const getLatexPostamble = (options: LatexOptions) => {
  return `${options.columns === 3 ? '\n\\end{multicols}' : ''}\n\\end{document}\n`;
};

const LATEX_ESCAPE_MAP: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '&': '\\&',
  '%': '\\%',
  '#': '\\#',
  '^': '\\textasciicircum{}',
  '_': '\\_',
  '~': '\\textasciitilde{}',
  '{': '\\{',
  '}': '\\}',
  '$': '\\$',
};

function escapePlainLatex(plain: string): string {
  return plain.replace(/[\\&%#^{}_~$]/g, (ch) => LATEX_ESCAPE_MAP[ch] ?? ch);
}

function escapeUrlForHref(url: string): string {
  return url.replace(/\\/g, '\\textbackslash{}').replace(/([%#])/g, '\\$1');
}

/**
 * Escape LaTeX special characters in plain text segments.
 * We only escape outside math delimiters ($...$) to preserve user math input.
 */
function escapeLatexText(text: string): string {
  const parts: string[] = [];
  const mathPattern = /(\$\$[\s\S]+?\$\$|\$(?!\s)(?:[^$\\\n]|\\.)+?(?<![\s\\])\$(?![a-zA-Z0-9]))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  mathPattern.lastIndex = 0;
  while ((match = mathPattern.exec(text)) !== null) {
    parts.push(escapePlainLatex(text.slice(lastIndex, match.index)));
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  parts.push(escapePlainLatex(text.slice(lastIndex)));
  return parts.join('');
}

function processInlineContent(content: any[]): string {
  if (!content || !Array.isArray(content)) return '';
  return content.map(item => {
    if (item.type === 'text') {
      let text = escapeLatexText(item.text || '');
      if (item.styles?.bold) text = `\\textbf{${text}}`;
      if (item.styles?.italic) text = `\\textit{${text}}`;
      if (item.styles?.underline) text = `\\underline{${text}}`;
      if (item.styles?.textColor && item.styles.textColor !== 'default') {
        text = `\\textcolor{${item.styles.textColor}}{${text}}`;
      }
      if (item.styles?.backgroundColor && item.styles.backgroundColor !== 'default') {
        text = `\\colorbox{${item.styles.backgroundColor}!30}{${text}}`;
      }
      return text;
    }
    if (item.type === 'wiki_link') {
      return escapeLatexText(item.props?.note || '');
    }
    if (item.type === 'link') {
      const label =
        Array.isArray(item.content) && item.content.length > 0
          ? processInlineContent(item.content)
          : escapeLatexText(item.href || '');
      if (typeof item.href === 'string' && item.href.trim()) {
        return `\\href{${escapeUrlForHref(item.href.trim())}}{${label}}`;
      }
      return label;
    }
    return '';
  }).join('');
}

function extractCellInline(cell: any): any[] {
  if (Array.isArray(cell)) return cell;
  if (cell && Array.isArray(cell.content)) return cell.content;
  return [];
}

function processBlocks(blocks: Block[]): string {
  let latexCode = '';

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const textContent = processInlineContent(block.content as any[]);
    const anyBlock = block as any;

    // Handle grouping for bullet and numbered lists
    if (anyBlock.type === 'bulletListItem' || anyBlock.type === 'numberedListItem') {
      const listType = anyBlock.type === 'bulletListItem' ? 'itemize' : 'enumerate';
      latexCode += `\\begin{${listType}}[leftmargin=*, nosep]\n`;
      latexCode += `\\item ${textContent}\n`;
      
      if (anyBlock.children && anyBlock.children.length > 0) {
        latexCode += processBlocks(anyBlock.children);
      }
      
      // Group consecutive items of the same type
      while (i + 1 < blocks.length && (blocks[i + 1] as any).type === anyBlock.type) {
        i++;
        const nextBlock = blocks[i];
        const nextContent = processInlineContent(nextBlock.content as any[]);
        latexCode += `\\item ${nextContent}\n`;
        
        if (nextBlock.children && nextBlock.children.length > 0) {
          latexCode += processBlocks(nextBlock.children);
        }
      }
      
      latexCode += `\\end{${listType}}\n\n`;
      continue;
    }

    switch (anyBlock.type) {
      case 'heading':
        const level = anyBlock.props.level || 1;
        let headingText = textContent;
        if (anyBlock.props?.textColor && anyBlock.props.textColor !== 'default') {
           headingText = `\\textcolor{${anyBlock.props.textColor}}{${headingText}}`;
        }
        
        let alignHStart = '';
        let alignHEnd = '';
        if (anyBlock.props?.textAlignment === 'center') {
           alignHStart = '\\begin{center}\n'; alignHEnd = '\n\\end{center}';
        } else if (anyBlock.props?.textAlignment === 'right') {
           alignHStart = '\\begin{flushright}\n'; alignHEnd = '\n\\end{flushright}';
        }

        if (level === 1 || level === 2) {
          latexCode += `\n${alignHStart}\\cheatsheetsection{${headingText}}${alignHEnd}\n`;
        } else {
          latexCode += `\n${alignHStart}\\cheatsheetsubsection{${headingText}}${alignHEnd}\n`;
        }
        break;
      
      case 'paragraph':
        const trimmed = textContent.trim();
        // Skip common LaTeX enumitem artifacts pasted as paragraphs
        if (trimmed.startsWith('[') && trimmed.endsWith(']') && trimmed.includes('leftmargin')) {
           break;
        }

        if (trimmed) {
          let alignStart = '';
          let alignEnd = '';
          if (anyBlock.props?.textAlignment === 'center') {
             alignStart = '\\begin{center}\n'; alignEnd = '\n\\end{center}';
          } else if (anyBlock.props?.textAlignment === 'right') {
             alignStart = '\\begin{flushright}\n'; alignEnd = '\n\\end{flushright}';
          }
          
          let blockColorStart = '';
          let blockColorEnd = '';
          if (anyBlock.props?.textColor && anyBlock.props.textColor !== 'default') {
              blockColorStart = `\\textcolor{${anyBlock.props.textColor}}{`;
              blockColorEnd = `}`;
          }
          if (anyBlock.props?.backgroundColor && anyBlock.props.backgroundColor !== 'default') {
              blockColorStart += `\\colorbox{${anyBlock.props.backgroundColor}!20}{`;
              blockColorEnd = `}` + blockColorEnd;
          }

          latexCode += `${alignStart}${blockColorStart}${textContent}${blockColorEnd}${alignEnd}\n\n`;
        }
        break;

      case 'table': {
        let rows: any[] = [];
        if (anyBlock.content && anyBlock.content.type === 'tableContent') {
           rows = anyBlock.content.rows;
        } else if (anyBlock.content && Array.isArray(anyBlock.content.rows)) {
           rows = anyBlock.content.rows;
        } else if (anyBlock.content && Array.isArray(anyBlock.content) && anyBlock.content[0] && Array.isArray(anyBlock.content[0].cells)) {
           rows = anyBlock.content; // sometimes it's just an array of rows
        }

        if (rows && rows.length > 0) {
           const colCount = Math.max(
             1,
             ...rows.map((r) => (Array.isArray(r.cells) ? r.cells.length : 0))
           );
           const colSpec = Array(colCount).fill('X').join('|');
           latexCode += `\n\\renewcommand{\\arraystretch}{1.2}\n`;
           latexCode += `\\begin{tabularx}{\\linewidth}{|${colSpec}|}\n\\hline\n`;
           for (const row of rows) {
             const rawCells = Array.isArray(row.cells) ? row.cells : [];
             const cellTexts = Array.from({ length: colCount }, (_, idx) =>
               processInlineContent(extractCellInline(rawCells[idx]))
             );
             latexCode += `${cellTexts.join(' & ')} \\\\ \\hline\n`;
           }
           latexCode += `\\end{tabularx}\n\n`;
        }
        break;
      }

      case 'checkListItem': {
        const checked = Boolean(anyBlock.props?.checked);
        const box = checked ? '$\\boxtimes$' : '$\\square$';
        latexCode += `${box} ${textContent}\n\n`;
        break;
      }

      case 'image': {
        const caption = typeof anyBlock.props?.caption === 'string' ? anyBlock.props.caption.trim() : '';
        const url = typeof anyBlock.props?.url === 'string' ? anyBlock.props.url.trim() : '';
        if (caption) {
          latexCode += `\\begin{center}\n\\textit{[Imagen: ${escapeLatexText(caption)}]}\n\\end{center}\n\n`;
        } else if (url) {
          latexCode += `% Imagen omitida: ${url.slice(0, 120).replace(/[\r\n]/g, ' ')}\n\n`;
        }
        break;
      }

      case 'code':
      case 'codeBlock': {
        let rawCode = '';
        if (Array.isArray(anyBlock.content)) {
          rawCode = anyBlock.content.map((c: any) => c.text || '').join('');
        } else if (typeof anyBlock.content === 'string') {
          rawCode = anyBlock.content;
        }
        
        const lang = anyBlock.props?.language?.toLowerCase();
        if (lang === 'latex' || lang === 'tex') {
          latexCode += `${rawCode}\n\n`;
        } else if (lang === 'tikz') {
          if (!rawCode.includes('\\begin{tikzpicture}')) {
             latexCode += `\\begin{center}\n\\begin{tikzpicture}\n${rawCode}\n\\end{tikzpicture}\n\\end{center}\n\n`;
          } else {
             latexCode += `\\begin{center}\n${rawCode}\n\\end{center}\n\n`;
          }
        } else {
          latexCode += `\\begin{verbatim}\n${rawCode}\n\\end{verbatim}\n\n`;
        }
        break;
      }

      case 'math_box': {
        const type = anyBlock.props.type || 'definition';
        const title = anyBlock.props.title || 'Caja';
        
        let envName = 'definition';
        if (type === 'theorem') {
          envName = 'theorem';
        } else if (type === 'lemma') {
          envName = 'lemma';
        } else if (type === 'corollary') {
          envName = 'corollary';
        } else if (type === 'equation') {
          envName = 'equationbox';
        }

        // Title must be wrapped in braces and escaped to handle spaces and special chars
        latexCode += `\n\\begin{${envName}}[{${escapeLatexText(title)}}]\n`;
        latexCode += `${textContent || '~'}\n`;
        latexCode += `\\end{${envName}}\n`;
        break;
      }
      
      case 'tikz_graph': {
        let rawTikz = '';
        if (Array.isArray(anyBlock.content)) {
          rawTikz = anyBlock.content.map((c: any) => c.text || '').join('');
        } else if (typeof anyBlock.content === 'string') {
          rawTikz = anyBlock.content;
        }
        if (!rawTikz.includes('\\begin{tikzpicture}')) {
           latexCode += `\\begin{center}\n\\begin{tikzpicture}\n${rawTikz}\n\\end{tikzpicture}\n\\end{center}\n\n`;
        } else {
           latexCode += `\\begin{center}\n${rawTikz}\n\\end{center}\n\n`;
        }
        break;
      }

      default:
        // Bloques desconocidos o genéricos
        if (textContent.trim()) {
          latexCode += `${textContent}\n\n`;
        }
        break;
    }

    // Procesar hijos de manera recursiva si existen
    if (anyBlock.children && anyBlock.children.length > 0) {
       latexCode += processBlocks(anyBlock.children);
    }
  }

  return latexCode;
}

export function exportToLatex(blocks: Block[], options: LatexOptions = { columns: 2 }): string {
  const body = processBlocks(blocks);
  // If the body is empty (no content yet), insert a non-breaking space
  // so Tectonic/LaTeX doesn't produce "No pages of output".
  const safeBody = body.trim() ? body : '~\n';
  return getLatexPreamble(options) + safeBody + getLatexPostamble(options);
}
