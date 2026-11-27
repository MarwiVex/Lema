'use client';

/**
 * useLatexWasm — Hook para compilar LaTeX completamente en el navegador
 * usando texlyre-busytex (WASM, TeX Live 2026).
 *
 * Los assets WASM se sirven desde /public/core/busytex/.
 * El engine se inicializa una sola vez y se reutiliza.
 */

import { useState, useCallback } from 'react';
import type { LatexFileData } from './LatexProjectViewer';
import { base64ToUint8Array, uint8ArrayToBase64 } from '@/lib/base64';

export type WasmCompileStatus =
  | 'idle'
  | 'initializing'
  | 'compiling'
  | 'success'
  | 'error';

export interface WasmCompileResult {
  pdfBase64: string | null;
  pdfBytes: Uint8Array | null;
  log: string;
  error: string | null;
}

export interface WasmCompileOptions {
  forceRerun?: boolean;
}

// Singleton global del runner WASM para no crear múltiples Web Workers
// (~150-400MB RAM cada uno) al navegar entre proyectos LaTeX.
let sharedRunner: any = null;
let sharedRunnerInitPromise: Promise<any> | null = null;
let compileChain: Promise<unknown> = Promise.resolve();

function enqueueCompile<T>(task: () => Promise<T>): Promise<T> {
  const next = compileChain.then(task, task);
  compileChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function getOrCreateSharedRunner() {
  if (sharedRunner) return sharedRunner;
  if (sharedRunnerInitPromise) return sharedRunnerInitPromise;

  sharedRunnerInitPromise = (async () => {
    try {
      const { BusyTexRunner } = await import('texlyre-busytex');
      const runner = new BusyTexRunner({
        busytexBasePath: '/core/busytex',
        verbose: false,
        engineMode: 'combined',
        catalogDataPackages: [
          '/core/busytex/texlive-basic.js',
          '/core/busytex/texlive-recommended.js',
          '/core/busytex/texlive-extra.js',
        ],
      });
      // Use Web Worker so UI doesn't freeze during long compilations
      await runner.initialize(true);
      sharedRunner = runner;
      return runner;
    } catch (err) {
      sharedRunner = null;
      throw err;
    } finally {
      sharedRunnerInitPromise = null;
    }
  })();

  return sharedRunnerInitPromise;
}

const RERUN_LOG_REGEX = /Rerun to get|Label\(s\) may have changed|Table widths have changed|Please \(re\)run/i;

/**
 * Removes `pkgName` from `\usepackage{...}` declarations without breaking sibling packages
 * on comma-separated lines like `\usepackage{amsmath, mathpazo, amssymb}`.
 */
export function stripPackageFromLatex(source: string, pkgName: string): string {
  const usepackageRegex = /\\usepackage(\[[^\]]*\])?\{([^}]*)\}/g;
  return source.replace(usepackageRegex, (fullMatch, opts = '', pkgList: string) => {
    const pkgs = pkgList
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (!pkgs.includes(pkgName)) {
      return fullMatch;
    }
    const remaining = pkgs.filter((p) => p !== pkgName);
    if (remaining.length === 0) {
      return `% ${fullMatch} (omitido para compatibilidad WASM)`;
    }
    return `\\usepackage${opts || ''}{${remaining.join(', ')}}`;
  });
}

export function useLatexWasm() {
  const [status, setStatus] = useState<WasmCompileStatus>('idle');
  const [log, setLog] = useState('');
  const [error, setError] = useState<string | null>(null);

  const compile = useCallback(
    async (files: LatexFileData[], options?: WasmCompileOptions): Promise<WasmCompileResult> => {
      const mainFile = files.find((f) => f.isMain) ?? files[0];
      if (!mainFile) {
        const msg = 'No hay archivo principal (.tex) en el proyecto.';
        setError(msg);
        return { pdfBase64: null, pdfBytes: null, log: '', error: msg };
      }

      // Prepare text & binary files BEFORE touching or potentially terminating sharedRunner
      const additionalFiles = files
        .filter((f) => f.id !== mainFile.id && !f.isBinary)
        .map((f) => ({ path: f.filename, content: f.content }));

      let binaryFiles: { path: string; content: Uint8Array }[];
      try {
        binaryFiles = files
          .filter((f) => f.isBinary)
          .map((f) => ({
            path: f.filename,
            content: base64ToUint8Array(f.content),
          }));
      } catch (decodeErr: any) {
        const msg = `Archivo binario con Base64 inválido: ${decodeErr?.message || 'error de decodificación'}`;
        setError(msg);
        setStatus('error');
        return { pdfBase64: null, pdfBytes: null, log: '', error: msg };
      }

      return enqueueCompile(async () => {
        setError(null);
        setLog('');

        try {
          if (!sharedRunner) {
            setStatus('initializing');
          }
          const runner = await getOrCreateSharedRunner();

          setStatus('compiling');

          const { PdfLatex } = await import('texlyre-busytex');
          const pdflatex = new PdfLatex(runner);

          // Auto-sanitize LaTeX for WASM compatibility
          let sanitizedInput = mainFile.content.replace(/\\columnbreak/g, '\\newpage');
          sanitizedInput = stripPackageFromLatex(sanitizedInput, 'enumitem');
          sanitizedInput = sanitizedInput.replace(/\\begin\{(itemize|enumerate)\}\s*\[[^\]]*\]/g, '\\begin{$1}');
          sanitizedInput = sanitizedInput.replace(/\\setlist(?:\[[^\]]*\])?\{[^}]*\}/g, '% \\setlist unsupported');

          for (const pkg of ['mathpazo', 'psfrag']) {
            sanitizedInput = stripPackageFromLatex(sanitizedInput, pkg);
          }

          const forceRerun = Boolean(options?.forceRerun);
          const allAdditional = [...additionalFiles, ...binaryFiles];

          let result = await pdflatex.compile({
            input: sanitizedInput,
            additionalFiles: allAdditional,
            rerun: forceRerun,
            verbose: 'silent',
          });

          // Auto-heal: If compilation failed due to missing .sty files in WASM bundle, strip them (up to 3 passes)
          const healedPkgs = new Set<string>();
          for (let attempt = 0; attempt < 3; attempt++) {
            if ((result.pdf && result.pdf.length > 0) || !result.log) break;
            const missingPkgMatch = result.log.match(/File [`']([^`']+)\.sty['`] not found/i);
            const missingPkg = missingPkgMatch?.[1];
            if (!missingPkg || healedPkgs.has(missingPkg)) break;
            healedPkgs.add(missingPkg);

            console.warn(
              `[WASM Auto-Heal] Missing LaTeX package '${missingPkg}.sty' detected. Stripping and retrying...`
            );
            sanitizedInput = stripPackageFromLatex(sanitizedInput, missingPkg);
            result = await pdflatex.compile({
              input: sanitizedInput,
              additionalFiles: allAdditional,
              rerun: forceRerun,
              verbose: 'silent',
            });
          }

          // Conditional second pass only when LaTeX asks to rerun for cross-references / TOC
          if (!forceRerun && result.pdf && result.pdf.length > 0 && result.log && RERUN_LOG_REGEX.test(result.log)) {
            result = await pdflatex.compile({
              input: sanitizedInput,
              additionalFiles: allAdditional,
              rerun: false,
              verbose: 'silent',
            });
          }

          const compilationLog = result.log ?? '';
          setLog(compilationLog);

          if (!result.pdf || result.pdf.length === 0) {
            console.error('WASM Compilation Failed. Full Log:\n', result.log);
            const msg = result.log
              ? extractLatexError(result.log)
              : 'Compilación fallida — sin PDF generado.';
            setError(msg);
            setStatus('error');
            return { pdfBase64: null, pdfBytes: null, log: compilationLog, error: msg };
          }

          const pdfBytes = new Uint8Array(result.pdf);
          const pdfBase64 = uint8ArrayToBase64(pdfBytes);

          setStatus('success');
          return { pdfBase64, pdfBytes, log: compilationLog, error: null };
        } catch (e: any) {
          console.error('WASM Compilation Exception:', e);
          const msg = e?.message || 'Error inesperado durante la compilación WASM.';
          setError(msg);
          setStatus('error');
          setLog('');
          if (sharedRunner) {
            try {
              sharedRunner.terminate();
            } catch {}
            sharedRunner = null;
          }
          sharedRunnerInitPromise = null;
          return { pdfBase64: null, pdfBytes: null, log: '', error: msg };
        }
      });
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setLog('');
    setError(null);
  }, []);

  return { compile, status, log, error, reset };
}

function extractLatexError(log: string): string {
  const errorLines: string[] = [];
  const lines = log.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('!')) {
      errorLines.push(line);
      for (let j = 1; j <= 3 && i + j < lines.length; j++) {
        const ctx = lines[i + j].trim();
        if (ctx) errorLines.push(ctx);
      }
      if (errorLines.length >= 10) break;
    }
  }

  if (errorLines.length > 0) {
    return errorLines.join('\n');
  }

  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  if (nonEmptyLines.length > 0) {
    const lastLines = nonEmptyLines.slice(-5).join('\n');
    return `Error de compilación. Últimas líneas del log:\n${lastLines}`;
  }

  return 'Error de compilación — sin detalles en el log.';
}
