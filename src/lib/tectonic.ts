import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import fs from 'fs';

const execFileAsync = promisify(execFile);
const COMPILE_TIMEOUT_MS = 90_000;
const MAX_BUFFER_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_CONCURRENT_COMPILES = 2;

let activeCompiles = 0;
const compileWaiters: Array<() => void> = [];

async function acquireCompileSlot(): Promise<void> {
  if (activeCompiles < MAX_CONCURRENT_COMPILES) {
    activeCompiles += 1;
    return;
  }
  await new Promise<void>((resolve) => {
    compileWaiters.push(resolve);
  });
  activeCompiles += 1;
}

function releaseCompileSlot(): void {
  activeCompiles = Math.max(0, activeCompiles - 1);
  const next = compileWaiters.shift();
  if (next) next();
}

export interface TectonicFileInput {
  filename: string;
  content: string;
  isBinary?: boolean;
}

export interface CompileTectonicOptions {
  files: TectonicFileInput[];
  mainFilename: string;
  allowDocker?: boolean;
}

export type CompileTectonicResult =
  | { ok: true; pdfBuffer: Buffer }
  | { ok: false; error: string; details: string };

export function safeResolvePath(baseDir: string, relativePath: string): string {
  if (!relativePath || typeof relativePath !== 'string' || relativePath.includes('\0')) {
    throw new Error(`Invalid file path: ${String(relativePath)}`);
  }
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, relativePath);
  if (!resolvedTarget.startsWith(resolvedBase + path.sep)) {
    throw new Error(`Path traversal blocked: ${relativePath}`);
  }
  return resolvedTarget;
}

type RunResult =
  | { status: 'ok' }
  | { status: 'enoent'; details: string }
  | { status: 'spawn_error'; details: string }
  | { status: 'failed'; details: string };

async function runBinary(
  binary: string,
  args: string[],
  cwd: string,
  timeout: number,
  env?: NodeJS.ProcessEnv
): Promise<RunResult> {
  try {
    await execFileAsync(binary, args, {
      cwd,
      timeout,
      maxBuffer: MAX_BUFFER_BYTES,
      env,
    });
    return { status: 'ok' };
  } catch (e: any) {
    const details = e?.stderr || e?.stdout || e?.message || String(e);
    if (e?.code === 'ENOENT') {
      return { status: 'enoent', details };
    }
    if (
      typeof e?.code === 'string' ||
      e?.code === 3221225781 ||
      e?.code === -1073741515
    ) {
      return { status: 'spawn_error', details };
    }
    return { status: 'failed', details };
  }
}

async function extractLogErrors(logFilePath: string): Promise<string | null> {
  if (!fs.existsSync(logFilePath)) return null;
  try {
    const logContent = await readFile(logFilePath, 'utf8');
    const errorLines = logContent
      .split('\n')
      .filter((line) => line.startsWith('!') || line.toLowerCase().includes('error'))
      .slice(0, 15)
      .join('\n');
    return errorLines || null;
  } catch {
    return null;
  }
}

async function cleanupDir(dirPath: string) {
  if (!dirPath) return;
  try {
    await fs.promises.rm(dirPath, { recursive: true, force: true });
  } catch (e) {
    console.error('[tectonic] Failed to cleanup temp dir:', e);
  }
}

export async function compileLatexWithTectonic({
  files,
  mainFilename,
  allowDocker = false,
}: CompileTectonicOptions): Promise<CompileTectonicResult> {
  await acquireCompileSlot();
  let tmpDir = '';
  try {
    tmpDir = path.join(os.tmpdir(), `lema-compile-${crypto.randomBytes(8).toString('hex')}`);
    await mkdir(tmpDir, { recursive: true });

    for (const file of files) {
      const filePath = safeResolvePath(tmpDir, file.filename);
      await mkdir(path.dirname(filePath), { recursive: true });
      if (file.isBinary) {
        await writeFile(filePath, Buffer.from(file.content, 'base64'));
      } else {
        await writeFile(filePath, file.content, 'utf8');
      }
    }

    const mainFilePath = safeResolvePath(tmpDir, mainFilename);
    const pdfRelPath = /\.tex$/i.test(mainFilename)
      ? mainFilename.replace(/\.tex$/i, '.pdf')
      : `${mainFilename}.pdf`;
    const logRelPath = /\.tex$/i.test(mainFilename)
      ? mainFilename.replace(/\.tex$/i, '.log')
      : `${mainFilename}.log`;

    const pdfFilePath = safeResolvePath(tmpDir, pdfRelPath);
    const logFilePath = safeResolvePath(tmpDir, logRelPath);

    const tectonicCacheDir = path.join(os.tmpdir(), 'tectonic_cache');
    await mkdir(tectonicCacheDir, { recursive: true });

    const tectonicEnv: NodeJS.ProcessEnv = {
      ...process.env,
      TECTONIC_CACHE_DIR: tectonicCacheDir,
      HOME: tmpDir,
    };

    const localBinary =
      process.platform === 'win32'
        ? path.join(process.cwd(), 'bin', 'tectonic.exe')
        : path.join(process.cwd(), 'bin', 'tectonic');

    let compiled = false;
    let syntaxFailed = false;
    let lastErrorDetails = '';

    // Strategy A: Local binary in ./bin/
    if (fs.existsSync(localBinary)) {
      const res = await runBinary(
        localBinary,
        ['--keep-logs', mainFilePath],
        tmpDir,
        COMPILE_TIMEOUT_MS,
        tectonicEnv
      );
      if (res.status === 'ok') {
        compiled = true;
      } else if (res.status === 'failed') {
        syntaxFailed = true;
        lastErrorDetails = res.details;
      } else if (!lastErrorDetails) {
        lastErrorDetails = res.details;
      }
    }

    // Strategy B: System tectonic in PATH (if local binary wasn't present or couldn't spawn)
    if (!compiled && !syntaxFailed) {
      const res = await runBinary(
        'tectonic',
        ['--keep-logs', mainFilePath],
        tmpDir,
        COMPILE_TIMEOUT_MS,
        tectonicEnv
      );
      if (res.status === 'ok') {
        compiled = true;
      } else if (res.status === 'failed') {
        syntaxFailed = true;
        lastErrorDetails = res.details;
      } else if (!lastErrorDetails) {
        lastErrorDetails = res.details;
      }
    }

    // Strategy C: Docker fallback (only when binary is unavailable, never on LaTeX syntax errors)
    if (!compiled && !syntaxFailed && allowDocker) {
      const infoRes = await runBinary('docker', ['info'], tmpDir, 10_000);
      if (infoRes.status === 'ok') {
        const normalizedMain = mainFilename.replace(/\\/g, '/');
        const dockerRes = await runBinary(
          'docker',
          [
            'run',
            '--rm',
            '-v',
            `${tmpDir}:/app`,
            '-v',
            `${tectonicCacheDir}:/root/.cache/Tectonic`,
            '-e',
            'TECTONIC_CACHE_DIR=/root/.cache/Tectonic',
            '-w',
            '/app',
            'dxjoke/tectonic-docker',
            'tectonic',
            normalizedMain,
          ],
          tmpDir,
          120_000
        );
        if (dockerRes.status === 'ok') {
          compiled = true;
        } else if (dockerRes.status === 'failed') {
          syntaxFailed = true;
          lastErrorDetails = dockerRes.details;
        } else if (!lastErrorDetails) {
          lastErrorDetails = dockerRes.details;
        }
      } else if (!lastErrorDetails) {
        lastErrorDetails = infoRes.details;
      }
    }

    if (!compiled) {
      const logErrors = await extractLogErrors(logFilePath);
      if (logErrors) {
        lastErrorDetails =
          lastErrorDetails && lastErrorDetails !== logErrors
            ? `${lastErrorDetails}\n\n--- Extracto .log ---\n${logErrors}`
            : logErrors;
      }

      return {
        ok: false,
        error: syntaxFailed ? 'Error de compilación LaTeX' : 'Compilación de servidor no disponible',
        details:
          lastErrorDetails ||
          'No se pudo compilar el documento PDF. Verifica que Tectonic esté instalado o usa compilación WASM.',
      };
    }

    if (!fs.existsSync(pdfFilePath)) {
      return {
        ok: false,
        error: 'No se generó el PDF',
        details: lastErrorDetails || 'El proceso terminó sin generar el archivo PDF.',
      };
    }

    const pdfBuffer = await readFile(pdfFilePath);
    return { ok: true, pdfBuffer };
  } catch (error: any) {
    return {
      ok: false,
      error: 'Error al compilar LaTeX',
      details: error?.message || String(error),
    };
  } finally {
    if (tmpDir) {
      await cleanupDir(tmpDir);
    }
    releaseCompileSlot();
  }
}
