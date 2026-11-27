import './style.css';

// Importamos el contenido HTML crudo usando la característica ?raw de Vite
import introHtml from './content/intro.html?raw';
import ioControlHtml from './content/io-control.html?raw';
import arreglosHtml from './content/arreglos.html?raw';
import matricesHtml from './content/matrices.html?raw';
import pooHtml from './content/poo.html?raw';
import umlHtml from './content/uml.html?raw';
import pooAvanzadoHtml from './content/poo-avanzado.html?raw';
import excepcionesHtml from './content/excepciones.html?raw';
import archivosHtml from './content/archivos.html?raw';
import binariosHtml from './content/binarios.html?raw';
import interfacesHtml from './content/interfaces.html?raw';
import enumsHtml from './content/enums.html?raw';
import cloneHtml from './content/clone.html?raw';
import javafxHtml from './content/javafx.html?raw';
import javafxAvanzadoHtml from './content/javafx-avanzado.html?raw';
import propiedadesHtml from './content/propiedades.html?raw';
import bdFundamentosHtml from './content/bd-fundamentos.html?raw';
import bdHerramientasHtml from './content/bd-herramientas.html?raw';
import jdbcDaoHtml from './content/jdbc-dao.html?raw';
import reportesJasperHtml from './content/reportes-jasper.html?raw';
import reportesJasperBdHtml from './content/reportes-jasper-bd.html?raw';
import laboratorioHtml from './content/laboratorio.html?raw';

// Mapeo de contenidos
const contents = {
    'intro': introHtml,
    'io-control': ioControlHtml,
    'arreglos': arreglosHtml,
    'matrices': matricesHtml,
    'poo': pooHtml,
    'uml': umlHtml,
    'poo-avanzado': pooAvanzadoHtml,
    'excepciones': excepcionesHtml,
    'archivos': archivosHtml,
    'binarios': binariosHtml,
    'interfaces': interfacesHtml,
    'enums': enumsHtml,
    'clone': cloneHtml,
    'javafx': javafxHtml,
    'javafx-avanzado': javafxAvanzadoHtml,
    'propiedades': propiedadesHtml,
    'bd-fundamentos': bdFundamentosHtml,
    'bd-herramientas': bdHerramientasHtml,
    'jdbc-dao': jdbcDaoHtml,
    'reportes-jasper': reportesJasperHtml,
    'reportes-jasper-bd': reportesJasperBdHtml,
    'laboratorio': laboratorioHtml
};

// 1. Control de Pestañas
window.switchTab = function(tabId) {
    // Restablecer estilos de los botones en el sidebar
    document.querySelectorAll('.btn-tab').forEach(el => {
        el.classList.remove('active');
        if(!el.id.includes('laboratorio')) {
            el.classList.replace('text-blue-400', 'text-slate-300');
            el.classList.remove('font-bold');
        }
    });

    // Inyectar el contenido en el contenedor principal
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = contents[tabId];

    // Colorear el botón activo
    const btn = document.getElementById('tab-' + tabId);
    if(btn) {
        btn.classList.add('active');
        if(tabId !== 'laboratorio') {
            btn.classList.replace('text-slate-300', 'text-blue-400');
            btn.classList.add('font-bold');
        }
    }

    // Reiniciar resaltado de sintaxis después de inyectar el HTML
    if (window.hljs) {
        window.hljs.highlightAll();
    }

    // Si es la pestaña de UML, inicializar escuchadores y renderizado en vivo
    if (tabId === 'uml') {
        initUmlEditor();
    }
};

// 1b. Editor y Compilador UML en Vivo (PlantUML vía Kroki API)
let originalUmlCode = "";

function updateUmlDiagram() {
    const editor = document.getElementById('uml-editor');
    const img = document.getElementById('uml-diagram-img');
    const status = document.getElementById('uml-status');
    const loader = document.getElementById('uml-loading');
    
    if (!editor || !img) return;
    
    const code = editor.value;
    if (loader) loader.classList.remove('hidden');
    if (status) {
        status.textContent = 'Compilando...';
        status.className = 'text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono';
    }

    // Usamos el endpoint POST de Kroki con text/plain que no requiere compresión deflate previa
    const krokiPostUrl = 'https://kroki.io/plantuml/svg';

    fetch(krokiPostUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: code
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
    })
    .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;
        if (loader) loader.classList.add('hidden');
        if (status) {
            status.textContent = 'Actualizado';
            status.className = 'text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono';
        }
    })
    .catch(err => {
        if (loader) loader.classList.add('hidden');
        if (status) {
            status.textContent = 'Error de sintaxis';
            status.className = 'text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono';
        }
    });
}

let debounceTimer = null;
function initUmlEditor() {
    const editor = document.getElementById('uml-editor');
    if (!editor) return;
    
    if (!originalUmlCode) {
        originalUmlCode = editor.value;
    }

    updateUmlDiagram();

    editor.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateUmlDiagram, 400);
    });
}

window.resetUmlCode = function() {
    const editor = document.getElementById('uml-editor');
    if (editor && originalUmlCode) {
        editor.value = originalUmlCode;
        updateUmlDiagram();
    }
};

window.copyUmlCode = function() {
    const editor = document.getElementById('uml-editor');
    if (editor) {
        navigator.clipboard.writeText(editor.value).then(() => {
            showToast();
        });
    }
};

// 2. Control de Pistas del Laboratorio
window.toggleHint = function(hintId) {
    const hint = document.getElementById(hintId);
    if (hint.classList.contains('hidden')) {
        hint.classList.remove('hidden');
    } else {
        hint.classList.add('hidden');
    }
};

// 3. Copiar código al portapapeles y notificar
window.copyCode = function(buttonElement) {
    // Buscar el tag <code> que está al lado del botón pulsado
    const codeBlock = buttonElement.nextElementSibling.querySelector('code');
    const codeText = codeBlock.innerText;

    // API de Clipboard para copiar
    navigator.clipboard.writeText(codeText).then(() => {
        showToast();
    }).catch(err => {
        console.error('Error al intentar copiar al portapapeles: ', err);
        alert("No se pudo copiar automáticamente. Puedes seleccionar el texto y copiarlo manualmente.");
    });
};

// 4. Animación del mensaje flotante (Toast)
function showToast() {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// 5. Control del Widget del Compilador
window.toggleTerminal = function() {
    const terminal = document.getElementById('terminal-widget');
    const overlay = document.getElementById('terminal-overlay');
    const isClosed = terminal.classList.contains('translate-x-full');
    
    if (isClosed) {
        // Abrir
        terminal.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        // Timeout para permitir que el display:block se aplique antes de animar opacidad
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            overlay.classList.add('opacity-100');
        }, 10);
    } else {
        // Cerrar
        terminal.classList.add('translate-x-full');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        // Ocultar del DOM tras la animación
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    }
};

// Cargar la pestaña inicial al iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.switchTab('intro');
});
