const fs = require('fs');

const path = './src/components/editor/LatexProjectViewer.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add mobileTab state and isMobile hook
const hookCode = `
  const [mobileTab, setMobileTab] = useState<'files' | 'editor' | 'pdf'>('pdf');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
`;

content = content.replace(
  'const addFileInputRef = useRef<HTMLInputElement>(null);',
  'const addFileInputRef = useRef<HTMLInputElement>(null);\n' + hookCode
);

// Find the return statement
const returnIndex = content.indexOf('return (');
const preReturn = content.slice(0, returnIndex);
const returnBlock = content.slice(returnIndex);

// Extract sidebar
const sidebarStart = returnBlock.indexOf('<div \n          className="h-full flex flex-col overflow-hidden"');
const sidebarEndStr = '      </Panel>';
const sidebarEnd = returnBlock.indexOf(sidebarEndStr, sidebarStart);
const sidebarContent = returnBlock.slice(sidebarStart, sidebarEnd).trim();

// Extract editor
const editorPanelStart = returnBlock.indexOf('<Panel defaultSize={22}');
const editorStart = returnBlock.indexOf('{selectedFile ? (', editorPanelStart);
const editorEndStr = '      </Panel>';
const editorEnd = returnBlock.indexOf(editorEndStr, editorStart);
const editorContent = returnBlock.slice(editorStart, editorEnd).trim();

// Extract pdf
const pdfPanelStart = returnBlock.indexOf('<Panel defaultSize={60}');
const pdfStart = returnBlock.indexOf('<div className="flex items-center justify-between px-4 py-2.5', pdfPanelStart);
const pdfEndStr = '      </Panel>';
const pdfEnd = returnBlock.indexOf(pdfEndStr, pdfStart);
const pdfContent = returnBlock.slice(pdfStart, pdfEnd).trim();

const newRender = `
  const renderSidebar = () => (
    ${sidebarContent}
  );

  const renderEditor = () => (
    ${editorContent}
  );

  const renderPdf = () => (
    <>
      ${pdfContent}
    </>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full bg-[#0a0d14]">
        <div className="flex-1 overflow-hidden flex flex-col">
          {mobileTab === 'files' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0e131f]/60">
              {renderSidebar()}
            </div>
          )}
          {mobileTab === 'editor' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#080b12]">
              {renderEditor()}
            </div>
          )}
          {mobileTab === 'pdf' && (
            <div className="flex-1 flex flex-col min-w-0 bg-[#0e131f]/40 relative overflow-hidden">
              {renderPdf()}
            </div>
          )}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="flex h-14 bg-slate-900 border-t border-slate-800 shrink-0 z-50">
          <button 
            onClick={() => setMobileTab('files')} 
            className={\`flex-1 flex flex-col items-center justify-center gap-1 \${mobileTab === 'files' ? 'text-cyan-400' : 'text-slate-500'}\`}
          >
            <Folder className="w-5 h-5" />
            <span className="text-[10px]">Archivos</span>
          </button>
          <button 
            onClick={() => setMobileTab('editor')} 
            className={\`flex-1 flex flex-col items-center justify-center gap-1 \${mobileTab === 'editor' ? 'text-cyan-400' : 'text-slate-500'}\`}
          >
            <FileCode className="w-5 h-5" />
            <span className="text-[10px]">Editor</span>
          </button>
          <button 
            onClick={() => setMobileTab('pdf')} 
            className={\`flex-1 flex flex-col items-center justify-center gap-1 \${mobileTab === 'pdf' ? 'text-cyan-400' : 'text-slate-500'}\`}
          >
            <FileImage className="w-5 h-5" />
            <span className="text-[10px]">Ver PDF</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <PanelGroup orientation="horizontal" className="flex h-full w-full overflow-hidden bg-[#0a0d14]">
      {/* ── Sidebar: File Explorer ─────────────────────────────────────────── */}
      <Panel defaultSize={18} minSize={10} maxSize={40} className={\`flex flex-col min-w-0 bg-[#0e131f]/60 overflow-hidden transition-colors \${isDragging ? 'ring-2 ring-cyan-500 bg-cyan-950/20' : ''}\`}>
        {renderSidebar()}
      </Panel>

      <PanelResizeHandle className="w-3 relative group cursor-col-resize z-10 flex justify-center items-center">
        <div className="w-0.5 h-full bg-slate-800 group-hover:bg-cyan-500 group-active:bg-cyan-500 transition-colors" />
      </PanelResizeHandle>

      {/* ── Center: Code Editor ────────────────────────────────────────────── */}
      <Panel defaultSize={22} minSize={15} className="flex flex-col overflow-hidden min-w-0 bg-[#080b12]">
        {renderEditor()}
      </Panel>

      <PanelResizeHandle className="w-3 relative group cursor-col-resize z-10 flex justify-center items-center">
        <div className="w-0.5 h-full bg-slate-800 group-hover:bg-cyan-500 group-active:bg-cyan-500 transition-colors" />
      </PanelResizeHandle>

      {/* ── Right: PDF Preview ────────────────────────────────────────────── */}
      <Panel defaultSize={60} minSize={20} className="flex flex-col min-w-0 bg-[#0e131f]/40 overflow-hidden relative">
        {renderPdf()}
      </Panel>
    </PanelGroup>
  );
}
`;

// Add Folder to lucide-react imports if it's missing
if (!content.includes('Folder,')) {
  content = content.replace('FileCode,', 'Folder,\n  FileCode,');
}
if (!content.includes('useEffect')) {
  content = content.replace('useState,', 'useState, useEffect,');
}

fs.writeFileSync(path, preReturn + newRender);
console.log('Refactored LatexProjectViewer.tsx successfully.');
