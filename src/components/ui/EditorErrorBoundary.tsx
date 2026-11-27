'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class EditorErrorBoundary extends React.Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error inesperado al renderizar el editor.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('[EditorErrorBoundary]', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center bg-canvas p-6 text-center">
          <div className="mb-4 rounded-2xl bg-red-500/10 p-3.5 text-red-500 dark:text-red-400 border border-red-500/20">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-ink-primary">
            {this.props.title || 'Ocurrió un error en el editor'}
          </h3>
          <p className="mb-5 max-w-md text-xs text-ink-secondary">
            {this.state.errorMessage || 'Puedes reintentar cargar la vista o volver al inicio.'}
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
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;
