export interface LatexDiagnostic {
  id: string;
  file: string | null;
  line: number | null;
  message: string;
  severity: 'error' | 'warning';
}

export function parseLatexLog(log: string): LatexDiagnostic[] {
  if (!log) return [];

  const diagnostics: LatexDiagnostic[] = [];
  const seen = new Set<string>();
  const lines = log.split(/\r?\n/);

  const pushDiag = (diag: Omit<LatexDiagnostic, 'id'>) => {
    const key = `${diag.severity}:${diag.file ?? ''}:${diag.line ?? ''}:${diag.message}`;
    if (seen.has(key)) return;
    seen.add(key);
    diagnostics.push({
      ...diag,
      id: `diag-${diagnostics.length}`,
    });
  };

  // Track active open file stack from TeX log "(./chapter1.tex ... )"
  const fileStack: string[] = [];
  const updateFileStack = (line: string) => {
    for (let idx = 0; idx < line.length; idx++) {
      const ch = line[idx];
      if (ch === '(') {
        const rest = line.slice(idx + 1);
        const match = rest.match(/^([^\s()]+?\.(?:tex|sty|cls|bib|bbl|aux))/i);
        if (match) {
          fileStack.push(match[1].replace(/^\.\//, ''));
        }
      } else if (ch === ')' && fileStack.length > 0) {
        fileStack.pop();
      }
    }
  };

  for (let i = 0; i < lines.length && diagnostics.length < 100; i++) {
    const line = lines[i];
    updateFileStack(line);

    // 1. file:line: message format
    const fileLineMatch = line.match(/^([^:\s]+\.tex):(\d+):\s*(.+)$/i);
    if (fileLineMatch) {
      pushDiag({
        file: fileLineMatch[1].replace(/^\.\//, ''),
        line: parseInt(fileLineMatch[2], 10),
        message: fileLineMatch[3].trim(),
        severity: 'error',
      });
      continue;
    }

    // 2. Classic TeX "! Error message" followed by "l.<num> ..."
    if (line.startsWith('!')) {
      const msg = line.slice(1).trim() || 'Error de LaTeX';
      let lineNum: number | null = null;
      let contextSnippet = '';

      for (let j = i + 1; j <= i + 6 && j < lines.length; j++) {
        const sub = lines[j];
        const lMatch = sub.match(/^l\.(\d+)\s*(.*)$/);
        if (lMatch) {
          lineNum = parseInt(lMatch[1], 10);
          contextSnippet = lMatch[2].trim();
          break;
        }
      }

      const currentFile = fileStack.length > 0 ? fileStack[fileStack.length - 1] : null;
      pushDiag({
        file: currentFile,
        line: lineNum,
        message: contextSnippet ? `${msg} (${contextSnippet.slice(0, 60)})` : msg,
        severity: 'error',
      });
      continue;
    }

    // 3. LaTeX Warnings with line number
    const warnMatch = line.match(/^(?:LaTeX|Package\s+\w+)\s+Warning:\s*(.+)$/i);
    if (warnMatch) {
      let fullWarn = warnMatch[1].trim();
      if (i + 1 < lines.length && !fullWarn.includes('input line') && lines[i + 1].includes('input line')) {
        fullWarn += ' ' + lines[i + 1].trim();
      }
      const lineRef = fullWarn.match(/on input line\s+(\d+)/i);
      const currentFile = fileStack.length > 0 ? fileStack[fileStack.length - 1] : null;
      pushDiag({
        file: currentFile,
        line: lineRef ? parseInt(lineRef[1], 10) : null,
        message: fullWarn,
        severity: 'warning',
      });
    }
  }

  return diagnostics;
}
