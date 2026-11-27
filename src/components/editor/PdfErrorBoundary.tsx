'use client';

import React from 'react';
import { AlertTriangle, Download, RotateCcw } from 'lucide-react';
import { base64ToBlob, triggerBlobDownload } from '@/lib/base64';

interface PdfErrorBoundaryProps {
  children: React.ReactNode;
  pdfBase64?: string | null;
  pdfBytes?: Uint8Array | null;
  pdfUrl?: string | null;
  title?: string;
}

interface PdfErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class PdfErrorBoundary extends React.Component<
  PdfErrorBoundaryProps,
  PdfErrorBoundaryState
> {
  constructor(props: PdfErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): PdfErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error inesperado al renderizar el visor PDF.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('[PdfErrorBoundary]', error);
  }

  componentDidUpdate(prevProps: PdfErrorBoundaryProps) {
    if (
      this.state.hasError &&
      (prevProps.pdfBase64 !== this.props.pdfBase64 ||
        prevProps.pdfBytes !== this.props.pdfBytes ||
        prevProps.pdfUrl !== this.props.pdfUrl)
    ) {
      this.setState({ hasError: false, errorMessage: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  handleDownload = () => {
    const { pdfBase64, pdfBytes, pdfUrl, title } = this.props;
    const safeName = (title || 'documento').replace(/[^a-z0-9_\-áéíóúñ ]/gi, '_').trim() || 'documento';

    if (pdfBytes && pdfBytes.length > 0) {
      triggerBlobDownload(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), `${safeName}.pdf`);
      return;
    }

    if (pdfBase64) {
      try {
        triggerBlobDownload(base64ToBlob(pdfBase64, 'application/pdf'), `${safeName}.pdf`);
      } catch (e) {
        console.error('[PdfErrorBoundary] Failed to download PDF:', e);
      }
      return;
    }

    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl.includes('?') ? `${pdfUrl}&download=1` : `${pdfUrl}?download=1`;
      a.download = `${safeName}.pdf`;
      a.click();
    }
  };

  render() {
    if (this.state.hasError) {
      const canDownload = Boolean(
        this.props.pdfBase64 ||
          (this.props.pdfBytes && this.props.pdfBytes.length > 0) ||
          this.props.pdfUrl
      );
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-canvas p-6 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500 dark:text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-ink-primary">
            No se pudo mostrar el visor PDF
          </h3>
          <p className="mb-5 max-w-md text-xs text-ink-secondary">
            {this.state.errorMessage || 'Ocurrió un error al renderizar el PDF. Tu código sigue intacto.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3.5 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-subtle cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reintentar
            </button>
            {canDownload && (
              <button
                type="button"
                onClick={this.handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar PDF
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PdfErrorBoundary;
