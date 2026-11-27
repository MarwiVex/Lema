import fs from 'fs';
import path from 'path';

const pipelinePath = path.join(process.cwd(), 'public', 'core', 'busytex', 'busytex_pipeline.js');

if (fs.existsSync(pipelinePath)) {
  let content = fs.readFileSync(pipelinePath, 'utf8');
  let patched = false;
  
  // Overleaf uses nonstopmode WITHOUT halt-on-error. We remove '--halt-on-error'
  // so that pdflatex generates a PDF even if there are undefined control sequences.
  if (content.includes("'--halt-on-error'")) {
    content = content.replace(/'--halt-on-error',\s*/g, '');
    patched = true;
    console.log('[patch-busytex] Patched busytex_pipeline.js to remove --halt-on-error');
  }

  // Also patch the PDF loading logic so it returns the PDF even if exit_code != 0,
  // guarding against ENOENT when pdflatex aborts before creating the PDF.
  const safeReadTarget = 'const pdf = FS.analyzePath(pdf_path).exists ? this.read_all_bytes(FS, pdf_path) : null;';
  if (!content.includes(safeReadTarget)) {
    const legacyTargets = [
      'const pdf = exit_code == 0 ? this.read_all_bytes(FS, pdf_path) : null;',
      'const pdf = this.read_all_bytes(FS, pdf_path);',
    ];
    for (const legacy of legacyTargets) {
      if (content.includes(legacy)) {
        content = content.replaceAll(legacy, safeReadTarget);
        patched = true;
        console.log('[patch-busytex] Patched busytex_pipeline.js to load PDF safely on error');
        break;
      }
    }
  }

  if (patched) {
    fs.writeFileSync(pipelinePath, content, 'utf8');
  } else {
    console.log('[patch-busytex] No modifications needed (already patched?)');
  }
} else {
  console.log('[patch-busytex] busytex_pipeline.js not found, skipping patch.');
}
