const fs = require('fs');

// Get the original file content from the commit before I broke it
const { execSync } = require('child_process');
execSync('git checkout 5964d0971235a1be4473c895f9ae4a64d3a64954 -- src/components/editor/LatexProjectViewer.tsx');

let code = fs.readFileSync('src/components/editor/LatexProjectViewer.tsx', 'utf8');

// 1. Add state for mobile
code = code.replace(
  'const addFileInputRef = useRef<HTMLInputElement>(null);',
  `const addFileInputRef = useRef<HTMLInputElement>(null);

  const [mobileTab, setMobileTab] = useState<'files' | 'editor' | 'pdf'>('pdf');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);`
);

// 2. We need to extract the render blocks. Let's do it by manipulating the JSX string.

// Sidebar replacement:
const sidebarStart = `      {/* ── Sidebar: File Explorer ─────────────────────────────────────────── */}\n      <Panel defaultSize={18} minSize={10} maxSize={40} className={\`flex flex-col min-w-0 bg-[#0e131f]/60 overflow-hidden transition-colors \${isDragging ? 'ring-2 ring-cyan-500 bg-cyan-950/20' : ''}\`}>\n`;
const sidebarEnd = `\n      </Panel>\n\n      <PanelResizeHandle`;

// Find what's between sidebarStart and sidebarEnd
let startIndex = code.indexOf(sidebarStart) + sidebarStart.length;
let endIndex = code.indexOf(sidebarEnd);
const sidebarContent = code.substring(startIndex, endIndex);

code = code.substring(0, startIndex) + `{renderSidebar()}` + code.substring(endIndex);
const renderSidebarFn = `  const renderSidebar = () => (\n${sidebarContent}\n  );\n\n`;

// Editor replacement:
const editorStart = `      {/* ── Center: Code Editor ────────────────────────────────────────────── */}\n      <Panel defaultSize={22} minSize={15} className="flex flex-col overflow-hidden min-w-0 bg-[#080b12]">\n`;
const editorEnd = `\n      </Panel>\n\n      <PanelResizeHandle`;

startIndex = code.indexOf(editorStart) + editorStart.length;
endIndex = code.indexOf(editorEnd, startIndex);
const editorContent = code.substring(startIndex, endIndex);

code = code.substring(0, startIndex) + `{renderEditor()}` + code.substring(endIndex);
const renderEditorFn = `  const renderEditor = () => (\n${editorContent}\n  );\n\n`;

// PDF replacement:
const pdfStart = `      {/* ── Right: PDF Preview ────────────────────────────────────────────── */}\n      <Panel defaultSize={60} minSize={20} className="flex flex-col min-w-0 bg-[#0e131f]/40 overflow-hidden relative">\n`;
const pdfEnd = `\n      </Panel>\n    </PanelGroup>\n  );`;

startIndex = code.indexOf(pdfStart) + pdfStart.length;
endIndex = code.indexOf(pdfEnd, startIndex);
const pdfContent = code.substring(startIndex, endIndex);

code = code.substring(0, startIndex) + `{renderPdf()}` + code.substring(endIndex);
const renderPdfFn = `  const renderPdf = () => (\n${pdfContent}\n  );\n\n`;

const mobileRender = `
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
`;

const insertIndex = code.indexOf('  return (\n    <PanelGroup');
code = code.substring(0, insertIndex) + renderSidebarFn + renderEditorFn + renderPdfFn + mobileRender + code.substring(insertIndex);

// Add Folder icon import to lucide-react if missing
if (!code.includes('Folder,')) {
  code = code.replace('FileImage,', 'FileImage, Folder,');
}

fs.writeFileSync('src/components/editor/LatexProjectViewer.tsx', code);
console.log('Successfully patched LatexProjectViewer.tsx');
