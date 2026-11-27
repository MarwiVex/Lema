'use client';

import { useState, useRef, useEffect, useId, useMemo } from 'react';
import { FileArchive, FileCode, Upload, X, Loader2, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { useLemaStore } from '@/store/useLemaStore';
import { useFolders } from '@/lib/useFolders';
import { buildFolderTree, flattenFolderTree } from '@/lib/folderTree';

interface ImportedLatexFile {
  filename: string;
  content: string;
  isBinary: boolean;
  isMain: boolean;
}

function isMacOsMetadataFile(name: string): boolean {
  const normalized = name.replace(/\\/g, '/');
  if (normalized.startsWith('__MACOSX/') || normalized.includes('/__MACOSX/')) return true;
  const base = normalized.split('/').pop() || normalized;
  return base === '.DS_Store' || base.startsWith('._');
}

export function ImportLatexModal() {
  const setShowLatexModal = useLemaStore((s) => s.setShowLatexModal);
  const activeFolderId = useLemaStore((s) => s.activeFolderId);
  const { folders, mutate } = useFolders();
  const flattenedFolders = useMemo(() => flattenFolderTree(buildFolderTree(folders)), [folders]);

  const titleInputId = useId();
  const folderSelectId = useId();
  const texSourceId = useId();
  const modalTitleId = useId();

  const [latexModalTab, setLatexModalTab] = useState<'tex' | 'zip' | 'files'>('tex');
  const [latexTitle, setLatexTitle] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string>(
    activeFolderId ?? folders[0]?.id ?? ''
  );
  const [latexTexSource, setLatexTexSource] = useState('');
  const [latexFiles, setLatexFiles] = useState<ImportedLatexFile[]>([]);
  const [isImportingLatex, setIsImportingLatex] = useState(false);
  const [latexImportError, setLatexImportError] = useState<string | null>(null);
  const [latexImportSuccess, setLatexImportSuccess] = useState(false);
  const [isDraggingZip, setIsDraggingZip] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const latexFileInputRef = useRef<HTMLInputElement>(null);
  const latexZipInputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!targetFolderId && folders.length > 0) {
      setTargetFolderId(activeFolderId ?? folders[0].id);
    }
  }, [activeFolderId, folders, targetFolderId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowLatexModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [setShowLatexModal]);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(((reader.result as string) || '').split(',')[1] || '');
      reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
      reader.readAsDataURL(file);
    });

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
      reader.readAsText(file);
    });

  const isBinaryFile = (filename: string) =>
    /\.(png|jpg|jpeg|gif|svg|eps|pdf|bmp|tiff|ps)$/i.test(filename);

  const processLooseFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setLatexImportError(null);
    try {
      const filtered = files.filter((f) => !isMacOsMetadataFile(f.name));
      const processed: ImportedLatexFile[] = await Promise.all(
        filtered.map(async (file) => {
          const binary = isBinaryFile(file.name);
          const content = binary ? await readFileAsBase64(file) : await readFileAsText(file);
          return {
            filename: file.name,
            content,
            isBinary: binary,
            isMain: false,
          };
        })
      );

      setLatexFiles((prev) => {
        const merged = [...prev];
        for (const f of processed) {
          if (!merged.find((m) => m.filename === f.filename)) merged.push(f);
        }
        if (!merged.some((m) => m.isMain)) {
          const firstTex = merged.find((m) => m.filename.toLowerCase().endsWith('.tex'));
          if (firstTex) firstTex.isMain = true;
        }
        return merged;
      });
    } catch (err: any) {
      setLatexImportError(`Error al leer archivos: ${err?.message || 'desconocido'}`);
    }
  };

  const handleLatexFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await processLooseFiles(files);
    if (e.target) e.target.value = '';
  };

  const processZipFile = async (file: File) => {
    setLatexImportError(null);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      const texFiles: string[] = [];
      const names = Object.keys(zip.files).filter(
        (n) => !zip.files[n].dir && !isMacOsMetadataFile(n)
      );

      const processed: ImportedLatexFile[] = await Promise.all(
        names.map(async (name) => {
          const zipFile = zip.files[name];
          const binary = isBinaryFile(name);
          const content = binary ? await zipFile.async('base64') : await zipFile.async('text');
          if (name.toLowerCase().endsWith('.tex')) {
            texFiles.push(name);
          }
          return { filename: name, content, isBinary: binary, isMain: false };
        })
      );

      const rootTex = texFiles.find((n) => !n.includes('/')) ?? texFiles[0];
      if (rootTex) {
        const idx = processed.findIndex((f) => f.filename === rootTex);
        if (idx >= 0) processed[idx].isMain = true;
      }

      setLatexFiles(processed);
      if (!latexTitle && file.name.toLowerCase().endsWith('.zip')) {
        setLatexTitle(file.name.replace(/\.zip$/i, ''));
      }
    } catch (err: any) {
      setLatexImportError(`Error al leer el ZIP: ${err.message}`);
    }
  };

  const handleZipSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processZipFile(file);
    if (e.target) e.target.value = '';
  };

  const handleSetMainFile = (index: number) => {
    setLatexFiles((prev) => prev.map((f, i) => ({ ...f, isMain: i === index })));
  };

  const handleRemoveFile = (index: number) => {
    setLatexFiles((prev) => {
      const next = prev.filter((_, j) => j !== index);
      if (!next.some((f) => f.isMain)) {
        const firstTex = next.find((f) => f.filename.toLowerCase().endsWith('.tex'));
        if (firstTex) firstTex.isMain = true;
      }
      return next;
    });
  };

  const handleImportLatexProject = async () => {
    if (isImportingLatex || latexImportSuccess) return;
    setIsImportingLatex(true);
    setLatexImportError(null);

    try {
      let files: ImportedLatexFile[] = [];

      if (latexModalTab === 'tex') {
        if (!latexTexSource.trim()) throw new Error('El código LaTeX no puede estar vacío.');
        files = [{ filename: 'main.tex', content: latexTexSource, isBinary: false, isMain: true }];
      } else {
        if (latexFiles.length === 0) throw new Error('Agrega al menos un archivo.');
        files = latexFiles;
      }

      if (!latexTitle.trim()) throw new Error('El título es requerido.');

      const resolvedFolderId = targetFolderId || activeFolderId || folders[0]?.id || null;
      if (!resolvedFolderId) {
        throw new Error('Selecciona o crea una materia primero.');
      }

      const res = await fetch('/api/latex-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: latexTitle.trim(),
          folderId: resolvedFolderId,
          files,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const createdProj = await res.json();
      setLatexImportSuccess(true);
      await mutate(
        (curr) =>
          (curr ?? folders).map((f) =>
            f.id === resolvedFolderId
              ? { ...f, latexProjects: [createdProj, ...(f.latexProjects || [])] }
              : f
          ),
        { revalidate: false }
      );
      closeTimerRef.current = setTimeout(() => {
        setShowLatexModal(false);
      }, 900);
    } catch (err: any) {
      setLatexImportError(err.message);
    } finally {
      setIsImportingLatex(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowLatexModal(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        className="bg-surface border border-border-strong rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-[fadeInScale_0.15s_ease-out]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <FileArchive className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 id={modalTitleId} className="font-bold text-ink-primary text-lg">
              Importar Proyecto LaTeX
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowLatexModal(false)}
            aria-label="Cerrar modal de importación"
            className="text-ink-muted hover:text-ink-primary transition-colors p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor={titleInputId} className="text-xs text-ink-secondary mb-1.5 block font-medium">
              Título del proyecto
            </label>
            <input
              id={titleInputId}
              type="text"
              value={latexTitle}
              onChange={(e) => setLatexTitle(e.target.value)}
              placeholder="Ej: Cálculo Vectorial — Apuntes 2026"
              className="w-full bg-surface-subtle/70 border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor={folderSelectId} className="text-xs text-ink-secondary mb-1.5 block font-medium">
              Materia destino
            </label>
            <select
              id={folderSelectId}
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              disabled={folders.length === 0}
              className="w-full bg-surface-subtle/70 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-amber-500 transition-colors"
            >
              {flattenedFolders.length === 0 ? (
                <option value="">Sin materias</option>
              ) : (
                flattenedFolders.map((entry) => (
                  <option key={entry.folder.id} value={entry.folder.id}>
                    {entry.pathLabel}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div role="tablist" aria-label="Método de importación" className="flex rounded-xl bg-surface-subtle/70 p-1 border border-border-subtle">
          {(['tex', 'zip', 'files'] as const).map((tab) => {
            const selected = latexModalTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  if (tab === latexModalTab) return;
                  setLatexModalTab(tab);
                  setLatexImportError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selected
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35'
                    : 'text-ink-secondary hover:text-ink-primary border border-transparent'
                }`}
              >
                {tab === 'tex' && (
                  <>
                    <FileCode className="w-3.5 h-3.5" /> Un solo .tex
                  </>
                )}
                {tab === 'zip' && (
                  <>
                    <FileArchive className="w-3.5 h-3.5" /> Subir .zip
                  </>
                )}
                {tab === 'files' && (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Archivos sueltos
                  </>
                )}
              </button>
            );
          })}
        </div>

        {latexModalTab === 'tex' && (
          <div>
            <label htmlFor={texSourceId} className="text-xs text-ink-secondary mb-1.5 block font-medium">
              Código LaTeX (main.tex)
            </label>
            <textarea
              id={texSourceId}
              value={latexTexSource}
              onChange={(e) => setLatexTexSource(e.target.value)}
              placeholder="Pega aquí el contenido de tu archivo .tex..."
              className="w-full bg-canvas border border-border-subtle rounded-xl px-4 py-3 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-amber-500 resize-none transition-colors"
              rows={12}
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-ink-muted">— o —</span>
              <label className="text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer transition-colors font-medium">
                Seleccionar archivo .tex
                <input
                  type="file"
                  accept=".tex"
                  className="hidden"
                  onChange={async (e) => {
                    const input = e.target;
                    const file = input.files?.[0];
                    if (file) {
                      try {
                        setLatexTexSource(await readFileAsText(file));
                        if (!latexTitle) setLatexTitle(file.name.replace(/\.tex$/i, ''));
                      } catch (err: any) {
                        setLatexImportError(err.message);
                      }
                    }
                    input.value = '';
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {latexModalTab === 'zip' && (
          <div>
            <div
              role="button"
              tabIndex={0}
              aria-label="Seleccionar o arrastrar archivo ZIP"
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                isDraggingZip
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-border-strong hover:border-amber-500/60'
              }`}
              onClick={() => latexZipInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  latexZipInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingZip(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingZip(false);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDraggingZip(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) await processZipFile(dropped);
              }}
            >
              <input ref={latexZipInputRef} type="file" accept=".zip" className="hidden" onChange={handleZipSelected} />
              <FileArchive className="w-10 h-10 text-ink-muted" />
              <p className="text-sm text-ink-secondary">
                Haz clic o arrastra tu archivo <span className="text-amber-600 dark:text-amber-400 font-semibold">.zip</span>
              </p>
              <p className="text-xs text-ink-muted">El ZIP se extrae automáticamente en el navegador</p>
              {latexFiles.length > 0 && (
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {latexFiles.length} archivo{latexFiles.length !== 1 ? 's' : ''} detectado
                  {latexFiles.length !== 1 ? 's' : ''}
                  {latexFiles.find((f) => f.isMain) && ` — principal: ${latexFiles.find((f) => f.isMain)?.filename}`}
                </div>
              )}
            </div>
          </div>
        )}

        {latexModalTab === 'files' && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Seleccionar o arrastrar archivos del proyecto"
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              isDraggingFiles
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-border-strong hover:border-amber-500/60'
            }`}
            onClick={() => latexFileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                latexFileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFiles(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingFiles(false);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDraggingFiles(false);
              const dropped = Array.from(e.dataTransfer.files ?? []);
              await processLooseFiles(dropped);
            }}
          >
            <input ref={latexFileInputRef} type="file" multiple className="hidden" onChange={handleLatexFilesSelected} />
            <Upload className="w-8 h-8 text-ink-muted" />
            <p className="text-sm text-ink-secondary">Haz clic o arrastra los archivos del proyecto</p>
            <p className="text-xs text-ink-muted">.tex, .sty, .cls, imágenes, etc.</p>
          </div>
        )}

        {(latexModalTab === 'files' || latexModalTab === 'zip') && latexFiles.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto border border-border-subtle rounded-xl p-2 bg-surface-subtle/40">
            {latexFiles.map((f, i) => (
              <div key={f.filename} className="flex items-center gap-2 text-xs text-ink-secondary py-1 px-2 rounded-lg hover:bg-surface">
                <FileCode className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="font-mono flex-1 truncate">{f.filename}</span>
                {!f.isBinary && (
                  <button
                    type="button"
                    onClick={() => handleSetMainFile(i)}
                    title={f.isMain ? 'Archivo principal' : 'Marcar como archivo principal'}
                    aria-label={f.isMain ? `${f.filename} es el archivo principal` : `Marcar ${f.filename} como principal`}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors shrink-0 cursor-pointer ${
                      f.isMain
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 font-semibold'
                        : 'text-ink-muted hover:text-amber-500'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    {f.isMain && <span>main</span>}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(i)}
                  aria-label={`Quitar ${f.filename}`}
                  className="text-ink-muted hover:text-red-500 shrink-0 p-0.5 cursor-pointer"
                  title="Quitar archivo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {latexImportError && (
          <div role="alert" className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2.5 border border-red-500/25">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {latexImportError}
          </div>
        )}
        {latexImportSuccess && (
          <div role="status" className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-500/10 rounded-xl px-3 py-2.5 border border-emerald-500/25">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            ¡Proyecto importado correctamente!
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowLatexModal(false)}
            className="px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImportLatexProject}
            disabled={isImportingLatex || latexImportSuccess || !latexTitle.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-amber-900/20 transition-all cursor-pointer"
          >
            {isImportingLatex ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isImportingLatex ? 'Importando...' : latexImportSuccess ? 'Importado' : 'Importar Proyecto'}
          </button>
        </div>
      </div>
    </div>
  );
}
