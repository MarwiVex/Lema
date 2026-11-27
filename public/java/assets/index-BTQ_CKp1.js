(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(t){if(t.ep)return;t.ep=!0;const r=n(t);fetch(t.href,r)}})();const m=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-1"></i></span>
    Variables y Hola Mundo
</h2>

<p class="text-slate-300 mb-6 text-sm leading-relaxed">
    Si vienes de C, Java te será muy familiar. Como un repaso súper rápido, todo en Java vive dentro de una <code>class</code> y arranca desde un método <code>public static void main(String[] args)</code>.
</p>

<h3 class="text-xl font-semibold text-blue-300 mb-3 mt-8">Impresión en Consola</h3>
<div class="code-wrapper mb-8">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">public class principal {
    public static void main(String[] args){
        System.out.print("Hola Mundo");     // Sin salto de línea
        System.out.println("Hola Mundo");   // Con salto de línea
        System.out.printf("Hola Mundo \\n"); // Formateado (Igual que C)

        System.err.println("Hola Error");   // Imprime un error (rojo en consola)
    }
}</code></pre>
</div>

<h3 class="text-xl font-semibold text-blue-300 mb-3 mt-8">Cadenas (Strings)</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">En Java ya no sufres con los arreglos de <code>char</code>. Existe el objeto <code>String</code> que se concatena fácilmente con el símbolo <code>+</code> o <code>+=</code>.</p>
<div class="code-wrapper mb-8">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">public class string {
    public static void main(String[] args){
        String Cadena = "Hola mundo";
        Cadena += " desde Java\\n";
        Cadena += " en clase de POO";
        System.out.println(Cadena);

        // Los char[] aún existen, pero se usan poco
        char arreglo[] = {'H', 'o', 'l', 'a'};
        System.out.println(arreglo);
    }
}</code></pre>
</div>

<h3 class="text-xl font-semibold text-blue-300 mb-3 mt-8">Datos Primitivos vs Wrappers</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Además de los primitivos que ya conoces (<code>int</code>, <code>float</code>), Java tiene envoltorios o "Wrappers" (<code>Integer</code>, <code>Float</code>). Hacen lo mismo pero incluyen funciones extra.
</p>
<div class="code-wrapper mb-8">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">public class datos {
    public static void main (String[] args){
        // Primitivos normales
        int iEdad = 89;
        float fCantidad = 15.5f; // ¡La 'f' es obligatoria en Java!
        double dValor = 3.1415;
        
        // Wrappers (inician con mayúscula)
        Integer Edad = 12;
        Float Cantidad = 1.5f;
        
        System.out.printf("Edades: %03d, %.2f, %f \\n", iEdad, fCantidad, dValor);
        
        // Función propia del Wrapper
        System.out.printf("%05f\\n", Edad.floatValue());
        
        // Condicional ternario idéntico a C
        System.out.print(Edad.compareTo(iEdad) < 0 ? "Edad es Menor" : "IEdad es Menor");
    }
}</code></pre>
</div>
`,u=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-2"></i></span>
    I/O, Control y Funciones
</h2>

<div class="highlight-box p-6 rounded-xl mb-8 mt-8">
    <h3 class="text-xl font-bold text-accent mb-2"><i class="fa-solid fa-box-open mr-2"></i>Scanner: La "Caja Negra"</h3>
    <p class="text-slate-300 text-sm leading-relaxed mb-4">
        Olvídate del <code>scanf</code>. En Java se utilizan <strong>Flujos de Datos (Streams)</strong> y clases para leer datos. 
        Como aún no dominas la Programación Orientada a Objetos, el profesor te indica usar <code>Scanner</code> como una <em>caja negra</em>: solo apréndete la sintaxis exacta, pon los datos que te pide, y obtén la respuesta. Magia.
    </p>
    <ul class="text-sm text-slate-300 list-disc list-inside space-y-1">
        <li><strong>Regla 1:</strong> Importar arriba: <code>import java.util.Scanner;</code></li>
        <li><strong>Regla 2:</strong> Instanciar: <code>Scanner leer = new Scanner(System.in);</code></li>
        <li><strong>Regla 3:</strong> Extraer valores: <code>leer.nextInt()</code>, <code>leer.next()</code>, etc.</li>
    </ul>
</div>

<div class="code-wrapper mb-10">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">import java.util.Scanner; // Importación OBLIGATORIA

public class pasevalores {
    public static void main(String[] args){
        // CAJA NEGRA: Crear el scanner
        Scanner leer = new Scanner(System.in);
        
        // Evita bugs visuales en la terminal con los 'Enters'
        leer.useDelimiter("\\n"); 

        System.out.print("Ingresa un numero entero: ");
        int dato = leer.nextInt(); // Lee entero de la consola
        System.out.println("Leiste: " + dato);
        
        System.out.print("Ingresa un texto continuo: ");
        String cadena = leer.next(); // Lee un string
        System.out.println("Leiste: " + cadena);
    }
}</code></pre>
</div>

<h3 class="text-2xl font-bold text-blue-300 mb-3 mt-10">Estructuras de Control (Repaso)</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Si sabes C, ya sabes esto. <code>if</code>, <code>for</code>, <code>while</code> y <code>do-while</code> operan idéntico. La única mejora brutal es que en Java el <code>switch</code> <strong>sí permite evaluar Strings</strong>.
</p>
<div class="code-wrapper mb-10">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">public class Estructuracontrol {
    public static void main(String[] args){
        int edad = 17;
        if (edad >= 18) System.out.println("Mayor");
        else System.out.println("Menor");

        // Switch evaluando STRINGS (Imposible en C nativo)
        String mes = "Enero";
        switch(mes){
            case "Enero":
                System.out.println("Primer mes (1)");
                break;
            case "Febrero":
                System.out.println("Segundo mes (2)");
                break;
        }

        // Bucle For idéntico
        System.out.print("For: ");
        for (int i=0; i<5; i++) System.out.print(i + " ");
        
        System.out.print("\\nWhile con Break: ");
        int cont = 0;
        while(true){
            if(cont > 3) break;
            System.out.print(cont + " ");
            cont++;
        }
    }
}</code></pre>
</div>

<h3 class="text-2xl font-bold text-blue-300 mb-3 mt-10">Funciones (Métodos)</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para hacer una función, simplemente métela en tu clase. Si vas a llamarla directamente desde tu <code>main</code> (que es <code>static</code>), tu función obligatoriamente <strong>debe ser static también</strong>.
</p>
<div class="code-wrapper mb-8">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">public class funciones {
    public static void main(String[] args){
        int resultado = suma(2, 3);
        System.out.println("Resultado: " + resultado);
    }

    // public: Todo el mundo la ve
    // static: Pertenece a la clase, se llama directo
    public static int suma(int a, int b){
        return a + b;
    }
}</code></pre>
</div>
`,b=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-3"></i></span>
    Arreglos (Arrays) y Memoria
</h2>

<div class="highlight-box p-6 rounded-xl mb-8 mt-8">
    <h3 class="text-xl font-bold text-accent mb-2"><i class="fa-solid fa-memory mr-2"></i>La Muerte de malloc() y free()</h3>
    <p class="text-slate-300 text-sm leading-relaxed">
        En Java olvídate de pedir memoria manualmente. Los arreglos siempre se guardan de forma dinámica usando la palabra reservada <code>new</code>. ¿Y cómo evitas fugas de memoria sin <code>free()</code>? 
        Java tiene un sistema llamado <strong>Recolector de Basura (Garbage Collector)</strong> que destruye automáticamente la memoria que ya no está en uso. ¡Una maravilla!
    </p>
</div>

<h3 class="text-2xl font-bold text-blue-300 mb-3">Sintaxis, .length y For-Each</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    A diferencia de C, donde un arreglo no sabe su propio tamaño, en Java todo arreglo tiene una propiedad mágica llamada <code>.length</code>. Además, te presentamos el bucle <strong>For-Each</strong>, que te permite recorrer todos los datos de golpe sin usar índices.
</p>

<div class="code-wrapper mb-8">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">public class arreglos {
    public static void main(String[] args){
        // Pedimos memoria en Heap para 3 enteros. 
        // ¡Nota!: Por defecto, Java los inicializa en 0 (no en basura)
        int[] datos = new int[3];
        
        datos[0] = 100;
        datos[1] = 200;
        datos[2] = 300;

        // 1. Recorrido Clásico usando .length
        System.out.println("--- Recorrido For Normal ---");
        for (int i=0; i < datos.length; i++){
            System.out.println("En indice " + i + " hay " + datos[i]);
        }

        // 2. El poderoso For-Each
        System.out.println("\\n--- Recorrido For-Each ---");
        // Se lee: "Por cada variable entera 'dato' dentro de 'datos'..."
        for (int dato : datos){
            System.out.println("Valor impreso: " + dato);
        }
    }
}</code></pre>
</div>
`,g=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-4"></i></span>
    Matrices y Copias
</h2>

<p class="text-slate-300 mb-6 text-base leading-relaxed">
    Llegamos al tema donde la mayoría tropieza. En Java, <strong>NO EXISTEN las matrices de verdad</strong>. Es decir, no reserva un cuadro perfecto en memoria. Lo que hace Java es crear <strong>"Arreglos que apuntan a otros arreglos"</strong> (Jagged Arrays o Arreglos Escalonados).
</p>

<h3 class="text-xl font-bold text-blue-300 mb-3">Construyendo una Matriz</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Instancias un arreglo "maestro" (las filas). Luego, a cada espacio de ese arreglo le insertas otro arreglo (las columnas). Esto permite que cada fila pueda tener un tamaño diferente.
</p>

<div class="code-wrapper mb-10">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-white/10 m-0"><code class="language-java">public class matriz {
    public static void main(String[] args){
        // Arreglo maestro de 3 filas. Columnas vacías.
        int[][] datos = new int[3][];
        
        // Instanciamos manualmente las columnas de CADA fila.
        datos[0] = new int[2];
        datos[1] = new int[2];
        datos[2] = new int[2];

        int cont = 1;
        // Llenado con for anidado usando .length
        for (int i=0; i < datos.length; i++){
            for (int j=0; j < datos[i].length; j++){
                datos[i][j] = cont++;
            }
        }

        // Impresión usando doble for-each
        for (int[] fila : datos){          // Extrae arreglos (filas)
            for(int dato : fila){          // Extrae enteros de cada fila
                System.out.print(dato + "\\t");
            }
            System.out.println();
        }
    }
}</code></pre>
</div>

<div class="border-t border-white/10 my-10"></div>

<h3 class="text-2xl font-bold text-rose-400 mb-3"><i class="fa-solid fa-triangle-exclamation mr-2"></i>El Peligro: La Copia Fantasma (Shallow Copy)</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Si tienes un arreglo de 1 dimensión y usas el método <code>.clone()</code>, hace una copia perfecta. Pero si tienes una matriz, <strong>¡es una trampa mortal!</strong> <br><br>
    Al hacer <code>matriz.clone()</code>, Java copia la estructura principal (las filas), pero <strong>NO duplica la memoria de las columnas internas</strong>. 
    Ambas matrices (original y copia) terminan compartiendo las mismas columnas en la RAM. Si alteras la copia, la original se muta mágicamente y tus datos colapsan.
</p>

<h3 class="text-2xl font-bold text-emerald-400 mb-3 mt-10"><i class="fa-solid fa-shield-halved mr-2"></i>Solución: La Copia Profunda (Deep Copy)</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para crear una copia verdaderamente independiente y aislada de todo, tienes que decirle a Java que asigne memoria nueva a cada fila y luego copiar los números <em>uno por uno</em> manualmente con un <code>for</code>. 
</p>

<div class="code-wrapper mb-10">
    <button class="copy-btn" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl shadow-lg border border-emerald-500/30 m-0"><code class="language-java">public class copiaprofunda {
    public static void main(String[] args){
        int[][] original = {{1, 2}, {3, 4}};
        
        // --- COPIA PROFUNDA A MANO ---
        // 1. Instanciamos el cascarón principal (Filas)
        int[][] copiaLimpia = new int[original.length][]; 
        
        for (int i = 0; i < original.length; i++) {
            // 2. Pedimos MEMORIA NUEVA para aislar la fila
            copiaLimpia[i] = new int[original[i].length];
            
            // 3. Copiamos el número celda a celda
            for (int j = 0; j < original[i].length; j++) {
                copiaLimpia[i][j] = original[i][j];
            }
        }
        
        // ¡PRUEBA DE AISLAMIENTO!
        copiaLimpia[0][0] = 999;
        System.out.println("En Original hay: " + original[0][0]); // Imprime 1
        System.out.println("En Copia Limpia hay: " + copiaLimpia[0][0]); // Imprime 999
    }
}</code></pre>
</div>
`,x=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-5"></i></span>
    Programación Orientada a Objetos (POO)
</h2>

<p class="text-slate-300 mb-6 text-base leading-relaxed">
    La Programación Orientada a Objetos (POO) es el paradigma principal en Java. Se basa en organizar el código modelando entidades del mundo real llamadas "objetos".
</p>

<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-8">Conceptos Fundamentales</h3>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <div class="bg-black/40 border border-white/5 p-5 rounded-xl border-l-4 border-l-blue-500 hover:bg-white/5 transition-colors">
        <h4 class="font-bold text-blue-400 mb-2">Clase</h4>
        <p class="text-sm text-slate-300">Plantilla o molde abstracto que define los atributos (datos/estado) y métodos (comportamientos) que compartirán los objetos creados a partir de ella.</p>
    </div>
    <div class="bg-black/40 border border-white/5 p-5 rounded-xl border-l-4 border-l-emerald-500 hover:bg-white/5 transition-colors">
        <h4 class="font-bold text-emerald-400 mb-2">Objeto</h4>
        <p class="text-sm text-slate-300">Unidad básica en POO que combina estado (variables) y comportamiento (funciones).</p>
    </div>
    <div class="bg-black/40 border border-white/5 p-5 rounded-xl border-l-4 border-l-purple-500 hover:bg-white/5 transition-colors">
        <h4 class="font-bold text-purple-400 mb-2">Instancia</h4>
        <p class="text-sm text-slate-300">La materialización concreta e individualizada en memoria de una clase. (Ocurre cuando utilizas la palabra reservada <code>new</code>).</p>
    </div>
    <div class="bg-black/40 border border-white/5 p-5 rounded-xl border-l-4 border-l-amber-500 hover:bg-white/5 transition-colors">
        <h4 class="font-bold text-amber-400 mb-2">Método</h4>
        <p class="text-sm text-slate-300">Subrutina o función definida dentro de una clase que opera sobre los datos del objeto o realiza una tarea específica.</p>
    </div>
</div>

<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-12">Los 4 Pilares de la POO</h3>
<div class="space-y-4 mb-10">
    <div class="glass p-5 rounded-xl relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
        <h4 class="font-bold text-blue-400 mb-1 flex items-center gap-2"><i class="fa-solid fa-eye-slash w-5 text-center"></i> Abstracción</h4>
        <p class="text-sm text-slate-300 ml-7">Proceso de modelar únicamente las características y comportamientos esenciales de una entidad del mundo real, omitiendo detalles irrelevantes de implementación.</p>
    </div>
    <div class="glass p-5 rounded-xl relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
        <h4 class="font-bold text-emerald-400 mb-1 flex items-center gap-2"><i class="fa-solid fa-box w-5 text-center"></i> Encapsulamiento</h4>
        <p class="text-sm text-slate-300 ml-7">Ocultamiento de los detalles internos del estado de un objeto, exponiendo solo interfaces públicas seguras para interactuar con él (control de acceso mediante modificadores como <code>private</code>, <code>protected</code>, <code>public</code>).</p>
    </div>
    <div class="glass p-5 rounded-xl relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-purple-400"></div>
        <h4 class="font-bold text-purple-400 mb-1 flex items-center gap-2"><i class="fa-solid fa-sitemap w-5 text-center"></i> Herencia</h4>
        <p class="text-sm text-slate-300 ml-7">Mecanismo que permite a una nueva clase (subclase) derivar atributos y métodos de una clase existente (superclase), promoviendo la reutilización de código.</p>
    </div>
    <div class="glass p-5 rounded-xl relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
        <h4 class="font-bold text-amber-400 mb-1 flex items-center gap-2"><i class="fa-solid fa-shapes w-5 text-center"></i> Polimorfismo</h4>
        <p class="text-sm text-slate-300 ml-7">Capacidad de tratar objetos de distintas subclases como instancias de una superclase común, permitiendo que un mismo método ejecute comportamientos diferentes según el objeto receptor (mediante <em>overriding</em> o <em>overloading</em>).</p>
    </div>
</div>

<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-12">Ejemplo Corregido en Java</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para que el programa sea ejecutable de forma estándar en Java, la firma del método <code>main</code> requiere <code>public static void main(String[] args)</code>, los identificadores de variables deben seguir las convenciones de <em>camelCase</em>, la sintaxis de invocar métodos exige paréntesis <code>()</code>, y el formato de los especificadores (<code>%d</code>, <code>%s</code>) debe coincidir rigurosamente con los tipos de datos.
</p>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 mt-6">
    <!-- Alumno.java -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-blue-300 text-sm"></i> Alumno.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">class Alumno {
    // Atributos de clase
    String nombre;
    int edad;
    int nua;

    // Métodos
    String imprimir() {
        return String.format("%d, %s, %d\\n", nua, nombre, edad);
    }

    void imprimirClase() {
        System.out.printf("%s, %d, %d\\n", nombre, edad, nua);
    }
}</code></pre>
    </div>

    <!-- Principal.java -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-emerald-300 text-sm"></i> Principal.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public class Principal {
    public static void main(String[] args) {
        // Creación e instanciación del objeto alumno1
        Alumno alumno1 = new Alumno();

        // Asignación de valores
        alumno1.edad = 18;
        alumno1.nombre = "Hola";
        alumno1.nua = 676767;

        // Invocación de métodos
        System.out.print(alumno1.imprimir());
        alumno1.imprimirClase();
    }
}</code></pre>
    </div>
</div>

<div class="mt-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl text-xs text-blue-200">
    <p><i class="fa-solid fa-circle-info text-blue-400 mr-2"></i><strong>Nota para compilar:</strong> En este ejemplo básico, ambas clases pueden ir en el mismo archivo para el compilador web, asegurándote que sólo la clase <code>Principal</code> tenga la palabra <code>public</code>.</p>
</div>

<!-- Nueva Sección: Importancia de Private y Public (Encapsulamiento Real y Validación) -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-14 flex items-center gap-3">
    <span class="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg text-lg"><i class="fa-solid fa-user-shield"></i></span>
    Importancia de <code>private</code> vs <code>public</code> (Encapsulamiento y Protección)
</h3>

<p class="text-slate-300 mb-6 text-base leading-relaxed">
    El verdadero objetivo del <strong>Encapsulamiento</strong> no es solo esconder código, sino <strong>garantizar la integridad de los datos</strong>. Al marcar un atributo como <code>private</code>, impedimos que cualquier código externo modifique el valor directamente sin pasar por nuestras reglas de negocio.
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="glass p-6 rounded-xl border-l-4 border-l-rose-500">
        <h4 class="font-bold text-rose-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation text-rose-400"></i> Con Atributos Públicos (Sin Control)
        </h4>
        <p class="text-sm text-slate-300 leading-relaxed">
            Si la variable <code>edad</code> fuera <code>public</code>, desde cualquier parte del programa podrían asignarle valores absurdos (por ejemplo: <code>alumno1.edad = -50;</code> o <code>alumno1.edad = 999;</code>). No existe ninguna barrera para evitar datos corruptos o imposibles.
        </p>
    </div>

    <div class="glass p-6 rounded-xl border-l-4 border-l-emerald-500">
        <h4 class="font-bold text-emerald-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-shield-halved text-emerald-400"></i> Con Atributos Privados y Setters (Con Protección)
        </h4>
        <p class="text-sm text-slate-300 leading-relaxed">
            Al definir <code>private int edad;</code>, forzamos el uso de un método setter (<code>setEdad(valor)</code>) donde definimos una <strong>condición de rango</strong>. Sin importar de dónde se intente modificar la edad, la clase rechazará valores fuera de la regla (ej. 15 a 100 años).
        </p>
    </div>
</div>

<!-- Ejemplo Completo Encapsulado -->
<h4 class="text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
    <i class="fa-solid fa-code text-blue-400"></i> Ejemplo Práctico: Validación de Rango con Getters y Setters
</h4>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Observa cómo la clase <code>Alumno</code> restringe sus atributos con <code>private</code> y expone métodos <code>public</code> (Getters y Setters) para leer y validar la información de manera segura:
</p>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 mt-4">
    <!-- Alumno.java con Encapsulamiento -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-blue-300 text-sm"></i> Alumno.java (Encapsulado)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public class Alumno {
    // Atributos PRIVADOS (Protegidos contra acceso directo)
    private String nombre;
    private int edad;
    private int nua;

    // Setters (Métodos para modificar datos con validación)
    public void setNombre(String valor) {
        this.nombre = valor;
    }

    public void setEdad(int valor) {
        // Regla de validación: La edad debe estar en un rango permitido (15 a 100 años)
        if (valor >= 15 && valor <= 100) {
            this.edad = valor;
        } else {
            System.out.println("⚠️ Error: La edad " + valor + " no está en el rango permitido (15-100). No se asignó.");
        }
    }

    public void setNUA(int valor) {
        this.nua = valor;
    }

    // Getters (Métodos públicos para leer valores)
    public String getNombre() {
        return this.nombre;
    }

    public int getEdad() {
        return this.edad;
    }

    public int getNUA() {
        return this.nua;
    }

    // Método de impresión
    public String imprimir() {
        return String.format("%d, %s, %d \\n", nua, nombre, edad);
    }
}</code></pre>
    </div>

    <!-- Principal.java -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-emerald-300 text-sm"></i> Principal.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public class Principal {
    public static void main(String[] args) {
        Alumno alumno1 = new Alumno();

        // 1. Asignaciones válidas usando Setters
        alumno1.setNombre("Juan");
        alumno1.setEdad(18); // Válido (dentro del rango 15-100)
        alumno1.setNUA(213232);

        System.out.print(alumno1.imprimir());

        // 2. Intento de asignación fuera de rango
        alumno1.setEdad(200); // ❌ Error de validación: Se rechaza el 200 y se conserva 18

        // 3. Intento de acceso directo si la variable fuera private
        // alumno1.edad = 250; ❌ Error de compilación: 'edad' tiene acceso privado en Alumno
    }
}</code></pre>
    </div>
</div>

<div class="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-200">
    <p><i class="fa-solid fa-circle-check text-emerald-400 mr-2"></i><strong>Punto Clave:</strong> Si los atributos fueran <code>public</code>, cualquier programador podría hacer <code>alumno1.edad = 250;</code> saltándose la condición. Con <code>private</code> y <code>setEdad()</code>, aseguramos que la regla de negocio se cumpla SIEMPRE, sin importar desde dónde se invoque.</p>
</div>

`,f=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-purple-500/20 text-purple-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-diagram-project"></i></span>
    Diagramas UML, Herencia y Editor Interactivo
</h2>

<p class="text-slate-300 mb-6 text-base leading-relaxed">
    Los diagramas de clases <strong>UML (Unified Modeling Language)</strong> son una representación visual del diseño orientado a objetos de un sistema. Nos permiten planificar la estructura de clases, sus atributos, métodos y las relaciones entre ellas antes o durante la programación.
</p>

<!-- Explicación de la Herencia y UML -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-sitemap text-purple-400"></i> Explicación de la Herencia y este Diagrama
</h3>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="glass p-6 rounded-xl border-l-4 border-l-purple-500">
        <h4 class="font-bold text-purple-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-layer-group"></i> Superclase (Clase Padre): <code>Electronico</code>
        </h4>
        <p class="text-sm text-slate-300 leading-relaxed mb-3">
            Es la clase general que engloba los atributos y comportamientos comunes a todos los dispositivos electrónicos (<code>NS</code>, <code>SKU</code>, <code>Marca</code>, <code>Modelo</code>, <code>Precio</code> y sus respectivos Getters/Setters).
        </p>
        <div class="bg-purple-950/40 p-3 rounded-lg border border-purple-500/20 text-xs text-purple-200">
            <i class="fa-solid fa-circle-info mr-1"></i> Evita la duplicación de código compartiendo estas propiedades con sus clases hijas.
        </div>
    </div>

    <div class="glass p-6 rounded-xl border-l-4 border-l-blue-500">
        <h4 class="font-bold text-blue-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-code-branch"></i> Subclases (Clases Hijas): <code>Television</code>, <code>Estereo</code>, <code>Consola</code>
        </h4>
        <p class="text-sm text-slate-300 leading-relaxed mb-3">
            Heredan <strong>automáticamente</strong> todos los atributos y métodos de <code>Electronico</code> usando la palabra clave <code>extends</code> en Java, e introducen sus propios atributos específicos (ej. <code>Pulgadas</code> en <code>Television</code>, <code>Potencia</code> en <code>Estereo</code>, <code>Capacidad</code> en <code>Consola</code>).
        </p>
        <div class="bg-blue-950/40 p-3 rounded-lg border border-blue-500/20 text-xs text-blue-200">
            <i class="fa-solid fa-arrow-up mr-1"></i> Sintaxis PlantUML: <code>Electronico &lt;|-- Television</code> representa la flecha de herencia (generalización).
        </div>
    </div>
</div>

<!-- Nomenclatura UML -->
<div class="glass p-5 rounded-xl mb-10 border border-white/10">
    <h4 class="font-bold text-slate-200 mb-3 flex items-center gap-2">
        <i class="fa-solid fa-key text-amber-400"></i> Simbología de Visibilidad en UML
    </h4>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div class="bg-black/40 p-3 rounded-lg border border-white/5">
            <span class="text-rose-400 font-bold text-sm mr-2">-</span> <strong>Privado (private):</strong> Accesible solo dentro de la misma clase.
        </div>
        <div class="bg-black/40 p-3 rounded-lg border border-white/5">
            <span class="text-emerald-400 font-bold text-sm mr-2">+</span> <strong>Público (public):</strong> Accesible desde cualquier lugar del programa.
        </div>
        <div class="bg-black/40 p-3 rounded-lg border border-white/5">
            <span class="text-amber-400 font-bold text-sm mr-2">#</span> <strong>Protegido (protected):</strong> Accesible en el paquete y por subclases.
        </div>
    </div>
</div>

<!-- Compilador / Editor Interactivo de Diagramas UML -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-12 flex items-center gap-2">
    <i class="fa-solid fa-pen-to-square text-emerald-400"></i> Compilador y Editor UML en Vivo
</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Edita la sintaxis PlantUML en el panel izquierdo. El diagrama se renderizará automáticamente en tiempo real en el visualizador interactivo.
</p>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Editor PlantUML -->
    <div class="flex flex-col glass rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <div class="bg-[#0f172a] px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span class="text-xs font-mono font-bold text-purple-400 flex items-center gap-2">
                <i class="fa-solid fa-code"></i> Código PlantUML
            </span>
            <div class="flex items-center gap-2">
                <button onclick="resetUmlCode()" class="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded transition-colors" title="Restaurar código original">
                    <i class="fa-solid fa-rotate-left mr-1"></i> Reset
                </button>
                <button onclick="copyUmlCode()" class="text-xs bg-purple-600/80 hover:bg-purple-500 text-white px-2.5 py-1 rounded transition-colors font-semibold">
                    <i class="fa-regular fa-copy mr-1"></i> Copiar
                </button>
            </div>
        </div>
        <textarea id="uml-editor" class="w-full h-96 p-4 bg-[#090d16] text-purple-200 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none custom-scrollbar shadow-inner">@startuml

class Electronico {
  - NS : String
  - SKU : String
  - Marca : String
  - Modelo : String
  - Precio : Float
  
  + setNS(String): void
  + getNS(): String
  + setMarca(String): void
  + getMarca(): String
  + setModelo(String): void
  + getModelo(): String
  + setSKU(String): void
  + getSKU(): String
  + setPrecio(Float): void
  + getPrecio(): Float
}

class Television {
  - Pulgadas : Float
  - Tipo : String
  
  + setPulgadas(Float): void
  + getPulgadas(): Float
  + setTipo(String): void
  + getTipo(): String
}

class Estereo {
  - Potencia : Integer
  
  + setPotencia(Integer): void
  + getPotencia(): Integer
}

class Consola {
  - Tipo : String
  - Capacidad : Integer
  
  + setTipo(String): void
  + getTipo(): String
  + setCapacidad(Integer): void
  + getCapacidad(): Integer
}

Electronico <|-- Television
Electronico <|-- Estereo
Electronico <|-- Consola

@enduml</textarea>
    </div>

    <!-- Visualizador de Diagrama -->
    <div class="flex flex-col glass rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <div class="bg-[#0f172a] px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span class="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                <i class="fa-solid fa-eye"></i> Renderizado UML (Kroki API)
            </span>
            <span id="uml-status" class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Actualizado</span>
        </div>
        <div class="w-full h-96 bg-[#0d1322] p-4 flex items-center justify-center overflow-auto custom-scrollbar relative">
            <img id="uml-diagram-img" class="max-w-none transition-opacity duration-300" alt="Diagrama UML Renderizado" />
            <div id="uml-loading" class="absolute inset-0 bg-[#0d1322]/80 backdrop-blur-xs flex items-center justify-center hidden">
                <i class="fa-solid fa-circle-notch fa-spin text-purple-400 text-3xl"></i>
            </div>
        </div>
    </div>
</div>

<!-- Código Java Resultante Generado -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-12 flex items-center gap-2">
    <i class="fa-brands fa-java text-blue-400"></i> Código Java Equivalente de este Diagrama
</h3>
<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Así se traduce la jerarquía del diagrama UML a código Java real compilable:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> JerarquiaElectronicos.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">// Superclase
class Electronico {
    private String NS;
    private String SKU;
    private String Marca;
    private String Modelo;
    private float Precio;

    public void setNS(String NS) { this.NS = NS; }
    public String getNS() { return this.NS; }
    public void setMarca(String Marca) { this.Marca = Marca; }
    public String getMarca() { return this.Marca; }
    public void setModelo(String Modelo) { this.Modelo = Modelo; }
    public String getModelo() { return this.Modelo; }
    public void setSKU(String SKU) { this.SKU = SKU; }
    public String getSKU() { return this.SKU; }
    public void setPrecio(float Precio) { this.Precio = Precio; }
    public float getPrecio() { return this.Precio; }
}

// Subclase 1: Television (Hereda de Electronico)
class Television extends Electronico {
    private float Pulgadas;
    private String Tipo;

    public void setPulgadas(float Pulgadas) { this.Pulgadas = Pulgadas; }
    public float getPulgadas() { return this.Pulgadas; }
    public void setTipo(String Tipo) { this.Tipo = Tipo; }
    public String getTipo() { return this.Tipo; }
}

// Subclase 2: Estereo (Hereda de Electronico)
class Estereo extends Electronico {
    private int Potencia;

    public void setPotencia(int Potencia) { this.Potencia = Potencia; }
    public int getPotencia() { return this.Potencia; }
}

// Subclase 3: Consola (Hereda de Electronico)
class Consola extends Electronico {
    private String Tipo;
    private int Capacidad;

    public void setTipo(String Tipo) { this.Tipo = Tipo; }
    public String getTipo() { return this.Tipo; }
    public void setCapacidad(int Capacidad) { this.Capacidad = Capacidad; }
    public int getCapacidad() { return this.Capacidad; }
}

public class Main {
    public static void main(String[] args) {
        Television tv = new Television();
        tv.setMarca("Samsung");
        tv.setModelo("Neo QLED");
        tv.setPulgadas(65.0f);
        tv.setPrecio(1200.50f);

        System.out.println("TV Marca: " + tv.getMarca() + " | Modelo: " + tv.getModelo() + " | Pulgadas: " + tv.getPulgadas());
    }
}</code></pre>
</div>
`,v=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-layer-group"></i></span>
    POO Avanzado: Herencia, Polimorfismo, Casteo y Estructuras en Memoria
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    Esta guía profundiza en los pilares fundamentales de la Programación Orientada a Objetos en Java. Analizaremos en detalle cómo funciona la herencia mediante <code>extends</code>, el mecanismo interno del polimorfismo y el casteo (<em>Upcasting</em> y <em>Downcasting</em>), el peligro del ocultamiento de variables (<em>Shadowing</em>), y la diferencia en memoria entre <code>LinkedList</code> y arreglos tradicionales.
</p>

<!-- 1. LA PALABRA CLAVE EXTENDS Y LA HERENCIA -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-diagram-project text-blue-400"></i> 1. Herencia en Java: La palabra clave <code>extends</code>
</h3>

<div class="glass p-6 rounded-xl border-l-4 border-l-blue-500 mb-6">
    <h4 class="font-bold text-lg text-blue-300 mb-2">¿Qué hace exactamente <code>extends</code>?</h4>
    <p class="text-sm text-slate-300 leading-relaxed mb-4">
        La palabra clave <code>extends</code> establece una relación de <strong>Herencia</strong> entre dos clases, creando una jerarquía de tipo <strong>"Es Un" (Is-A)</strong>. 
        Por ejemplo: <code>public class Televisor extends Electronico</code> significa que un <code>Televisor</code> <strong>es un</strong> <code>Electronico</code>.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div class="bg-black/40 p-4 rounded-lg border border-white/10">
            <span class="text-blue-400 font-bold block mb-2">// Clase Padre (Superclase)</span>
            <span class="text-slate-300">public class Electronico {</span><br>
            <span class="text-slate-400 pl-4">protected String marca;</span><br>
            <span class="text-slate-400 pl-4">protected Float precio;</span><br>
            <span class="text-slate-300">}</span>
        </div>
        <div class="bg-black/40 p-4 rounded-lg border border-emerald-500/30">
            <span class="text-emerald-400 font-bold block mb-2">// Clase Hija (Subclase)</span>
            <span class="text-slate-300">public class Televisor extends Electronico {</span><br>
            <span class="text-slate-400 pl-4">// Hereda marca y precio automáticamente</span><br>
            <span class="text-emerald-400 pl-4">private Float pulgadas; // Atributo exclusivo</span><br>
            <span class="text-slate-300">}</span>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div class="glass p-5 rounded-xl border border-white/10">
        <h5 class="font-bold text-amber-400 mb-2 text-sm"><i class="fa-solid fa-memory"></i> Asignación en Memoria</h5>
        <p class="text-xs text-slate-300 leading-relaxed">
            Al hacer <code>new Televisor()</code>, Java reserva un bloque de memoria en el <strong>Heap</strong> que contiene los campos del padre (<code>ns</code>, <code>marca</code>, <code>modelo</code>, <code>precio</code>) <strong>MÁS</strong> los campos de la clase hija (<code>pulgadas</code>, <code>tipo</code>).
        </p>
    </div>
    <div class="glass p-5 rounded-xl border border-white/10">
        <h5 class="font-bold text-cyan-400 mb-2 text-sm"><i class="fa-solid fa-shield-halved"></i> Modificador <code>protected</code></h5>
        <p class="text-xs text-slate-300 leading-relaxed">
            Permite que los atributos de la superclase sean accesibles directamente por las clases hijas (y clases dentro del mismo paquete), pero manteniéndose protegidos contra accesos no autorizados desde paquetes externos.
        </p>
    </div>
    <div class="glass p-5 rounded-xl border border-white/10">
        <h5 class="font-bold text-purple-400 mb-2 text-sm"><i class="fa-solid fa-ban"></i> Herencia Única</h5>
        <p class="text-xs text-slate-300 leading-relaxed">
            En Java <strong>NO existe herencia múltiple de clases</strong>. Una clase solo puede extender de <code>una</code> superclase. Esto previene la ambigüedad del "Problema del Diamante".
        </p>
    </div>
</div>

<!-- 2. POLIMORFISMO Y CASTEO -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-shuffle text-purple-400"></i> 2. Polimorfismo, Casteo (Upcasting / Downcasting) e <code>instanceof</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    El <strong>Polimorfismo</strong> permite tratar objetos de distintas subclases (<code>Televisor</code>, <code>Videojuego</code>) a través de un tipo genérico común (<code>Electronico</code>).
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <!-- Upcasting -->
    <div class="glass p-6 rounded-xl border-l-4 border-l-emerald-500">
        <h4 class="font-bold text-emerald-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-arrow-up text-emerald-400"></i> Upcasting (Conversión Implícita)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Es la conversión de una subclase a su superclase. Es <strong>100% segura y automática</strong>.
        </p>
        <div class="bg-black/50 p-3 rounded font-mono text-xs text-slate-300">
            Electronico e1 = new Televisor(); <span class="text-slate-500">// Válido</span><br>
            LinkedList&lt;Electronico&gt; lista = new LinkedList&lt;&gt;();<br>
            lista.add(new Videojuego()); <span class="text-slate-500">// Upcasting automático</span>
        </div>
        <p class="text-xs text-amber-300/90 mt-2">
            <i class="fa-solid fa-circle-info mr-1"></i> <strong>Limitación:</strong> A través de la variable <code>e1</code> (tipo Electronico), solo puedes invocar métodos definidos en <code>Electronico</code>. No puedes llamar a <code>setPulgadas()</code> directamente.
        </p>
    </div>

    <!-- Downcasting -->
    <div class="glass p-6 rounded-xl border-l-4 border-l-rose-500">
        <h4 class="font-bold text-rose-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-arrow-down text-rose-400"></i> Downcasting (Conversión Explícita)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Es recuperar el tipo específico de la clase hija a partir de una referencia del padre. Requiere un casteo manual <code>(TipoHijo)</code>.
        </p>
        <div class="bg-black/50 p-3 rounded font-mono text-xs text-slate-300">
            Electronico e1 = lista.get(0);<br>
            <span class="text-rose-300 font-bold">Televisor t = (Televisor) e1;</span> <span class="text-slate-500">// Casteo explícito</span><br>
            t.setPulgadas(55f); <span class="text-slate-500">// ¡Ahora sí es accesible!</span>
        </div>
        <p class="text-xs text-rose-300 mt-2">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i> <strong>Peligro:</strong> Si <code>e1</code> en realidad fuera un <code>Videojuego</code>, la JVM lanzará un error fatal: <code>ClassCastException</code>.
        </p>
    </div>
</div>

<!-- Operador instanceof -->
<div class="glass p-6 rounded-xl border border-purple-500/30 mb-8">
    <h4 class="font-bold text-purple-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-shield-cat text-purple-400"></i> Validación Segura con <code>instanceof</code>
    </h4>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
        Antes de realizar un <em>Downcasting</em>, se debe verificar si el objeto en memoria pertenece a la clase requerida usando el operador <code>instanceof</code>.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <span class="text-xs font-bold text-slate-400 block mb-1">Forma Tradicional:</span>
            <div class="code-wrapper relative pt-2">
                <pre class="rounded-lg bg-black/60 p-3 text-xs"><code class="language-java">if (electronico instanceof Televisor) {
    Televisor tele = (Televisor) electronico;
    tele.setPulgadas(55f);
}</code></pre>
            </div>
        </div>
        <div>
            <span class="text-xs font-bold text-emerald-400 block mb-1">Forma Moderna (Pattern Matching - Java 16+):</span>
            <div class="code-wrapper relative pt-2">
                <pre class="rounded-lg bg-black/60 p-3 text-xs"><code class="language-java">// Castea y asigna la variable en un solo paso
if (electronico instanceof Televisor tele) {
    tele.setPulgadas(55f);
}</code></pre>
            </div>
        </div>
    </div>
</div>

<!-- 3. OCULTAMIENTO DE VARIABLES (SHADOWING) -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-mask text-amber-400"></i> 3. Ocultamiento de Variables (Shadowing) vs Sobrescritura
</h3>

<div class="glass p-6 rounded-xl border-l-4 border-l-amber-500 mb-8">
    <h4 class="font-bold text-amber-400 mb-2 text-base">El Error de Redeclarar Atributos en las Clases Hijas</h4>
    <p class="text-sm text-slate-300 leading-relaxed mb-4">
        Analicemos el siguiente error detectado en la clase <code>Videojuego</code> de tu código original:
    </p>
    <div class="bg-black/50 p-4 rounded-lg font-mono text-xs text-slate-300 mb-4 border border-rose-500/30">
        <span class="text-slate-400">public class Electronico { protected Float Precio; }</span><br><br>
        <span class="text-slate-400">public class Videojuego extends Electronico {</span><br>
        <span class="text-rose-400 font-bold pl-4">private Float Precio; // &#10007; ¡ERROR DE DISEÑO! (Shadowing)</span><br>
        <span class="text-slate-400 pl-4">private Integer Capacidad;</span><br>
        <span class="text-slate-400">}</span>
    </div>
    <div class="space-y-2 text-xs text-slate-300">
        <p class="flex items-start gap-2">
            <span class="text-amber-400 font-bold">•</span>
            <span><strong>¿Qué sucede físicamente?</strong> Java crea <strong>dos variables distintas en memoria</strong> para el mismo objeto: <code>super.Precio</code> (heredada del padre) y <code>this.Precio</code> (declarada en el hijo).</span>
        </p>
        <p class="flex items-start gap-2">
            <span class="text-amber-400 font-bold">•</span>
            <span><strong>¿Por qué rompe el programa?</strong> Si ejecutas <code>electronico.setPrecio(100f)</code> desde una referencia de tipo <code>Electronico</code>, se modificará el <code>Precio</code> del padre. Pero los métodos propios de <code>Videojuego</code> accederán al <code>Precio</code> del hijo (que seguirá valiendo <code>null</code>).</span>
        </p>
        <p class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">•</span>
            <span><strong>Regla de Oro:</strong> NUNCA vuelvas a declarar en una clase hija un atributo que ya heredaste del padre. Simplemente usa los campos del padre.</span>
        </p>
    </div>
</div>

<!-- 4. LINKEDLIST VS ARREGLOS EN MEMORIA -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-memory text-emerald-400"></i> 4. LinkedList vs Arreglos en Memoria y Rendimiento
</h3>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="glass p-6 rounded-xl border-l-4 border-l-emerald-500">
        <h4 class="font-bold text-emerald-400 mb-2">Arreglos Tradicionales / ArrayList</h4>
        <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li>• Memoria reservada en un <strong>bloque contiguo</strong>.</li>
            <li>• <strong>Acceso por índice:</strong> Complejidad <strong>O(1)</strong> (inmediato por fórmula matemática de dirección offset).</li>
            <li>• <strong>Inserción / Eliminación:</strong> Costosa <strong>O(N)</strong> porque requiere desplazar los demás elementos.</li>
        </ul>
    </div>

    <div class="glass p-6 rounded-xl border-l-4 border-l-rose-500">
        <h4 class="font-bold text-rose-400 mb-2">LinkedList (Lista Enlazada Doble)</h4>
        <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li>• Elementos (Nodos) <strong>dispersos en la memoria Heap</strong> enlazados con punteros <code>next</code> y <code>prev</code>.</li>
            <li>• <strong>Acceso por índice:</strong> Complejidad <strong>O(N)</strong>. Para leer la posición 5, Java debe iterar desde el inicio (o final) pasando por los nodos 0 &rarr; 1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5.</li>
            <li>• <strong>Inserción / Eliminación en los extremos:</strong> Muy veloz <strong>O(1)</strong> (solo se cambian los enlaces/punteros).</li>
        </ul>
    </div>
</div>

<div class="glass p-5 rounded-xl border border-amber-500/30 mb-8">
    <h4 class="font-bold text-amber-300 mb-2 text-sm flex items-center gap-2">
        <i class="fa-solid fa-bolt"></i> Antipatrón de Rendimiento Frecuente
    </h4>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
        En tu código inicial hacías esto:
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        <div class="bg-black/50 p-3 rounded border border-rose-500/30">
            <span class="text-rose-400 font-bold block mb-1">Ineficiente (Múltiples recorridos O(N)):</span>
            electronicos.get(0).setMarca("Samsung");<br>
            electronicos.get(0).setModelo("QLED");<br>
            electronicos.get(0).setNS("SN123");
        </div>
        <div class="bg-black/50 p-3 rounded border border-emerald-500/30">
            <span class="text-emerald-400 font-bold block mb-1">Eficiente (Extracción única O(1)):</span>
            Electronico e = electronicos.get(0);<br>
            e.setMarca("Samsung");<br>
            e.setModelo("QLED");<br>
            e.setNS("SN123");
        </div>
    </div>
</div>

<!-- 5. ERRORES SINTÁCTICOS Y CONVENCIONES -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-bug text-cyan-400"></i> 5. Errores Sintácticos Frecuentes en Java
</h3>

<div class="glass p-6 rounded-xl border border-white/10 mb-10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div>
            <h5 class="font-bold text-amber-300 mb-2">1. Literal Float en Java</h5>
            <p class="text-slate-300 leading-relaxed">
                Por defecto, números decimales como <code>32323.55</code> son interpretados por Java como <code>double</code> (64 bits). Para asignarlos a un <code>Float</code> (32 bits), es <strong>obligatorio</strong> incluir el sufijo <code>f</code>:
                <br><span class="font-mono text-emerald-400">float precio = 32323.55f;</span>
            </p>
        </div>
        <div>
            <h5 class="font-bold text-amber-300 mb-2">2. Especificadores de String.format</h5>
            <p class="text-slate-300 leading-relaxed">
                En tu código tenías <code>String.format("%NS %s...")</code>. El símbolo <code>%</code> indica el inicio de un especificador de formato. Escribir <code>%NS</code> genera un error. Debe ser <code>NS: %s</code>.
            </p>
        </div>
        <div>
            <h5 class="font-bold text-amber-300 mb-2">3. Convenciones Naming (camelCase)</h5>
            <p class="text-slate-300 leading-relaxed">
                En Java las variables y métodos usan <code>camelCase</code> (ej. <code>marca</code>, <code>setPrecio()</code>). Las clases usan <code>PascalCase</code> (ej. <code>Televisor</code>, <code>Electronico</code>).
            </p>
        </div>
    </div>
</div>

<!-- 6. CÓDIGO COMPLETO Y CORREGIDO -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-code text-emerald-400"></i> 6. Código Completo Corregido y Documentado
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    A continuación se presenta el código completo con la estructura modular corregida, aplicación de buenas prácticas, resolviendo el problema de <em>Shadowing</em> y usando <em>Downcasting</em> seguro con <code>instanceof</code>.
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> EjercicioCompleto.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0 max-h-[600px] overflow-y-auto custom-scrollbar"><code class="language-java">import java.util.LinkedList;

// ==========================================
// 1. SUPERCLASE BASE (Electronico)
// ==========================================
class Electronico {
    // Atributos protected: Accesibles por la misma clase, paquete y clases hijas
    protected String ns;
    protected String marca;
    protected String modelo;
    protected Float precio;

    // Getters y Setters respetando convención camelCase
    public String getNs() { return ns; }
    public void setNs(String ns) { this.ns = ns; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public Float getPrecio() { return precio; }
    public void setPrecio(Float precio) { this.precio = precio; }

    // Sobrescritura de toString() heredado de java.lang.Object
    @Override
    public String toString() {
        return String.format("NS: %s | Marca: %s | Modelo: %s | Precio: $%.2f", 
                              ns, marca, modelo, precio != null ? precio : 0.0f);
    }
}

// ==========================================
// 2. SUBCLASE TELEVISOR (Hereda con extends)
// ==========================================
class Televisor extends Electronico {
    // Atributos EXCLUSIVOS de Televisor
    private Float pulgadas;
    private String tipo;

    public Float getPulgadas() { return pulgadas; }
    public void setPulgadas(Float pulgadas) { this.pulgadas = pulgadas; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    // Reutilizamos la lógica del padre mediante super.toString()
    @Override
    public String toString() {
        return String.format("%s | Pulgadas: %.1f\\" | Tipo: %s", 
                              super.toString(), 
                              pulgadas != null ? pulgadas : 0.0f, 
                              tipo != null ? tipo : "N/A");
    }
}

// ==========================================
// 3. SUBCLASE VIDEOJUEGO (Hereda con extends)
// ==========================================
class Videojuego extends Electronico {
    // Atributos EXCLUSIVOS de Videojuego
    private Integer capacidad;
    private String tipo; 
    // NOTA IMPORTANTE: Se eliminó 'private Float precio;' para EVITAR SHADOWING (ocultamiento de variables)

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    @Override
    public String toString() {
        return String.format("%s | Capacidad: %d GB | Tipo: %s", 
                              super.toString(), 
                              capacidad != null ? capacidad : 0, 
                              tipo != null ? tipo : "N/A");
    }
}

// ==========================================
// 4. CLASE PRINCIPAL (Main)
// ==========================================
public class Main {
    public static void main(String[] args) {
        // Creación de lista polimórfica (guarda referencias de tipo Electronico)
        LinkedList<Electronico> electronicos = new LinkedList<>();

        // Upcasting implícito: Televisor y Videojuego son añadidos como Electronico
        electronicos.add(new Televisor());
        electronicos.add(new Videojuego());

        // Optimización: Extraemos la referencia del primer elemento para evitar múltiples .get(0) O(N)
        Electronico primerElem = electronicos.get(0);
        primerElem.setMarca("Samsung");
        primerElem.setModelo("QLED 4K");
        primerElem.setNs("SN-998877");
        primerElem.setPrecio(32323.55f); // Sufijo 'f' obligatorio para Float

        // DOWNCASTING SEGURO usando instanceof (Pattern Matching de Java 16+)
        if (primerElem instanceof Televisor tele) {
            tele.setPulgadas(55f);
            tele.setTipo("Smart TV");
        }

        // Configuración del segundo elemento (Videojuego)
        Electronico segundoElem = electronicos.get(1);
        segundoElem.setMarca("Sony");
        segundoElem.setModelo("PlayStation 5");
        segundoElem.setNs("PS5-100200");
        segundoElem.setPrecio(14999.99f);

        if (segundoElem instanceof Videojuego juego) {
            juego.setCapacidad(1024); // 1 TB
            juego.setTipo("Consola de Sobremesa");
        }

        System.out.println("Total de elementos iniciales: " + electronicos.size());
        System.out.println("\\n--- LISTA DE DISPOSITIVOS ---");
        for (Electronico e : electronicos) {
            System.out.println(e); // Invoca automáticamente el toString() polimórfico
        }

        // Eliminación del primer elemento
        electronicos.remove();

        System.out.println("\\nTotal tras remover el primero: " + electronicos.size());
        System.out.println("--- ELEMENTOS RESTANTES ---");
        for (Electronico e : electronicos) {
            System.out.println(e);
        }
    }
}</code></pre>
</div>
`,h=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-amber-500/20 text-amber-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-triangle-exclamation"></i></span>
    Manejo de Excepciones en Java
</h2>

<p class="text-slate-300 mb-6 text-base leading-relaxed">
    En la programación profesional, las cosas no siempre salen como se planean: un usuario puede ingresar un texto cuando se esperaba un número, intentar dividir entre cero o solicitar una posición que no existe dentro de un arreglo. En Java, el <strong>Manejo de Excepciones</strong> es el mecanismo que nos permite capturar estos eventos anómalos y evitar que la aplicación se detenga abruptamente (<em>crash</em>).
</p>

<!-- Conceptos Fundamentales: Diseño vs Ejecución -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-8">Errores en Tiempo de Dise&ntilde;o (Compilaci&oacute;n) vs. Tiempo de Ejecuci&oacute;n</h3>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="bg-black/40 border border-white/5 p-6 rounded-xl border-l-4 border-l-rose-500 hover:bg-white/5 transition-colors">
        <div class="flex items-center gap-3 mb-3">
            <span class="p-2 rounded-lg bg-rose-500/20 text-rose-400 font-bold"><i class="fa-solid fa-code text-lg"></i></span>
            <h4 class="font-bold text-rose-400 text-lg">Errores de Compilaci&oacute;n (Tiempo de Dise&ntilde;o)</h4>
        </div>
        <p class="text-sm text-slate-300 leading-relaxed mb-3">
            Son detectados por el compilador (<code>javac</code>) antes de ejecutar el programa. Ocurren por violaciones a la sintaxis o reglas del lenguaje Java.
        </p>
        <ul class="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Olvidar un punto y coma (<code>;</code>) o una llave de cierre.</li>
            <li>Incompatibilidad de tipos (ej. <code>int x = "hola";</code>).</li>
            <li>Llamar a un m&eacute;todo o variable que no existe o es privada.</li>
            <li><strong>Resultado:</strong> El ejecutable <code>.class</code> no se genera.</li>
        </ul>
    </div>

    <div class="bg-black/40 border border-white/5 p-6 rounded-xl border-l-4 border-l-amber-500 hover:bg-white/5 transition-colors">
        <div class="flex items-center gap-3 mb-3">
            <span class="p-2 rounded-lg bg-amber-500/20 text-amber-400 font-bold"><i class="fa-solid fa-bug text-lg"></i></span>
            <h4 class="font-bold text-amber-400 text-lg">Errores en Tiempo de Ejecuci&oacute;n (Excepciones)</h4>
        </div>
        <p class="text-sm text-slate-300 leading-relaxed mb-3">
            El c&oacute;digo sint&aacute;cticamente es correcto y compila perfectamente, pero durante la ejecuci&oacute;n ocurre un evento inesperado.
        </p>
        <ul class="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Dividir entre cero (<code>10 / 0</code>).</li>
            <li>Acceder a un &iacute;ndice de arreglo fuera de rango (ej. <code>datos[15]</code>).</li>
            <li>Entrada de usuario no v&aacute;lida en un <code>Scanner</code>.</li>
            <li><strong>Resultado:</strong> Lanzamiento de una <code>Exception</code> (interrupci&oacute;n del flujo).</li>
        </ul>
    </div>
</div>

<!-- Jerarquía de Excepciones -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-12">Jerarqu&iacute;a de Excepciones en Java (Throwable)</h3>
<p class="text-slate-300 mb-6 text-sm leading-relaxed">
    Todas las excepciones en Java heredan de la clase base <code>java.lang.Throwable</code>. Esta clase se divide en dos grandes ramas:
</p>

<div class="space-y-4 mb-10">
    <div class="glass p-5 rounded-xl relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
        <h4 class="font-bold text-rose-400 mb-1 flex items-center gap-2"><i class="fa-solid fa-skull-crossbones w-5 text-center"></i> Error (java.lang.Error)</h4>
        <p class="text-sm text-slate-300 ml-7">Fallas cr&iacute;ticas e irrecuperables a nivel de la Máquina Virtual de Java (JVM), como <code>OutOfMemoryError</code> o <code>StackOverflowError</code>. El programa no debe intentar capturarlos.</p>
    </div>
    
    <div class="glass p-5 rounded-xl relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
        <h4 class="font-bold text-amber-400 mb-1 flex items-center gap-2"><i class="fa-solid fa-shield-cat w-5 text-center"></i> Checked Exceptions (Verificadas)</h4>
        <p class="text-sm text-slate-300 ml-7">Excepciones que el compilador te obliga a controlar expl&iacute;citamente mediante un bloque <code>try-catch</code> o declarando <code>throws</code> en el m&eacute;todo. Ejemplo: <code>IOException</code>, <code>SQLException</code>, <code>Exception</code>.</p>
    </div>

    <div class="glass p-5 rounded-xl relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
        <h4 class="font-bold text-blue-400 mb-1 flex items-center gap-2"><i class="fa-solid fa-bolt w-5 text-center"></i> Unchecked Exceptions (No Verificadas / RuntimeException)</h4>
        <p class="text-sm text-slate-300 ml-7">Heredan de <code>RuntimeException</code>. Ocurren por errores l&oacute;gicos de programaci&oacute;n. El compilador no exige capturarlas obligatoriamente, pero causan la detenci&oacute;n del programa si no se prev&eacute;n. Ejemplo: <code>ArithmeticException</code>, <code>ArrayIndexOutOfBoundsException</code>, <code>NullPointerException</code>.</p>
    </div>
</div>

<!-- Bloques try, catch, finally y múltiples catch -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-12 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-lg"><i class="fa-solid fa-lock"></i></span>
    Captura de Excepciones con <code>try</code>, <code>catch</code> y M&uacute;ltiples Capturas
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para manejar situaciones donde se pueden generar m&uacute;ltiples excepciones (como leer un entero del usuario, hacer una divisi&oacute;n y consultar una posici&oacute;n de un arreglo en memoria), utilizamos el bloque <code>try</code> rodeado de distintos <code>catch</code> espec&iacute;ficos:
</p>

<!-- Ejemplo 1: Entrada de Scanner, División y Arreglo fuera de límites -->
<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center justify-between">
        <span class="flex items-center gap-2"><i class="fa-brands fa-java text-blue-300 text-sm"></i> ManejoExcepcionesEntrada.java</span>
        <span class="text-[11px] text-slate-400">Ejemplo de bucle interactivo con captura m&uacute;ltiple</span>
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import java.util.Scanner;
import java.util.InputMismatchException;

public class ManejoExcepcionesEntrada {
    public static void main(String[] args) {
        Scanner lectura = new Scanner(System.in);
        Integer variable = null;

        // Arreglo de 10 elementos (índices válidos: 0 a 9)
        int[] datos = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

        while (variable == null) {
            try {
                System.out.print("Introducir número entero (0-9): ");
                variable = lectura.nextInt(); // Puede lanzar InputMismatchException

                // 1. Operación de División (Puede lanzar ArithmeticException si variable == 0)
                int resultado = 10 / variable;

                // 2. Acceso al Arreglo (Puede lanzar ArrayIndexOutOfBoundsException si variable < 0 o >= 10)
                System.out.printf("Resultado División: %d | Valor en Arreglo[%d]: %d\\n", 
                                  resultado, variable, datos[variable]);

            } catch (ArithmeticException e) {
                System.err.println("❌ Error: División entre cero no permitida.");
                variable = null; // Para repetir el bucle
            } catch (ArrayIndexOutOfBoundsException e) {
                System.err.println("❌ Error: No existe la posición " + variable + " en el arreglo (Índices válidos: 0 a 9).");
                variable = null; // Para repetir el bucle
            } catch (InputMismatchException e) {
                System.err.println("❌ Error: La entrada no es un número entero válido.");
                lectura.next(); // Limpiar el buffer de Scanner para evitar bucle infinito
                variable = null;
            } catch (Exception e) {
                System.err.println("❌ Error inesperado: " + e.getMessage());
                variable = null;
            } finally {
                System.out.println("--- Intento finalizado ---\\n");
            }
        }
        
        System.out.println("¡Programa finalizado con éxito!");
        lectura.close();
    }
}</code></pre>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
    <div class="glass p-4 rounded-xl border-t-2 border-t-rose-500">
        <h5 class="font-bold text-rose-400 text-sm mb-1">1. ArithmeticException</h5>
        <p class="text-xs text-slate-300">Se produce si el usuario ingresa <code>0</code>, impidiendo la divisi&oacute;n por cero (<code>10 / 0</code>).</p>
    </div>
    <div class="glass p-4 rounded-xl border-t-2 border-t-amber-500">
        <h5 class="font-bold text-amber-400 text-sm mb-1">2. ArrayIndexOutOfBoundsException</h5>
        <p class="text-xs text-slate-300">Se genera si el entero introducido est&aacute; fuera del rango de memoria del arreglo (ej. <code>12</code> o <code>-3</code>).</p>
    </div>
    <div class="glass p-4 rounded-xl border-t-2 border-t-blue-500">
        <h5 class="font-bold text-blue-400 text-sm mb-1">3. InputMismatchException</h5>
        <p class="text-xs text-slate-300">Se activa si el usuario ingresa texto como <code>"abc"</code> en vez de un n&uacute;mero entero.</p>
    </div>
</div>

<!-- Excepciones en Clases y Métodos: throw y throws -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-14 flex items-center gap-3">
    <span class="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg text-lg"><i class="fa-solid fa-shapes"></i></span>
    Excepciones dentro de Clases (<code>throw</code> y <code>throws</code>)
</h3>

<p class="text-slate-300 mb-6 text-base leading-relaxed">
    Cuando diseñamos clases orientadas a objetos, el <code>throw</code> nos permite <strong>lanzar una excepción deliberadamente</strong> si las reglas de negocio de la clase son violadas (por ejemplo, dimensiones negativas en un equipo electr&oacute;nico). La palabra clave <code>throws</code> en la firma del m&eacute;todo le avisa a quien invoque la funci&oacute;n que debe manejar dicha excepci&oacute;n.
</p>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
    <!-- Monitor.java -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-blue-300 text-sm"></i> Monitor.java (Validación con throw)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">// Clase Monitor que deriva de Electronico
public class Monitor extends Electronico {
    private String tipo;
    private Float pulgadas;

    public Float getPulgadas() {
        return pulgadas;
    }

    // El método declara 'throws Exception' porque puede lanzar una excepción
    public void setPulgadas(Float pulgadas) throws Exception {
        if (pulgadas < 0) {
            // Lanzamos manualmente una excepción con un mensaje explicativo
            throw new Exception("No existen monitores con dimensión negativa");
        }
        this.pulgadas = pulgadas;
    }

    @Override
    public String toString() {
        return "Monitor [Tipo=" + tipo + ", Pulgadas=" + pulgadas + "]";
    }
}

// Clase base sugerida para el ejemplo
class Electronico {
    protected String marca;
    protected String modelo;
}</code></pre>
    </div>

    <!-- Principal.java -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-emerald-300 text-sm"></i> Principal.java (Captura de la Excepción)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import java.util.Scanner;

public class Principal {
    public static void main(String[] args) {
        Monitor monitor = new Monitor();

        try {
            // Intentamos asignar una dimensión inválida (-10)
            monitor.setPulgadas(-10f);
        } catch (Exception e) {
            // Capturamos e imprimimos el error generado por la clase Monitor
            System.err.println(e);
        }

        // El flujo del programa continúa normalmente sin colapsar
        System.out.println(monitor);
    }
}</code></pre>
    </div>
</div>

<div class="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 mb-10">
    <p><i class="fa-solid fa-circle-check text-emerald-400 mr-2"></i><strong>Salida por Consola esperada:</strong></p>
    <code class="block mt-2 bg-black/60 p-3 rounded font-mono text-rose-300">
        java.lang.Exception: No existen monitores con dimensión negativa<br>
        Monitor [Tipo=null, Pulgadas=null]
    </code>
</div>

<!-- Creación de Excepciones Personalizadas -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-12 flex items-center gap-3">
    <span class="bg-purple-500/20 text-purple-400 p-2 rounded-lg text-lg"><i class="fa-solid fa-gears"></i></span>
    Creaci&oacute;n de Excepciones Personalizadas (Custom Exceptions)
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para que el c&oacute;digo sea m&aacute;s legible y los errores tengan nombres espec&iacute;ficos del dominio de tu aplicaci&oacute;n, puedes crear tus propias clases de excepci&oacute;n heredando de <code>Exception</code> o <code>RuntimeException</code>:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> ProductoNoEncontradoException.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">// Excepción personalizada
public class ProductoNoEncontradoException extends Exception {
    public ProductoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}

// Uso en el método de la clase Almacen:
// public void actualizarProducto(String SKU, Producto nuevo) throws ProductoNoEncontradoException {
//     Producto p = buscarProducto(SKU);
//     if (p == null) {
//         throw new ProductoNoEncontradoException("No hay productos con ese SKU");
//     }
//     // Lógica de actualización...
// }</code></pre>
</div>

<!-- Resumen de Excepciones Comunes -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-12">Resumen de Excepciones Comunes en Java</h3>

<div class="overflow-x-auto mb-8">
    <table class="w-full text-left text-sm text-slate-300 border-collapse">
        <thead>
            <tr class="border-b border-white/10 bg-white/5 text-blue-300">
                <th class="p-3 font-semibold">Excepci&oacute;n</th>
                <th class="p-3 font-semibold">Tipo</th>
                <th class="p-3 font-semibold">&iquest;Cu&aacute;ndo ocurre?</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
            <tr class="hover:bg-white/5">
                <td class="p-3 font-mono text-rose-300">ArithmeticException</td>
                <td class="p-3 text-xs"><span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Unchecked</span></td>
                <td class="p-3 text-slate-300">Operaciones aritm&eacute;ticas imposibles, como divisi&oacute;n por cero.</td>
            </tr>
            <tr class="hover:bg-white/5">
                <td class="p-3 font-mono text-rose-300">ArrayIndexOutOfBoundsException</td>
                <td class="p-3 text-xs"><span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Unchecked</span></td>
                <td class="p-3 text-slate-300">Intento de acceder a un &iacute;ndice negativo o mayor o igual a <code>arreglo.length</code>.</td>
            </tr>
            <tr class="hover:bg-white/5">
                <td class="p-3 font-mono text-rose-300">NullPointerException</td>
                <td class="p-3 text-xs"><span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Unchecked</span></td>
                <td class="p-3 text-slate-300">Intentar llamar a un m&eacute;todo o propiedad de un objeto que apunta a <code>null</code>.</td>
            </tr>
            <tr class="hover:bg-white/5">
                <td class="p-3 font-mono text-rose-300">InputMismatchException</td>
                <td class="p-3 text-xs"><span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Unchecked</span></td>
                <td class="p-3 text-slate-300">El dato le&iacute;do por <code>Scanner</code> no coincide con el tipo esperado (ej. ingresar texto para un entero).</td>
            </tr>
            <tr class="hover:bg-white/5">
                <td class="p-3 font-mono text-rose-300">NumberFormatException</td>
                <td class="p-3 text-xs"><span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Unchecked</span></td>
                <td class="p-3 text-slate-300">Fallo al intentar convertir un <code>String</code> a un tipo num&eacute;rico (ej. <code>Integer.parseInt("abc")</code>).</td>
            </tr>
            <tr class="hover:bg-white/5">
                <td class="p-3 font-mono text-rose-300">IOException / Exception</td>
                <td class="p-3 text-xs"><span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">Checked</span></td>
                <td class="p-3 text-slate-300">Errores al manejar archivos, redes o excepciones declaradas expl&iacute;citamente con <code>throws</code>.</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl text-xs text-blue-200">
    <p><i class="fa-solid fa-lightbulb text-yellow-400 mr-2"></i><strong>Tip Pro:</strong> Siempre usa el bot&oacute;n <strong>Copiar</strong> y p&eacute;galo en la <strong>Terminal Global</strong> para probar el comportamiento de las excepciones en tiempo real.</p>
</div>
`,C=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-folder-open"></i></span>
    Archivos, Entradas y Salidas (I/O)
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    El manejo de archivos en Java es crucial para la persistencia de datos. Hasta ahora, todos los datos en las variables se pierden cuando el programa termina. Con el paquete <code>java.io</code>, podemos guardar información en el disco duro y recuperarla posteriormente.
</p>

<!-- 1. LA CLASE FILE -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-file text-blue-400"></i> 1. La clase <code>File</code>
</h3>

<div class="glass p-6 rounded-xl border-l-4 border-l-blue-500 mb-6">
    <h4 class="font-bold text-lg text-blue-300 mb-2">Representación en Memoria</h4>
    <p class="text-sm text-slate-300 leading-relaxed mb-4">
        La clase <code>File</code> <strong>NO representa el contenido</strong> del archivo, sino la <strong>ruta o el enlace</strong> hacia el archivo en el sistema operativo. Puede apuntar a un archivo existente, a un directorio, o a un archivo que aún no existe y planeamos crear.
    </p>
    <div class="bg-black/40 p-4 rounded-lg font-mono text-xs text-slate-300 border border-white/10">
        <span class="text-emerald-400 font-bold block mb-2">// Importación necesaria</span>
        <span class="text-slate-300">import java.io.File;</span><br><br>
        
        <span class="text-emerald-400 font-bold block mb-2">// Crear la referencia al archivo</span>
        <span class="text-slate-300">File archivo = new File("datos.txt");</span><br><br>
        
        <span class="text-emerald-400 font-bold block mb-2">// Métodos útiles de File</span>
        <span class="text-slate-300">System.out.println(archivo.exists()); </span><span class="text-slate-500">// ¿Existe físicamente?</span><br>
        <span class="text-slate-300">System.out.println(archivo.isFile()); </span><span class="text-slate-500">// ¿Es un archivo normal?</span><br>
        <span class="text-slate-300">System.out.println(archivo.isDirectory()); </span><span class="text-slate-500">// ¿Es una carpeta?</span><br>
    </div>
</div>

<!-- 2. WRITER Y BUFFEREDWRITER -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-pen-to-square text-emerald-400"></i> 2. Escritura: <code>FileWriter</code> y <code>BufferedWriter</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para escribir texto en un archivo, usamos clases de tipo <em>Writer</em>.
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="glass p-6 rounded-xl border-l-4 border-l-rose-500">
        <h4 class="font-bold text-rose-400 mb-2">FileWriter (Sin Buffer)</h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Escribe los datos directamente en el disco duro carácter por carácter. Es <strong>muy lento</strong> porque el disco duro es el componente más lento de la computadora. Hacer múltiples viajes pequeños al disco penaliza el rendimiento.
        </p>
    </div>

    <div class="glass p-6 rounded-xl border-l-4 border-l-emerald-500">
        <h4 class="font-bold text-emerald-400 mb-2">BufferedWriter (Con Buffer)</h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Actúa como un "carrito de compras" en la memoria RAM. Acumula todos los textos que quieres escribir y, cuando el carrito está lleno (o cuando llamas a <code>flush()</code> o cierras el archivo), hace un <strong>único viaje</strong> al disco duro. Es <strong>mucho más rápido y eficiente</strong>.
        </p>
    </div>
</div>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> Escritura.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import java.io.*;

public class Escritura {
    public static void guardar(String nombreArchivo) {
        File nuevo = new File(nombreArchivo);
        
        // El try-with-resources cierra automáticamente el archivo al terminar
        try (FileWriter fw = new FileWriter(nuevo);
             BufferedWriter bw = new BufferedWriter(fw)) {
             
            bw.write("JUGUETE|SKU123|ACTIVO|Pelota|Hasbro|1");
            bw.newLine(); // Agrega un salto de línea compatible con cualquier SO
            
            // También puedes usar String.format para escribir datos formateados
            bw.write(String.format("%s|%s|%s|%s|%d", "PELICULA", "SKU999", "ACTIVO", "Matrix", 1999));
            
        } catch (IOException e) {
            System.err.println("Error al intentar escribir en el disco.");
        }
    }
}</code></pre>
</div>

<!-- 3. READER Y BUFFEREDREADER -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-book-open text-purple-400"></i> 3. Lectura: <code>FileReader</code> y <code>BufferedReader</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    De manera análoga a la escritura, para leer usamos el <code>FileReader</code> envuelto en un <code>BufferedReader</code>, el cual nos proporciona el útil método <code>readLine()</code> para leer el archivo línea por línea hasta llegar al final (que devuelve <code>null</code>).
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> Lectura.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import java.io.*;
import java.util.regex.Pattern;

public class Lectura {
    public static void leerArchivo(String nombreArchivo, String separador) {
        File archivo = new File(nombreArchivo);
        // Pattern.quote asegura que si el separador es un caracter especial (como | o .), se interprete literalmente
        String sep = Pattern.quote(separador);

        // Se usa try-with-resources. El BufferedReader se encarga de cerrar el FileReader subyacente.
        try (BufferedReader br = new BufferedReader(new FileReader(archivo))) {
            String linea;
            
            // Leemos línea por línea hasta que devuelva null (fin del archivo)
            while ((linea = br.readLine()) != null) {
                // Separamos la línea usando el separador especificado
                String[] datos = linea.split(sep);
                
                String tipo = datos[0];
                System.out.println("Cargando tipo: " + tipo);
                // Aquí podrías usar un switch para instanciar el objeto correcto según 'tipo'
            }
            
        } catch (FileNotFoundException e) {
            System.err.println("El archivo especificado no existe: " + nombreArchivo);
        } catch (IOException e) {
            System.err.println("Error de I/O al leer el archivo.");
        }
    }
}</code></pre>
</div>

<!-- 4. EXCEPCIONES COMUNES EN I/O -->
<div class="glass p-6 rounded-xl border border-amber-500/30 mb-8">
    <h4 class="font-bold text-amber-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> Excepciones Checked de I/O
    </h4>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
        El manejo de archivos te obliga obligatoriamente (son <em>Checked Exceptions</em>) a usar bloques <code>try-catch</code>.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <span class="text-xs font-bold text-rose-400 block mb-1">FileNotFoundException:</span>
            <p class="text-xs text-slate-400">Se lanza específicamente cuando intentas <strong>leer</strong> (<code>FileReader</code>) un archivo que no existe en la ruta proporcionada. (Al escribir, <code>FileWriter</code> suele crear el archivo si no existe, a menos que la carpeta tampoco exista o no haya permisos).</p>
        </div>
        <div>
            <span class="text-xs font-bold text-amber-400 block mb-1">IOException:</span>
            <p class="text-xs text-slate-400">La excepción padre para problemas de entrada/salida. Puede lanzarse si el disco está lleno, si se pierde la conexión a una unidad de red, o si el archivo está bloqueado por otro programa.</p>
        </div>
    </div>
</div>
`,S=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-file-binary"></i></span>
    Archivos Binarios & Serialización
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    La serialización de objetos en Java representa una <strong>biyección computacional</strong>: mapea el estado estructurado de un objeto residente en la memoria RAM (sus grafos de referencias y datos primitivos) hacia una secuencia lineal de bytes en disco, y viceversa. A diferencia de los archivos de texto plano, los <strong>archivos binarios</strong> no son legibles por el ser humano, pero son <strong>extremadamente eficientes</strong> para la máquina, ya que omiten las sobrecargas de conversión de tipos (parsing) y de codificación de caracteres.
</p>

<!-- 1. LA ENTIDAD: SERIALIZABLE Y SERIALVERSIONUID -->
<h3 class="text-2xl font-bold text-indigo-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-shield-halved text-indigo-400"></i> 1. La Entidad: Interfaz <code>Serializable</code> y <code>serialVersionUID</code>
</h3>

<div class="glass p-6 rounded-xl border-l-4 border-l-indigo-500 mb-6">
    <h4 class="font-bold text-lg text-indigo-300 mb-2">Contrato de Persistencia</h4>
    <p class="text-sm text-slate-300 leading-relaxed mb-4">
        Para que la Máquina Virtual de Java (JVM) autorice la transformación de una clase a una ráfaga de bytes, la clase debe implementar la interfaz marcadora <code>java.io.Serializable</code>. Al ser una interfaz sin métodos, le indica al compilador que el estado de las instancias de esta clase puede ser volcado a disco de manera segura.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="bg-black/40 p-4 rounded-lg border border-white/10">
            <span class="text-xs font-bold text-indigo-400 block mb-1"><i class="fa-solid fa-key mr-1"></i> serialVersionUID</span>
            <p class="text-xs text-slate-300 leading-relaxed">
                Actúa como una firma o <strong>hash de versión estructural</strong> de la clase. Si guardas un objeto hoy y mañana agregas un nuevo atributo, la JVM comparará los <code>serialVersionUID</code>. Si no coinciden, se lanzará una <code>InvalidClassException</code> para evitar corrupción de memoria.
            </p>
        </div>
        <div class="bg-black/40 p-4 rounded-lg border border-white/10">
            <span class="text-xs font-bold text-amber-400 block mb-1"><i class="fa-solid fa-eye-slash mr-1"></i> Modificador transient</span>
            <p class="text-xs text-slate-300 leading-relaxed">
                La palabra reservada <code>transient</code> excluye explícitamente un atributo del proceso de serialización. Al reconstruir el objeto desde disco, el valor de ese campo será <code>null</code> (o 0), ignorando lo que tenía antes de guardar.
            </p>
        </div>
    </div>
</div>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-indigo-500/20 text-indigo-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-indigo-300 text-sm"></i> JugueteBinario.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import java.io.Serializable;

// 1. Declarar la interfaz marcadora Serializable
public class JugueteBinario implements Serializable {
    
    // 2. Identificador de versión para control de cambios estructurales
    private static final long serialVersionUID = 1L; 

    private String codigo;
    private String nombre;
    private int edicion;
    
    // La palabra clave 'transient' excluye explícitamente esta variable de la serialización.
    // Al deserializar, su valor volverá al valor por defecto de Java (null o 0).
    private transient String datoTemporal; 

    public JugueteBinario(String codigo, String nombre, int edicion) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.edicion = edicion;
        this.datoTemporal = "No persistente en disco";
    }

    @Override
    public String toString() {
        return String.format("Juguete [Código: %s, Nombre: %s, Edición: %d | Temp: %s]", 
                             this.codigo, this.nombre, this.edicion, this.datoTemporal);
    }
}</code></pre>
</div>

<!-- 2. FLUJOS DE I/O BINARIOS Y TRY-WITH-RESOURCES -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-network-wired text-emerald-400"></i> 2. Flujos de I/O Binarios y Patrón Decorator
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Al trabajar con datos binarios, sustituimos los lectores de texto (<code>FileWriter</code> / <code>FileReader</code>) por flujos de bytes puros: <code>FileOutputStream</code> y <code>FileInputStream</code>. Sobre ellos aplicamos el <strong>patrón Decorator</strong> envolviéndolos en <code>ObjectOutputStream</code> y <code>ObjectInputStream</code>.
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="glass p-6 rounded-xl border-l-4 border-l-emerald-500">
        <h4 class="font-bold text-emerald-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-file-export"></i> ObjectOutputStream
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Recibe instancias de clases serializables y las convierte en una secuencia de bytes mediante <code>writeObject()</code>, canalizándolas directamente a un <code>FileOutputStream</code>.
        </p>
    </div>

    <div class="glass p-6 rounded-xl border-l-4 border-l-blue-500">
        <h4 class="font-bold text-blue-400 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-file-import"></i> ObjectInputStream
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Lee el flujo continuo de bytes de un <code>FileInputStream</code> y reconstruye el objeto original en la memoria Heap usando <code>readObject()</code>.
        </p>
    </div>
</div>

<!-- 3. GESTOR BINARIO Y EJEMPLO COMPLETO -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-laptop-code text-purple-400"></i> 3. Ejemplo Práctico: Serializar y Deserializar Colecciones
</h3>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> GestorBinario.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import java.io.*;
import java.util.LinkedList;

public class GestorBinario {

    // =====================================================================
    // ESCRITURA: Serializando una Colección entera
    // =====================================================================
    public static void guardarClaseEntera(String ruta, LinkedList<JugueteBinario> lista) {
        File archivo = new File(ruta);

        // Try-with-resources: ObjectOutputStream envuelve a FileOutputStream
        try (FileOutputStream fos = new FileOutputStream(archivo);
             ObjectOutputStream oos = new ObjectOutputStream(fos)) {

            // writeObject() toma cualquier objeto que implemente Serializable.
            // Dado que LinkedList implementa Serializable y JugueteBinario también,
            // podemos volcar la estructura de datos completa en una sola llamada de O(1).
            oos.writeObject(lista);
            
            System.out.println("Estructura de datos serializada correctamente en: " + ruta);

        } catch (IOException e) {
            System.err.println("Error crítico de I/O al escribir archivo binario: " + e.getMessage());
        }
    }

    // =====================================================================
    // LECTURA: Deserializando y reconstruyendo la memoria
    // =====================================================================
    @SuppressWarnings("unchecked") // Suprimimos el warning del casteo genérico
    public static LinkedList<JugueteBinario> leerClaseEntera(String ruta) {
        LinkedList<JugueteBinario> listaReconstruida = new LinkedList<>();
        File archivo = new File(ruta);

        if (!archivo.exists()) return listaReconstruida;

        try (FileInputStream fis = new FileInputStream(archivo);
             ObjectInputStream ois = new ObjectInputStream(fis)) {

            // readObject() retorna un tipo genérico 'Object'. 
            // Debemos aplicar un casting explícito para mapearlo a nuestra estructura original.
            Object objetoLeido = ois.readObject();
            
            if (objetoLeido instanceof LinkedList) {
                listaReconstruida = (LinkedList<JugueteBinario>) objetoLeido;
                System.out.println("Des-serialización exitosa. Objetos en memoria: " + listaReconstruida.size());
            }

        } catch (FileNotFoundException e) {
            System.err.println("Archivo no localizado: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("Error de lectura binaria: " + e.getMessage());
        } catch (ClassNotFoundException e) {
            // Excepción exclusiva de binarios: ocurre si el archivo contiene una clase
            // que ya no existe en el código fuente actual de la aplicación.
            System.err.println("Incompatibilidad de clases en tiempo de ejecución: " + e.getMessage());
        }

        return listaReconstruida;
    }

    // =====================================================================
    // MÉTODO MAIN DE PRUEBA
    // =====================================================================
    public static void main(String[] args) {
        String archivoBinario = "juguetes.dat"; // Convención: .dat o .bin para binarios

        // 1. Instanciamos objetos en RAM
        LinkedList<JugueteBinario> inventario = new LinkedList<>();
        inventario.add(new JugueteBinario("123", "Darth Vader Mafex", 1));
        inventario.add(new JugueteBinario("456", "Yoda Mafex", 2));

        // 2. Volcamos la memoria RAM al Disco (Persistencia Binaria)
        guardarClaseEntera(archivoBinario, inventario);

        // 3. Simulamos un reinicio del sistema limpiando la lista original
        inventario = null;

        // 4. Recuperamos el estado directamente desde el disco sin hacer parsing manual
        LinkedList<JugueteBinario> inventarioRecuperado = leerClaseEntera(archivoBinario);

        // Comprobación de integridad
        for (JugueteBinario j : inventarioRecuperado) {
            System.out.println(j.toString());
        }
    }
}</code></pre>
</div>

<!-- 4. ANÁLISIS COMPARATIVO Y EOFEXCEPTION -->
<div class="glass p-6 rounded-xl border border-amber-500/30 mb-8">
    <h4 class="font-bold text-amber-300 mb-3 flex items-center gap-2 text-lg">
        <i class="fa-solid fa-microchip text-amber-400"></i> Análisis Interno & Gestión de Excepciones
    </h4>

    <div class="space-y-4">
        <div class="bg-black/40 p-4 rounded-lg border border-white/5">
            <span class="text-xs font-bold text-indigo-400 block mb-1"><code>writeObject(Object obj)</code>:</span>
            <p class="text-xs text-slate-300 leading-relaxed">
                Ejecuta un análisis exhaustivo (reflexión) del objeto proporcionado. Si es una colección (como <code>LinkedList</code>), itera internamente sobre sus nodos y verifica que cada elemento también sea <code>Serializable</code>. Escribe secuencialmente la metainformación de la clase y los valores binarios de sus atributos.
            </p>
        </div>

        <div class="bg-black/40 p-4 rounded-lg border border-white/5">
            <span class="text-xs font-bold text-emerald-400 block mb-1"><code>readObject()</code>:</span>
            <p class="text-xs text-slate-300 leading-relaxed">
                Realiza el proceso inverso. Lee primero los metadatos de la clase desde el archivo binario, verifica el <code>serialVersionUID</code> contra la clase cargada en la JVM, reserva memoria en el Heap y asigna los valores bit a bit.
            </p>
        </div>

        <div class="bg-black/40 p-4 rounded-lg border border-white/5">
            <span class="text-xs font-bold text-amber-400 block mb-1">Gestión de <code>EOFException</code> (End Of File):</span>
            <p class="text-xs text-slate-300 leading-relaxed">
                Si guardas objetos de manera individual llamando a <code>oos.writeObject(juguete)</code> múltiples veces en lugar de guardar una colección completa, al leerlos deberás usar un bucle <code>while(true)</code> y capturar la excepción <code>EOFException</code> para salir del bucle. Los archivos binarios no poseen un delimitador o marcador "fin de línea" (como <code>null</code> en <code>readLine()</code>). Volcar la colección completa (<code>Collection</code>) elimina este problema y simplifica enormemente el código.
            </p>
        </div>
    </div>
</div>
`,y=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-plug"></i></span>
    Interfaces, Comparable y Comparator
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    Las interfaces son una de las herramientas más potentes en Java para lograr abstracción y polimorfismo puro. Además, aprenderemos a utilizar las interfaces nativas de Java <code>Comparable</code> y <code>Comparator</code> para dotar a nuestros objetos de la capacidad de ordenarse automáticamente.
</p>

<!-- 1. ¿QUÉ ES UNA INTERFAZ? -->
<h3 class="text-2xl font-bold text-indigo-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-file-contract text-indigo-400"></i> 1. ¿Qué es una Interfaz?
</h3>

<div class="glass p-6 rounded-xl border-l-4 border-l-indigo-500 mb-6">
    <p class="text-sm text-slate-300 leading-relaxed mb-4">
        Una interfaz es como un <strong>contrato estricto</strong>. Define <em>qué</em> debe hacer una clase (los nombres de los métodos), pero no <em>cómo</em> lo hace (sin cuerpo de método). Si una clase dice que implementa una interfaz, está obligada a proveer el código para todos los métodos definidos en ella.
    </p>
    <div class="bg-black/40 p-4 rounded-lg font-mono text-xs text-slate-300 border border-white/10">
        <span class="text-indigo-400 font-bold block mb-2">// Definición de la interfaz</span>
        <span class="text-slate-300">public interface Imprimible {</span><br>
        <span class="text-slate-400 pl-4">void imprimirTicket(); </span><span class="text-slate-500">// Método sin cuerpo (abstracto por defecto)</span><br>
        <span class="text-slate-300">}</span><br><br>
        
        <span class="text-emerald-400 font-bold block mb-2">// Implementación en una clase</span>
        <span class="text-slate-300">public class Producto implements Imprimible {</span><br>
        <span class="text-slate-400 pl-4">@Override</span><br>
        <span class="text-slate-400 pl-4">public void imprimirTicket() {</span><br>
        <span class="text-slate-400 pl-8">System.out.println("Imprimiendo ticket del producto...");</span><br>
        <span class="text-slate-400 pl-4">}</span><br>
        <span class="text-slate-300">}</span>
    </div>
</div>

<!-- 2. LA INTERFAZ COMPARABLE -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-sort-alpha-down text-emerald-400"></i> 2. Ordenamiento Natural: <code>Comparable&lt;T&gt;</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    La interfaz <code>Comparable</code> se implementa en la misma clase del objeto que queremos ordenar. Define cuál es el <strong>criterio de ordenamiento por defecto (natural)</strong> de esa clase. Solo nos obliga a implementar un método: <code>compareTo(T o)</code>.
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> Producto.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public abstract class Producto implements Comparable<Producto> {
    protected String SKU;
    
    public String getSKU() { return SKU; }

    @Override
    public int compareTo(Producto otroProducto) {
        // Orden natural: por el atributo String SKU alfabéticamente
        return this.SKU.compareTo(otroProducto.getSKU());
        
        // Si fuera un número entero (ej: id):
        // return Integer.compare(this.id, otroProducto.getId());
    }
}</code></pre>
</div>
<p class="text-xs text-slate-400 mb-6 italic">Al hacer esto, puedes llamar a <code>listaProductos.sort(null)</code> y Java ordenará automáticamente los productos por SKU.</p>


<!-- 3. LA INTERFAZ COMPARATOR -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-arrows-split-up-and-left text-amber-400"></i> 3. Múltiples Criterios: <code>Comparator&lt;T&gt;</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    ¿Qué pasa si queremos ordenar a veces por SKU, a veces por Nombre, y a veces por Tipo? Como <code>Comparable</code> solo permite un orden natural, usamos <code>Comparator</code> para definir <strong>criterios de ordenamiento externos y múltiples</strong>.
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-amber-300 text-sm"></i> ComparadorPorNombre.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0 h-full"><code class="language-java">import java.util.Comparator;

public class ComparadorPorNombre implements Comparator<Producto> {
    @Override
    public int compare(Producto p1, Producto p2) {
        // Asumiendo que existe un getTitulo() o getNombre() 
        // dependiendo de la estructura
        return p1.getNombre().compareTo(p2.getNombre());
    }
}</code></pre>
    </div>

    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-rose-500/20 text-rose-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-rose-300 text-sm"></i> ComparadorPorTipoYSKU.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0 h-full"><code class="language-java">import java.util.Comparator;

public class ComparadorPorTipoYSKU implements Comparator<Producto> {
    @Override
    public int compare(Producto p1, Producto p2) {
        // 1. Primero comparamos por la clase (Juguete vs Pelicula)
        int tipoComparacion = p1.getClass().getSimpleName()
                                .compareTo(p2.getClass().getSimpleName());
        
        // 2. Si son del mismo tipo (empate == 0), comparamos por SKU
        if (tipoComparacion == 0) {
            return p1.getSKU().compareTo(p2.getSKU());
        }
        
        return tipoComparacion;
    }
}</code></pre>
    </div>
</div>

<!-- 4. APLICANDO EL ORDENAMIENTO -->
<div class="glass p-6 rounded-xl border border-blue-500/30 mb-8">
    <h4 class="font-bold text-blue-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-play text-blue-400"></i> Aplicando el Ordenamiento a una Lista
    </h4>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
        Una vez implementados el Comparable y los Comparators, podemos pasarlos al método <code>sort()</code> de nuestra colección.
    </p>

    <div class="bg-black/60 p-4 rounded-lg text-xs font-mono text-slate-300">
        LinkedList&lt;Producto&gt; inventario = new LinkedList&lt;&gt;();<br><br>
        
        <span class="text-emerald-400">// Usando Comparable (Orden Natural por SKU)</span><br>
        inventario.sort(<span class="text-rose-300">null</span>);<br><br>
        
        <span class="text-emerald-400">// Usando Comparator por Nombre</span><br>
        inventario.sort(<span class="text-rose-300">new ComparadorPorNombre()</span>);<br><br>
        
        <span class="text-emerald-400">// Usando Comparator Combinado (Tipo + SKU)</span><br>
        inventario.sort(<span class="text-rose-300">new ComparadorPorTipoYSKU()</span>);
    </div>
</div>
`,E=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-amber-500/20 text-amber-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-list-ol"></i></span>
    Tipos Enumerados (Enums)
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    En ocasiones, una variable solo debería poder tomar un conjunto específico de valores predefinidos. Por ejemplo, los días de la semana, los meses del año, o el estado de un producto (Activo o Descontinuado). Para evitar errores usando cadenas de texto libres (Strings), Java provee los <strong>Enumerators (Enums)</strong>.
</p>

<!-- 1. CREANDO UN ENUM -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-cube text-amber-400"></i> 1. Definiendo un Enum
</h3>

<div class="glass p-6 rounded-xl border-l-4 border-l-amber-500 mb-6">
    <p class="text-sm text-slate-300 leading-relaxed mb-4">
        Un <code>enum</code> es un tipo de clase especial que representa un grupo de constantes invariables. Se declaran usando la palabra reservada <code>enum</code> en lugar de <code>class</code>. Por convención, las constantes se escriben en <strong>MAYÚSCULAS</strong>.
    </p>
    
    <div class="code-wrapper relative pt-6 mb-4">
        <div class="absolute top-0 left-0 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-amber-300 text-sm"></i> ESTADO.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public enum ESTADO {
    ACTIVO, DESCONTINUADO
}</code></pre>
    </div>
</div>

<!-- 2. USANDO EL ENUM -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-code-merge text-emerald-400"></i> 2. Aplicando Enums en Clases
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Podemos usar el Enum como si fuera cualquier otro tipo de dato en nuestras clases, asegurando de esta forma que nadie pueda asignar un valor que no sea <code>ACTIVO</code> o <code>DESCONTINUADO</code>.
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> Producto.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public class Producto {
    private String SKU;
    // La variable de estado usa el tipo de dato ESTADO (el Enum)
    private ESTADO estado;
    
    public Producto(String SKU, ESTADO estado) {
        this.SKU = SKU;
        this.estado = estado;
    }
    
    public void imprimirEstado() {
        // Uso simple en condicionales
        if (this.estado == ESTADO.ACTIVO) {
            System.out.println("El producto se puede vender.");
        } else {
            System.out.println("El producto ya no se vende.");
        }
    }
}</code></pre>
</div>

<!-- 3. DE STRING A ENUM (valueOf) -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-right-left text-blue-400"></i> 3. Conversión desde Archivos de Texto
</h3>

<div class="glass p-6 rounded-xl border border-blue-500/30 mb-8">
    <h4 class="font-bold text-blue-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-file-lines text-blue-400"></i> <code>ESTADO.valueOf(String)</code>
    </h4>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
        Cuando leemos datos de un archivo de texto, obtenemos un <code>String</code> puro (por ejemplo, <code>"ACTIVO"</code>). Para convertir ese texto de vuelta a un objeto Enum, utilizamos el método estático <code>valueOf()</code>, el cual ya viene incluido automáticamente por Java en todos los enums.
    </p>

    <div class="bg-black/60 p-4 rounded-lg text-xs font-mono text-slate-300">
        <span class="text-emerald-400">// Supongamos que leemos una línea del archivo</span><br>
        String linea = "JUGUETE|SKU123|<span class="text-amber-300">ACTIVO</span>|Pelota";<br>
        String[] datos = linea.split("\\\\|");<br><br>
        
        <span class="text-emerald-400">// Extraemos el texto "ACTIVO" en datos[2] y lo convertimos a Enum</span><br>
        <span class="text-rose-300">ESTADO estadoProducto = ESTADO.valueOf(datos[2]);</span><br><br>
        
        <span class="text-emerald-400">// Ahora ya podemos crear nuestro objeto seguro</span><br>
        Producto p = new Producto(datos[1], estadoProducto);
    </div>
    
    <div class="mt-4 p-3 bg-rose-500/10 border-l-2 border-l-rose-500 text-xs">
        <p class="text-rose-300"><i class="fa-solid fa-triangle-exclamation mr-1"></i> <strong>Cuidado:</strong> Si el string no coincide <strong>exactamente</strong> con el nombre del enum (por ejemplo, "Activo" o " ACTIVO " con espacios), <code>valueOf</code> lanzará una excepción <code>IllegalArgumentException</code>.</p>
    </div>
</div>
`,A=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-purple-500/20 text-purple-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-clone"></i></span>
    Copias Fantasma vs Copias Reales (Clone)
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    Uno de los errores más comunes en la Programación Orientada a Objetos en Java sucede al intentar duplicar un objeto. Igualar dos variables (<code>objetoA = objetoB</code>) no hace lo que la mayoría de los principiantes creen.
</p>

<!-- 1. LA COPIA FANTASMA -->
<h3 class="text-2xl font-bold text-rose-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-ghost text-rose-400"></i> 1. La Copia por Referencia (Ghost Copy)
</h3>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="glass p-6 rounded-xl border-l-4 border-l-rose-500">
        <h4 class="font-bold text-rose-400 mb-2">Punteros a la Memoria</h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Cuando haces <code>Producto p2 = p1;</code>, Java <strong>NO</strong> crea un nuevo producto en la memoria. Simplemente crea una nueva "etiqueta" (variable) que apunta <strong>al mismo objeto original</strong>. Esto significa que si modificas <code>p2</code>, ¡también estarás modificando a <code>p1</code>, porque son la misma entidad física en la RAM!
        </p>
    </div>
    
    <div class="bg-black/60 p-4 rounded-xl border border-rose-500/20 font-mono text-xs">
        <span class="text-emerald-400">// Creamos un objeto físico real (con "new")</span><br>
        Producto p1 = new Producto("TV", 500.0);<br><br>
        
        <span class="text-rose-400">// COPIA FANTASMA: Solo copiamos el puntero</span><br>
        Producto p2 = p1;<br><br>
        
        <span class="text-emerald-400">// Modificamos p2...</span><br>
        p2.setPrecio(100.0);<br><br>
        
        <span class="text-rose-400">// ¡OH SORPRESA! p1 también fue modificado</span><br>
        System.out.println(p1.getPrecio()); <span class="text-slate-500">// Imprime: 100.0</span>
    </div>
</div>

<!-- 2. LA CLONACIÓN REAL -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-wand-magic-sparkles text-emerald-400"></i> 2. La Copia Real (Deep / Shallow Clone)
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para duplicar un objeto de verdad, debes forzar a Java a reservar nueva memoria para el segundo objeto. Existen múltiples formas de hacerlo, como implementar un constructor de copia o usar el método <code>clone()</code> de la interfaz <code>Cloneable</code>.
</p>

<div class="glass p-6 rounded-xl border border-emerald-500/30 mb-8">
    <h4 class="font-bold text-emerald-300 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-check text-emerald-400"></i> Solución Básica: Constructor de Copia
    </h4>

    <div class="code-wrapper relative pt-6 mb-4">
        <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-emerald-300 text-sm"></i> CopiaSegura.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public class Producto {
    private String nombre;
    private double precio;
    
    // Constructor normal
    public Producto(String nombre, double precio) {
        this.nombre = nombre;
        this.precio = precio;
    }
    
    // CONSTRUCTOR DE COPIA
    public Producto(Producto original) {
        this.nombre = original.nombre;
        this.precio = original.precio;
    }
}

// ---- EN EL MAIN ----
Producto p1 = new Producto("TV", 500.0);

// COPIA REAL: Usamos 'new' para reservar nueva memoria
Producto p2 = new Producto(p1);

p2.setPrecio(100.0);
System.out.println(p1.getPrecio()); // Imprime: 500.0 (¡p1 quedó intacto!)</code></pre>
    </div>
</div>

<div class="glass p-6 rounded-xl border border-blue-500/30 mb-8 mt-6">
    <h4 class="font-bold text-blue-300 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-copy text-blue-400"></i> Solución Avanzada: Interfaz <code>Cloneable</code>
    </h4>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
        Java ofrece un mecanismo nativo para clonar objetos a través de la interfaz <strong>marcador</strong> <code>Cloneable</code> y sobrescribiendo el método <code>clone()</code> de la clase <code>Object</code>.
    </p>

    <div class="code-wrapper relative pt-6 mb-4">
        <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-blue-300 text-sm"></i> ClonacionNativa.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">// 1. Implementar la interfaz Cloneable
public class Producto implements Cloneable {
    private String nombre;
    private double precio;
    
    public Producto(String nombre, double precio) {
        this.nombre = nombre;
        this.precio = precio;
    }
    
    // 2. Sobrescribir el método clone()
    @Override
    public Producto clone() {
        try {
            // Llama al clone nativo (hace una shallow copy automática de los atributos)
            return (Producto) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(); // Nunca debería ocurrir si implementas Cloneable
        }
    }
}

// ---- EN EL MAIN ----
Producto p1 = new Producto("Laptop", 1200.0);

// CLONACIÓN NATIVA: Se crea un objeto nuevo en memoria
Producto p3 = p1.clone();

p3.setPrecio(999.0);
System.out.println(p1.getPrecio()); // Imprime: 1200.0 (p1 queda intacto)</code></pre>
    </div>
    <div class="mt-4 p-3 bg-blue-500/10 border-l-2 border-l-blue-500 text-xs">
        <p class="text-blue-300"><i class="fa-solid fa-circle-info mr-1"></i> <strong>Nota:</strong> <code>super.clone()</code> realiza una copia superficial (<em>Shallow Copy</em>). Si tu clase tuviera atributos que fueran otros objetos complejos (ej. listas u otros objetos propios), tendrías que clonarlos manualmente dentro del método <code>clone()</code> para lograr una copia profunda (<em>Deep Copy</em>).</p>
    </div>
</div>
`,w=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-window-restore"></i></span>
    JavaFX & Scene Builder: Guía Completa y Práctica
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    JavaFX es el toolkit moderno para el desarrollo de aplicaciones de escritorio enriquecidas (GUI) en Java. Separa limpiamente el diseño visual declarativo (archivos <code>.fxml</code>) de la lógica de negocio mediante controladores, permitiendo diseñar interfaces de alta calidad usando herramientas visuales como <strong>Scene Builder</strong>.
</p>

<!-- 1. INTRODUCCIÓN Y ARQUITECTURA -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-layer-group text-cyan-400"></i> 1. Conceptos Fundamentales: Stage, Scene y Nodos
</h3>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="glass p-5 rounded-xl border-t-4 border-t-cyan-500">
        <h4 class="font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <i class="fa-regular fa-window-maximize"></i> Stage (El Escenario)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Representa la ventana principal del sistema operativo (borde, barra de título, botones de minimizar/cerrar). JavaFX te proporciona el <code>primaryStage</code> en el método <code>start</code>.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-blue-500">
        <h4 class="font-bold text-blue-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-film"></i> Scene (La Escena)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Es el contenedor de todo el contenido visual dentro del Stage. Un Stage solo muestra una Scene a la vez, pero puedes intercambiar escenas dinámicamente con transiciones o navegación.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-emerald-500">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-cubes"></i> Scene Graph & Nodes
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Árbol jerárquico de elementos visuales (Layouts, Buttons, Labels, ComboBoxes). Todos derivan de <code>Node</code> y componen la vista cargada desde tu archivo FXML.
        </p>
    </div>
</div>

<!-- 2. SCENE BUILDER Y VINCULACIÓN -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-shapes text-emerald-400"></i> 2. Flujo de Trabajo con Scene Builder
</h3>

<div class="glass p-6 rounded-xl border border-white/10 mb-8 space-y-4">
    <p class="text-slate-300 text-sm leading-relaxed">
        <strong>Gluon Scene Builder</strong> es el diseñador visual drag-and-drop de JavaFX. Para conectar lo que arrastras en pantalla con tu código Java, existen tres pilares:
    </p>
    <ul class="list-disc list-inside text-xs text-slate-300 space-y-2">
        <li><strong class="text-emerald-400">Asignar el Controller:</strong> En el panel inferior izquierdo (<em>Document &gt; Controller</em>), escribe la clase controladora con su paquete completo (ej. <code>com.ejemplo.controllers.CalculadoraController</code>).</li>
        <li><strong class="text-emerald-400">Identificar Componentes (fx:id):</strong> En el panel derecho (<em>Code &gt; fx:id</em>), dale un identificador a cada control que quieras manipular desde Java (ej. <code>txtPantalla</code>, <code>lblEstado</code>, <code>btnSumar</code>). Debe coincidir exactamente con el nombre de la variable anotada con <code>@FXML</code>.</li>
        <li><strong class="text-emerald-400">Event Handlers (On Action):</strong> En el panel derecho (<em>Code &gt; On Action</em>), escribe el nombre del método manejador con una almohadilla inicial (ej. <code>#onDigitoClick</code> o <code>#onOperacionClick</code>).</li>
    </ul>
</div>

<!-- 3. COMPONENTES BÁSICOS: BUTTON, LABEL, TEXTFIELD Y ACTIONEVENT -->
<h3 class="text-2xl font-bold text-sky-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-square-check text-sky-400"></i> 3. Componentes Básicos, Métodos Esenciales y <code>ActionEvent</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    En JavaFX, casi todos los controles de texto descienden de <code>Labeled</code> o <code>TextInputControl</code>. Dominar sus métodos fundamentales es clave antes de construir pantallas complejas:
</p>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="glass p-5 rounded-xl border border-sky-500/30">
        <h4 class="font-bold text-sky-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-tag text-sky-400"></i> Label
        </h4>
        <p class="text-xs text-slate-400 mb-3">Texto estático o dinámico para mostrar información al usuario.</p>
        <div class="bg-black/50 p-3 rounded-lg font-mono text-[11px] text-slate-200 space-y-1">
            <div><span class="text-sky-400">lblMensaje</span>.setText(<span class="text-emerald-300">"Total: $500"</span>);</div>
            <div>String txt = <span class="text-sky-400">lblMensaje</span>.getText();</div>
            <div><span class="text-sky-400">lblMensaje</span>.setVisible(<span class="text-amber-300">false</span>);</div>
        </div>
    </div>

    <div class="glass p-5 rounded-xl border border-emerald-500/30">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-regular fa-keyboard text-emerald-400"></i> TextField
        </h4>
        <p class="text-xs text-slate-400 mb-3">Caja de entrada de una sola línea editable por el usuario.</p>
        <div class="bg-black/50 p-3 rounded-lg font-mono text-[11px] text-slate-200 space-y-1">
            <div>String entrada = <span class="text-emerald-400">txtNombre</span>.getText();</div>
            <div><span class="text-emerald-400">txtNombre</span>.setText(<span class="text-emerald-300">""</span>);</div>
            <div><span class="text-emerald-400">txtNombre</span>.setPromptText(<span class="text-emerald-300">"Ingresa..."</span>);</div>
            <div><span class="text-emerald-400">txtNombre</span>.setEditable(<span class="text-amber-300">false</span>);</div>
        </div>
    </div>

    <div class="glass p-5 rounded-xl border border-purple-500/30">
        <h4 class="font-bold text-purple-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-computer-mouse text-purple-400"></i> Button & ActionEvent
        </h4>
        <p class="text-xs text-slate-400 mb-3">Dispara eventos al hacer clic o presionar Enter.</p>
        <div class="bg-black/50 p-3 rounded-lg font-mono text-[11px] text-slate-200 space-y-1">
            <div><span class="text-purple-400">btnCalcular</span>.setDisable(<span class="text-amber-300">true</span>);</div>
            <div><span class="text-purple-400">btnCalcular</span>.setText(<span class="text-emerald-300">"Guardando..."</span>);</div>
            <div>Button b = (Button) event.getSource();</div>
            <div>String textoBtn = b.getText();</div>
        </div>
    </div>
</div>

<div class="glass p-6 rounded-xl border-l-4 border-l-sky-500 mb-8">
    <h4 class="font-bold text-sky-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-bolt text-sky-400"></i> ¿Qué es <code>ActionEvent</code> y para qué sirve?
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed mb-3">
        Cuando un usuario hace clic en un botón, JavaFX crea un objeto <code>ActionEvent</code>. Mediante <code>event.getSource()</code> puedes saber <strong>exactamente qué botón fue presionado</strong>. Esto es sumamente útil porque te permite conectar <strong>muchos botones distintos al mismo método manejador</strong> sin tener que crear un método por cada botón.
    </p>
    <div class="bg-black/60 p-3 rounded-lg font-mono text-xs text-slate-200">
        <span class="text-sky-400">@FXML</span><br>
        <span class="text-purple-400">private void</span> <span class="text-blue-300">onBotonPresionado</span>(ActionEvent event) {<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Button boton = (Button) event.getSource(); <span class="text-slate-500">// Obtenemos el botón origen</span><br>
        &nbsp;&nbsp;&nbsp;&nbsp;String texto = boton.getText(); <span class="text-slate-500">// Obtenemos su etiqueta ("1", "2", "+", etc.)</span><br>
        }
    </div>
</div>

<!-- 4. EJEMPLO COMPLETO: CALCULADORA BÁSICA (BUFFER, STRING Y PARSEO) -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-calculator text-amber-400"></i> 4. Ejemplo Práctico: Calculadora con <code>StringBuilder</code> y <code>ActionEvent</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    A continuación se muestra un ejemplo clásico y completo de una <strong>calculadora</strong>. Observa cómo usamos <code>StringBuilder</code> como buffer para concatenar los dígitos conforme el usuario pulsa botones, luego parseamos a números (<code>Double.parseDouble</code>) al realizar operaciones y actualizamos el <code>TextField</code> de salida:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-amber-300 text-sm"></i> CalculadoraController.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;

public class CalculadoraController {

    // Controles vinculados con fx:id desde Scene Builder
    @FXML private TextField txtPantalla;
    @FXML private Label lblOperacionPrevia;

    // Buffer en memoria para acumular los caracteres del número actual
    private StringBuilder bufferActual = new StringBuilder();
    private double primerOperando = 0.0;
    private String operador = "";
    private boolean inicioNuevoNumero = true;

    /**
     * UN SOLO MÉTODO PARA TODOS LOS DÍGITOS (0 al 9 y punto decimal).
     * En Scene Builder, asigna #onDigitoClick al "On Action" de todos los botones numéricos.
     */
    @FXML
    private void onDigitoClick(ActionEvent event) {
        Button btnPresionado = (Button) event.getSource();
        String digito = btnPresionado.getText();

        // Evitar múltiples puntos decimales
        if (digito.equals(".") && bufferActual.toString().contains(".")) {
            return;
        }

        if (inicioNuevoNumero) {
            bufferActual.setLength(0); // Limpiar buffer si empezamos un nuevo número
            inicioNuevoNumero = false;
        }

        // Concatenamos el dígito al buffer
        bufferActual.append(digito);
        
        // Reflejamos en la pantalla de texto
        txtPantalla.setText(bufferActual.toString());
    }

    /**
     * Maneja los operadores (+, -, *, /)
     */
    @FXML
    private void onOperacionClick(ActionEvent event) {
        if (bufferActual.length() == 0 && txtPantalla.getText().isEmpty()) return;

        Button btnOp = (Button) event.getSource();
        operador = btnOp.getText();

        // Convertimos el String del buffer a double para operar
        primerOperando = Double.parseDouble(txtPantalla.getText());
        lblOperacionPrevia.setText(primerOperando + " " + operador);
        inicioNuevoNumero = true;
    }

    /**
     * Calcula el resultado final al pulsar '='
     */
    @FXML
    private void onIgualClick(ActionEvent event) {
        if (operador.isEmpty() || bufferActual.length() == 0) return;

        double segundoOperando = Double.parseDouble(bufferActual.toString());
        double resultado = 0.0;

        switch (operador) {
            case "+": resultado = primerOperando + segundoOperando; break;
            case "-": resultado = primerOperando - segundoOperando; break;
            case "*": resultado = primerOperando * segundoOperando; break;
            case "/": 
                if (segundoOperando == 0) {
                    txtPantalla.setText("Error: Div 0");
                    lblOperacionPrevia.setText("");
                    bufferActual.setLength(0);
                    inicioNuevoNumero = true;
                    return;
                }
                resultado = primerOperando / segundoOperando; 
                break;
        }

        // Convertimos el resultado numérico a String para la UI
        txtPantalla.setText(String.valueOf(resultado));
        lblOperacionPrevia.setText(primerOperando + " " + operador + " " + segundoOperando + " =");

        // Preparamos para continuar operando con el resultado
        bufferActual.setLength(0);
        bufferActual.append(resultado);
        operador = "";
        inicioNuevoNumero = true;
    }

    /**
     * Limpia la pantalla y resetea el estado (Botón C)
     */
    @FXML
    private void onLimpiarClick(ActionEvent event) {
        bufferActual.setLength(0);
        primerOperando = 0.0;
        operador = "";
        txtPantalla.setText("0");
        lblOperacionPrevia.setText("");
        inicioNuevoNumero = true;
    }
}</code></pre>
</div>

<!-- 5. INICIALIZABLE VS CONSTRUCTOR -->
<h3 class="text-2xl font-bold text-rose-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-code-compare text-rose-400"></i> 5. <code>Initializable</code> vs Constructor: Diferencias Clave
</h3>

<div class="glass p-6 rounded-xl border-l-4 border-l-rose-500 mb-6">
    <h4 class="font-bold text-rose-400 mb-2">¡Cuidado con el <code>NullPointerException</code>!</h4>
    <p class="text-xs text-slate-300 leading-relaxed">
        Cuando <code>FXMLLoader</code> procesa un archivo FXML, primero ejecuta el <strong>Constructor</strong> de la clase controladora. En este momento exacto, las variables con la anotación <code>@FXML</code> aún <strong>son <code>null</code></strong> porque el archivo FXML todavía no ha inyectado los nodos en las variables. Por eso, <strong>NUNCA</strong> intentes hacer cosas como <code>txtPantalla.setText()</code> o <code>cmbItems.setItems()</code> en el constructor.
    </p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="glass p-5 rounded-xl border border-rose-500/30">
        <h4 class="font-bold text-rose-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-ban text-rose-400"></i> En el Constructor
        </h4>
        <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Los campos <code>@FXML</code> son <code>null</code>.</li>
            <li>No accedas a botones, tablas o combos aquí (lanzará NullPointerException).</li>
            <li>Úsalo solo para instanciar estructuras puras de Java (ej. inicializar un ArrayList o inyección de dependencias).</li>
        </ul>
    </div>
    <div class="glass p-5 rounded-xl border border-emerald-500/30">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-400"></i> En <code>initialize()</code>
        </h4>
        <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Todos los campos <code>@FXML</code> ya están enlazados e inyectados.</li>
            <li>Es el lugar idóneo para llenar <strong>ComboBox</strong>, configurar <strong>TableView</strong> y añadir listeners.</li>
            <li>Se ejecuta automáticamente de forma garantizada tras cargar la vista.</li>
        </ul>
    </div>
</div>

<!-- 6. EJEMPLO COMBOBOX & INITIALIZABLE -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-list-check text-purple-400"></i> 6. Uso de <code>Initializable</code> con ComboBox y Objetos Personalizados
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para poblar un <code>ComboBox</code> con objetos complejos (no solo Strings simples) y controlar exactamente qué propiedad se muestra sin depender únicamente del método <code>toString()</code>, utilizamos <code>setCellFactory</code> y <code>setButtonCell</code> dentro de <code>initialize</code>:
</p>

<!-- Modelo de Datos -->
<div class="code-wrapper relative pt-6 mb-6">
    <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-blue-300 text-sm"></i> Categoria.java (Modelo)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">public class Categoria {
    private int id;
    private String nombre;

    public Categoria(int id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public int getId() { return id; }
    public String getNombre() { return nombre; }

    @Override
    public String toString() {
        return nombre; // Respaldo básico
    }
}</code></pre>
</div>

<!-- Controlador con Initializable -->
<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> FormularioController.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import java.net.URL;
import java.util.ResourceBundle;

public class FormularioController implements Initializable {

    @FXML private ComboBox<Categoria> cmbCategorias;
    @FXML private Label lblSeleccion;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // 1. Crear la lista observable de elementos
        ObservableList<Categoria> categorias = FXCollections.observableArrayList(
            new Categoria(1, "Tecnología y Gadgets"),
            new Categoria(2, "Libros y Educación"),
            new Categoria(3, "Hogar y Muebles")
        );

        // 2. Asignar los elementos al ComboBox
        cmbCategorias.setItems(categorias);

        // 3. Personalizar cómo se ven los ítems en el menú desplegable (CellFactory)
        cmbCategorias.setCellFactory(param -> new ListCell<Categoria>() {
            @Override
            protected void updateItem(Categoria item, boolean empty) {
                super.updateItem(item, empty);
                setText((empty || item == null) ? null : item.getId() + " - " + item.getNombre());
            }
        });

        // 4. Personalizar cómo se muestra el ítem seleccionado en el botón cerrado
        cmbCategorias.setButtonCell(new ListCell<Categoria>() {
            @Override
            protected void updateItem(Categoria item, boolean empty) {
                super.updateItem(item, empty);
                setText((empty || item == null) ? null : item.getNombre());
            }
        });

        // 5. Escuchar cambios de selección
        cmbCategorias.getSelectionModel().selectedItemProperty().addListener((obs, anterior, seleccionado) -> {
            if (seleccionado != null) {
                lblSeleccion.setText("Elegiste: " + seleccionado.getNombre() + " (ID: " + seleccionado.getId() + ")");
            }
        });
    }
}</code></pre>
</div>

<!-- 7. LANZADORES Y MULTIPANTALLA -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-arrows-split-up-and-left text-blue-400"></i> 7. Gestión de Múltiples Escenas y Ventanas (Launchers)
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    En aplicaciones del mundo real existen dos patrones principales para la navegación:
</p>

<!-- Patrón 1: Cambiar Escena en la Misma Ventana -->
<div class="glass p-6 rounded-xl border border-blue-500/20 mb-6">
    <h4 class="font-bold text-blue-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-arrow-right-arrow-left"></i> Opción A: Cambiar Escena en la Misma Ventana
    </h4>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
        Consiste en reemplazar el <code>Scene</code> actual del <code>primaryStage</code> por uno nuevo.
    </p>

    <div class="code-wrapper relative pt-6 mb-2">
        <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-blue-300 text-sm"></i> NavegacionController.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import java.io.IOException;

public class MenuController {

    @FXML
    private void onIrADetalle(ActionEvent event) {
        try {
            // Cargar el nuevo FXML
            Parent root = FXMLLoader.load(getClass().getResource("/vistas/DetalleView.fxml"));
            
            // Obtener el Stage actual desde el evento del botón
            Stage stage = (Stage) ((Node) event.getSource()).getScene().getWindow();
            
            // Reemplazar la escena actual
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}</code></pre>
    </div>
</div>

<!-- Patrón 2: Abrir Nueva Ventana / Modal -->
<div class="glass p-6 rounded-xl border border-emerald-500/20 mb-8">
    <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-window-restore"></i> Opción B: Lanzar una Nueva Ventana (Modal o Secundaria)
    </h4>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
        Crea un nuevo objeto <code>Stage</code>. Usando <code>initModality(Modality.APPLICATION_MODAL)</code> bloqueas la ventana padre hasta que el usuario cierre el diálogo emergente.
    </p>

    <div class="code-wrapper relative pt-6 mb-2">
        <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-emerald-300 text-sm"></i> LanzadorModal.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Modality;
import javafx.stage.Stage;
import java.io.IOException;

public class LauncherHelper {

    public static void abrirVentanaModal(String rutaFxml, String titulo, Stage ownerStage) {
        try {
            FXMLLoader loader = new FXMLLoader(LauncherHelper.class.getResource(rutaFxml));
            Parent root = loader.load();

            Stage modalStage = new Stage();
            modalStage.setTitle(titulo);
            modalStage.setScene(new Scene(root));
            
            // Configurar como ventana modal dependiente del padre
            modalStage.initModality(Modality.WINDOW_MODAL);
            modalStage.initOwner(ownerStage);
            modalStage.setResizable(false);
            
            modalStage.showAndWait(); // Espera a que se cierre
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}</code></pre>
    </div>
</div>

<!-- 8. CLASE PRINCIPAL APPLICATION -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-rocket text-cyan-400"></i> 8. Clase Principal: <code>Application</code> y Método <code>start()</code>
</h3>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-cyan-300 text-sm"></i> App.java (Entry Point)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class App extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception {
        // Carga la vista principal diseñada en Scene Builder
        Parent root = FXMLLoader.load(getClass().getResource("/vistas/MainView.fxml"));
        
        Scene scene = new Scene(root);
        primaryStage.setTitle("Sistema JavaFX Profesional");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args); // Lanza el ciclo de vida JavaFX
    }
}</code></pre>
</div>

<!-- 9. RESUMEN Y CHECKLIST -->
<div class="glass p-6 rounded-xl border border-white/10 mt-10">
    <h4 class="font-bold text-white mb-3 flex items-center gap-2">
        <i class="fa-solid fa-clipboard-check text-cyan-400"></i> Checklist Rápido para Evitar Errores Comunes
    </h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
        <div class="flex items-start gap-2">
            <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
            <span><strong>fx:id repetido o ausente:</strong> Asegúrate de que el fx:id en Scene Builder coincida exactamente con el nombre de la variable anotada con <code>@FXML</code> en Java.</span>
        </div>
        <div class="flex items-start gap-2">
            <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
            <span><strong>Ruta del FXML:</strong> Comprueba siempre que el archivo FXML esté dentro del directorio de recursos (ej: <code>src/main/resources/</code>).</span>
        </div>
        <div class="flex items-start gap-2">
            <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
            <span><strong>Visibilidad de @FXML:</strong> Los campos y métodos pueden ser <code>private</code> siempre que lleven la anotación <code>@FXML</code>.</span>
        </div>
        <div class="flex items-start gap-2">
            <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
            <span><strong>Platform.runLater():</strong> Si actualizas componentes visuales desde hilos secundarios o tareas en segundo plano, siempre envuélvelo en <code>Platform.runLater(() -&gt; { ... })</code>.</span>
        </div>
    </div>
</div>
`,L=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-table-columns"></i></span>
    15. JavaFX Avanzado: TableView, Alertas y UI Dinámica
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    Al construir sistemas completos como <strong>BlockBusterUIX</strong> o el gestor de <strong>Café (BaseDatos)</strong>, necesitamos ir más allá de botones y cajas de texto simples. En esta sección aprenderás a mostrar colecciones y jerarquías de herencia en un <code>TableView</code>, capturar números con <code>Spinner</code>, mostrar diálogos con <code>Alert</code>, alternar paneles dinámicos y compartir datos entre ventanas con el patrón <strong>Singleton</strong>.
</p>

<!-- 1. TABLEVIEW CON PROPERTYVALUEFACTORY -->
<h3 class="text-2xl font-bold text-indigo-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-table text-indigo-400"></i> 1. <code>TableView</code> Estándar con <code>PropertyValueFactory</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Un <code>TableView&lt;T&gt;</code> muestra una lista de objetos en filas y columnas. La forma más directa de enlazar cada columna (<code>TableColumn</code>) con un atributo de tu clase POJO es mediante <code>PropertyValueFactory&lt;&gt;("nombreAtributo")</code>, que utiliza reflexión internamente para buscar el método getter correspondiente (por ejemplo, <code>getSigla()</code> o <code>getNombre()</code>).
</p>

<div class="glass p-5 rounded-xl border-l-4 border-l-amber-500 mb-6">
    <h4 class="font-bold text-amber-300 mb-1 flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> Regla Crítica en <code>module-info.java</code> para Tablas
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed">
        Para que <code>PropertyValueFactory</code> pueda leer los getters de tus objetos por reflexión sin lanzar un <code>IllegalAccessException</code> o dejar las celdas en blanco, <strong>debes abrir el paquete de tus modelos/controladores a <code>javafx.base</code></strong> dentro de tu archivo <code>module-info.java</code>:
    </p>
    <div class="bg-black/60 p-3 rounded-lg font-mono text-xs text-emerald-300 mt-2">
        opens com.example.basedatos.POJO;<br>
        opens controlador to javafx.fxml, javafx.base;
    </div>
</div>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-indigo-500/20 text-indigo-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-indigo-300 text-sm"></i> TablaControler.java y Carrera.java (Proyecto BlockBusterUIX)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package controlador;

import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.input.MouseEvent;
import java.net.URL;
import java.util.LinkedList;
import java.util.ResourceBundle;

public class TablaControler implements Initializable {

    @FXML private TableView<Carrera> tablaCarrera;
    @FXML private ComboBox<Carrera> comboCarrera;
    @FXML private Label carreraSeleccionada;

    private LinkedList<Carrera> listaCarreras = new LinkedList<>();

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        listaCarreras.add(new Carrera("LSIA", "Licenciatura en Sistemas de Información Administrativa"));
        listaCarreras.add(new Carrera("LART", "Licenciatura en Artes"));
        listaCarreras.add(new Carrera("LCC", "Licenciatura en Ciencias de la Computación"));
        listaCarreras.add(new Carrera("LISC", "Ingeniería en Sistemas Computacionales"));

        // 1. Definir las columnas y vincularlas con el nombre del atributo (busca getSigla() y getNombre())
        TableColumn<Carrera, String> tcSigla = new TableColumn<>("Siglas");
        tcSigla.setCellValueFactory(new PropertyValueFactory<>("sigla"));

        TableColumn<Carrera, String> tcNombre = new TableColumn<>("Nombre");
        tcNombre.setCellValueFactory(new PropertyValueFactory<>("nombre"));

        // 2. Asignar las columnas al TableView
        tablaCarrera.getColumns().setAll(tcSigla, tcNombre);

        // 3. Cargar los objetos de la LinkedList en la tabla y el ComboBox
        tablaCarrera.getItems().addAll(listaCarreras);
        comboCarrera.getItems().addAll(listaCarreras);
    }

    // Evento asignado en Scene Builder -> TableView -> On Mouse Clicked: #clicCarrera
    @FXML
    public void clicCarrera(MouseEvent mouseEvent) {
        Carrera carrera = tablaCarrera.getSelectionModel().getSelectedItem();
        if (carrera != null) {
            comboCarrera.setValue(carrera); // Sincroniza el ComboBox con la fila clicada
            carreraSeleccionada.setText("Seleccionado: " + carrera.toString());
        }
    }

    @FXML
    public void clicLimpiar() {
        tablaCarrera.getSelectionModel().clearSelection();
        comboCarrera.getSelectionModel().clearSelection();
        comboCarrera.setValue(null);
        carreraSeleccionada.setText("");
    }
}</code></pre>
</div>

<!-- 2. TABLEVIEW POLIMÓRFICO CON CALLBACK E INSTANCEOF -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-sitemap text-purple-400"></i> 2. <code>TableView</code> Polimórfico con <code>Callback</code> y <code>SimpleStringProperty</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    ¿Qué sucede cuando tu lista almacena una clase padre abstracta (como <code>LinkedList&lt;Producto&gt;</code> en <strong>BlockBusterUIX</strong>) que contiene subclases distintas (<code>Juguete</code>, <code>ProductoDigital</code>, <code>Videojuego</code>, <code>Pelicula</code>)? Si usas <code>PropertyValueFactory</code> para una columna como <em>"Plataforma"</em> (que solo existe en <code>Videojuego</code>), fallará en las filas que sean <code>Juguete</code> o <code>Pelicula</code>.
</p>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    La solución empleada en <code>VerInventarioControlador.java</code> consiste en usar un <code>Callback</code> con <code>SimpleStringProperty</code> y verificar el tipo real de cada fila usando <code>instanceof</code>. Si el producto pertenece a esa subclase, hacemos downcasting y extraemos el dato; si no, mostramos un guion <code>"-"</code>:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> VerInventarioControlador.java (Proyecto BlockBusterUIX)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package controlador;

import CodigoClases.almacen.Almacen;
import CodigoClases.modelo.*;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.value.ObservableValue;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.input.MouseEvent;
import javafx.util.Callback;
import java.net.URL;
import java.util.ResourceBundle;

public class VerInventarioControlador implements Initializable {
    @FXML private TableView<Producto> tablaProductos;
    @FXML private Label labelProducto;

    private Almacen BlockBuster = Almacen.getInstance();

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Columna común de la superclase Producto
        TableColumn<Producto, String> tcsku = new TableColumn<>("SKU");
        tcsku.setCellValueFactory(new Callback<TableColumn.CellDataFeatures<Producto, String>, ObservableValue<String>>() {
            @Override
            public ObservableValue<String> call(TableColumn.CellDataFeatures<Producto, String> param) {
                Producto objetoProducto = param.getValue();
                return new SimpleStringProperty(objetoProducto.getSKU());
            }
        });

        // Columna exclusiva de la subclase Juguete
        TableColumn<Producto, String> tcmarca = new TableColumn<>("Marca");
        tcmarca.setCellValueFactory(new Callback<TableColumn.CellDataFeatures<Producto, String>, ObservableValue<String>>() {
            @Override
            public ObservableValue<String> call(TableColumn.CellDataFeatures<Producto, String> param) {
                Producto objetoProducto = param.getValue();
                if (objetoProducto instanceof Juguete) {
                    Juguete objetoJuguete = (Juguete) objetoProducto;
                    return new SimpleStringProperty(objetoJuguete.getMarca());
                }
                return new SimpleStringProperty("-"); // No aplica para Películas o Videojuegos
            }
        });

        // Columna de la subclase intermedia ProductoDigital (aplica a Pelicula y Videojuego)
        TableColumn<Producto, String> tctitulo = new TableColumn<>("Título");
        tctitulo.setCellValueFactory(new Callback<TableColumn.CellDataFeatures<Producto, String>, ObservableValue<String>>() {
            @Override
            public ObservableValue<String> call(TableColumn.CellDataFeatures<Producto, String> param) {
                Producto objetoProducto = param.getValue();
                if (objetoProducto instanceof ProductoDigital) {
                    ProductoDigital pd = (ProductoDigital) objetoProducto;
                    return new SimpleStringProperty(pd.getTitulo());
                }
                return new SimpleStringProperty("-");
            }
        });

        // Columna exclusiva de Videojuego
        TableColumn<Producto, String> tcplataforma = new TableColumn<>("Plataforma");
        tcplataforma.setCellValueFactory(new Callback<TableColumn.CellDataFeatures<Producto, String>, ObservableValue<String>>() {
            @Override
            public ObservableValue<String> call(TableColumn.CellDataFeatures<Producto, String> param) {
                Producto objetoProducto = param.getValue();
                if (objetoProducto instanceof Videojuego) {
                    return new SimpleStringProperty(((Videojuego) objetoProducto).getPlataforma());
                }
                return new SimpleStringProperty("-");
            }
        });

        // Columna exclusiva de Pelicula
        TableColumn<Producto, String> tcduracion = new TableColumn<>("Duración");
        tcduracion.setCellValueFactory(new Callback<TableColumn.CellDataFeatures<Producto, String>, ObservableValue<String>>() {
            @Override
            public ObservableValue<String> call(TableColumn.CellDataFeatures<Producto, String> param) {
                Producto objetoProducto = param.getValue();
                if (objetoProducto instanceof Pelicula) {
                    return new SimpleStringProperty(String.valueOf(((Pelicula) objetoProducto).getDuracion()));
                }
                return new SimpleStringProperty("-");
            }
        });

        tablaProductos.getColumns().addAll(tcsku, tcmarca, tctitulo, tcplataforma, tcduracion);
        tablaProductos.getItems().addAll(BlockBuster.getInventario());
    }

    @FXML
    public void cliclProducto(MouseEvent mouseEvent) {
        Producto producto = tablaProductos.getSelectionModel().getSelectedItem();
        if (producto != null) {
            labelProducto.setText(producto.lineaTexto("|"));
        }
    }
}</code></pre>
</div>

<!-- 3. PANELES DINÁMICOS, SPINNER, VARARGS Y ALERTAS -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-sliders text-emerald-400"></i> 3. Paneles Dinámicos, <code>Spinner</code>, <code>Alert</code> y Validación con Varargs
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    En <code>AgregarProductoControlador.java</code> (<strong>BlockBusterUIX</strong>) se combinan cuatro técnicas esenciales para formularios profesionales:
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="glass p-5 rounded-xl border-t-4 border-t-emerald-500">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-eye-slash"></i> 1. Paneles Dinámicos en un <code>StackPane</code>
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Se colocan varios <code>GridPane</code> (<code>panelJuguetes</code>, <code>panelVideojuegos</code>, <code>panelPeliculas</code>) dentro de un <code>StackPane</code>. Para ocultarlos completamente y que no ocupen espacio en el layout, se invoca tanto <code>setVisible(false)</code> como <code>setManaged(false)</code>.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-cyan-500">
        <h4 class="font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-arrow-up-9-1"></i> 2. Controles Numéricos <code>Spinner&lt;Integer&gt;</code>
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Un <code>Spinner</code> no funciona hasta que le asignas su fábrica de valores en <code>initialize()</code> mediante:<br>
            <code>new SpinnerValueFactory.IntegerSpinnerValueFactory(min, max, valorInicial)</code>.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-amber-500">
        <h4 class="font-bold text-amber-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-bell"></i> 3. Ventanas de Alerta (<code>Alert</code>)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Reemplazan a <code>System.out.println</code> en interfaces gráficas. Soportan tipos como <code>AlertType.INFORMATION</code>, <code>WARNING</code>, <code>ERROR</code> y <code>CONFIRMATION</code>. Con <code>showAndWait()</code> pausan el flujo hasta que el usuario pulsa <code>ButtonType.OK</code>.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-pink-500">
        <h4 class="font-bold text-pink-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-ellipsis"></i> 4. Validación Limpia con Varargs (<code>TextField...</code>)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            El método <code>camposEstanLlenos(TextField... campos)</code> recibe cualquier cantidad de <code>TextField</code> separados por comas y verifica en un solo bucle que ninguno esté vacío.
        </p>
    </div>
</div>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> AgregarProductoControlador.java (Fragmento Clave)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">@Override
public void initialize(URL location, ResourceBundle resources) {
    comboTipoProductos.getItems().setAll(listaOpcionesTipo);
    ocultarPaneles();

    // Configurar rangos (mínimo, máximo, valor inicial) de cada Spinner
    edicionJuguete.setValueFactory(new SpinnerValueFactory.IntegerSpinnerValueFactory(1, 100, 1));
    anioVideojuego.setValueFactory(new SpinnerValueFactory.IntegerSpinnerValueFactory(1900, 3000, 2026));
    anioPelicula.setValueFactory(new SpinnerValueFactory.IntegerSpinnerValueFactory(1900, 3000, 2026));
    duracionPelicula.setValueFactory(new SpinnerValueFactory.IntegerSpinnerValueFactory(1, 500, 120));
}

public void ocultarPaneles() {
    panelJuguetes.setVisible(false);
    panelJuguetes.setManaged(false);
    panelVideojuegos.setVisible(false);
    panelVideojuegos.setManaged(false);
    panelPeliculas.setVisible(false);
    panelPeliculas.setManaged(false);
}

// Validación reutilizable con argumentos variables (Varargs)
private boolean camposEstanLlenos(TextField... campos) {
    for (TextField campo : campos) {
        if (campo.getText() == null || campo.getText().trim().isEmpty()) {
            Alert alertaError = new Alert(Alert.AlertType.WARNING);
            alertaError.setTitle("Campos incompletos");
            alertaError.setHeaderText("No se pudo agregar el producto");
            alertaError.setContentText("Completa todos los campos requeridos.");
            alertaError.showAndWait();
            return false;
        }
    }
    return true;
}

// Cerrar la ventana modal actual al confirmar el Alert
private void cerrarVentana() {
    Stage stage = (Stage) comboTipoProductos.getScene().getWindow();
    stage.close();
}</code></pre>
</div>

<!-- 4. COMPARTIR ESTADO ENTRE VENTANAS CON SINGLETON -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-share-nodes text-cyan-400"></i> 4. Compartir Datos entre Controladores con el Patrón Singleton
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Cuando abres una ventana secundaria (como <code>AgregarProducto.fxml</code> o <code>VerInventario.fxml</code> desde <code>MainMenuControlador</code>), JavaFX instancia un <strong>nuevo objeto controlador</strong> para esa vista. Si cada controlador hiciera <code>new Almacen()</code>, cada ventana tendría su propia lista vacía independiente.
</p>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    En <strong>BlockBusterUIX</strong>, la clase <code>Almacen</code> aplica el patrón <strong>Singleton</strong> (constructor <code>private</code> y método estático <code>Almacen.getInstance()</code>) para garantizar que todas las ventanas lean y modifiquen exactamente el mismo inventario en memoria:
</p>

<div class="code-wrapper relative pt-6 mb-6">
    <div class="absolute top-0 left-0 bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-cyan-300 text-sm"></i> Almacen.java (Singleton compartido por toda la aplicación)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package CodigoClases.almacen;

import CodigoClases.modelo.Producto;
import java.util.LinkedList;

public class Almacen {
    private LinkedList<Producto> Inventario = new LinkedList<>();
    private static Almacen BlockBuster; // Única instancia estática

    // 1. Constructor privado: nadie fuera de esta clase puede hacer "new Almacen()"
    private Almacen() {
    }

    // 2. Punto de acceso global: crea la instancia solo la primera vez que se llama
    public static Almacen getInstance() {
        if (BlockBuster == null) {
            BlockBuster = new Almacen();
        }
        return BlockBuster;
    }

    public void agregarProducto(Producto producto) {
        Inventario.add(producto);
    }

    public LinkedList<Producto> getInventario() {
        return Inventario;
    }
}</code></pre>
</div>
`,j=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-amber-500/20 text-amber-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-sliders"></i></span>
    16. Archivos de Propiedades (<code>.properties</code>) y <code>Locale</code>
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    Nunca debes escribir contraseñas, URLs de servidores o parámetros de configuración directamente quemados (<em>hardcoded</em>) dentro de tus clases Java. Si la dirección de la base de datos cambia en producción, tendrías que recompilar todo el proyecto. Para resolver esto, Java incluye la clase <code>java.util.Properties</code> y el manejo de configuración regional con <code>java.util.Locale</code>.
</p>

<!-- 1. QUÉ ES UN ARCHIVO .PROPERTIES -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-file-lines text-amber-400"></i> 1. Estructura de un Archivo <code>.properties</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Un archivo <code>.properties</code> es un fichero de texto plano donde cada línea almacena un par <code>clave=valor</code>. Las líneas que comienzan con almohadilla (<code>#</code>) son comentarios ignorados por Java. En el proyecto <strong>BaseDatos</strong> se utilizan dos archivos clave:
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-solid fa-gear text-amber-300 text-sm"></i> config.properties (En la raíz del proyecto)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-ini">#pues chad no?
#Sun Nov 08 21:20:36 CST 2026
app.debug=true
app.nombre=Skibidi app
app.version=67.67.1</code></pre>
    </div>

    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-solid fa-database text-cyan-300 text-sm"></i> src/main/resources/database.properties
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-ini"># Configuracion de conexion a la base de datos MySQL (Servidor)
db.url=jdbc:mysql://localhost:3306/informacion_db
db.user=root
db.password=

# Configuracion de conexion local de respaldo (SQLite)
db.local.url=jdbc:sqlite:informacion.db</code></pre>
    </div>
</div>

<!-- 2. CREAR Y GUARDAR PROPIEDADES -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-floppy-disk text-emerald-400"></i> 2. Crear y Guardar un Archivo <code>.properties</code> desde Java
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Con <code>setProperty(clave, valor)</code> defines las claves en memoria y con <code>store(FileOutputStream, comentario)</code> generas automáticamente el archivo físico en disco incluyendo la fecha y el comentario de cabecera:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> CrearPropiedad.java (Proyecto BaseDatos)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos.Propiedades;

import java.io.FileOutputStream;
import java.util.Properties;

public class CrearPropiedad {
    public static void main(String[] args) {
        Properties propiedad = new Properties();
        
        // Asignamos pares clave -> valor (siempre como Strings)
        propiedad.setProperty("app.nombre", "Skibidi app");
        propiedad.setProperty("app.version", "67.67.1");
        propiedad.setProperty("app.debug", "true");

        // try-with-resources cierra el FileOutputStream automáticamente
        try (FileOutputStream fos = new FileOutputStream("config.properties")) {
            propiedad.store(fos, "pues chad no?");
            System.out.println("Archivo config.properties generado con éxito.");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}</code></pre>
</div>

<!-- 3. LEER PROPIEDADES -->
<h3 class="text-2xl font-bold text-sky-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-folder-open text-sky-400"></i> 3. Cargar Propiedades: Disco vs Classpath (<code>resources</code>)
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Existen dos maneras de leer un archivo <code>.properties</code> dependiendo de dónde esté ubicado:
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="glass p-5 rounded-xl border border-sky-500/30">
        <h4 class="font-bold text-sky-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-hard-drive text-sky-400"></i> A. Con <code>FileInputStream</code> (Raíz del proyecto)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Ideal cuando el archivo <code>config.properties</code> está fuera del JAR (en la carpeta de trabajo del usuario) y quieres que pueda modificarse y guardarse en tiempo de ejecución.
        </p>
    </div>
    <div class="glass p-5 rounded-xl border border-purple-500/30">
        <h4 class="font-bold text-purple-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-box-archive text-purple-400"></i> B. Con <code>getResourceAsStream</code> (Carpeta <code>resources</code>)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Ideal cuando el archivo (como <code>/database.properties</code>) vive dentro de <code>src/main/resources</code> y viaja empaquetado dentro del ejecutable o classpath de Maven.
        </p>
    </div>
</div>

<div class="code-wrapper relative pt-6 mb-6">
    <div class="absolute top-0 left-0 bg-sky-500/20 text-sky-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-sky-300 text-sm"></i> CargarPropiedades.java (Lectura y parseo de tipos)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos.Propiedades;

import java.io.FileInputStream;
import java.util.Properties;

public class CargarPropiedades {
    public static void main(String[] args) {
        String nombre = "";
        String version = "";
        Boolean debug = true;
        Properties propiedad = new Properties();

        try (FileInputStream fis = new FileInputStream("config.properties")) {
            propiedad.load(fis);
            nombre = propiedad.getProperty("app.nombre");
            version = propiedad.getProperty("app.version");
            // Como getProperty devuelve String, convertimos a boolean con Boolean.parseBoolean
            debug = Boolean.parseBoolean(propiedad.getProperty("app.debug"));
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }

        System.out.printf("%s %s %b%n", nombre, version, debug);
    }
}</code></pre>
</div>

<div class="glass p-5 rounded-xl border-l-4 border-l-purple-500 mb-8">
    <h4 class="font-bold text-purple-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-shield-halved text-purple-400"></i> Uso de Valores por Defecto (Fallback) en <code>getProperty</code>
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed mb-3">
        El método sobrecargado <code>propiedades.getProperty("clave", "valorPorDefecto")</code> devuelve el segundo argumento si la clave no existe en el archivo. En <code>Datos.java</code> se encadena para soportar distintos nombres de clave o un valor de respaldo seguro:
    </p>
    <div class="bg-black/60 p-3 rounded-lg font-mono text-xs text-slate-200">
        String urlServer = propiedades.getProperty(<span class="text-emerald-300">"db.url"</span>, propiedades.getProperty(<span class="text-emerald-300">"url"</span>, <span class="text-amber-300">"jdbc:mysql://localhost:3306/informacion_db"</span>));<br>
        String user = propiedades.getProperty(<span class="text-emerald-300">"db.user"</span>, <span class="text-amber-300">"root"</span>);<br>
        String urlLocal = propiedades.getProperty(<span class="text-emerald-300">"db.local.url"</span>, <span class="text-amber-300">"jdbc:sqlite:informacion.db"</span>);
    </div>
</div>

<!-- 4. CONFIGURACIÓN REGIONAL (LOCALE) Y EL PROBLEMA DEL PUNTO DECIMAL EN SQL -->
<h3 class="text-2xl font-bold text-rose-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-earth-americas text-rose-400"></i> 4. <code>java.util.Locale</code> y el Peligro de <code>%f</code> en Consultas SQL
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    La clase <code>Locale</code> define la convención regional e idioma de la JVM (formato de fechas, monedas y <strong>separador decimal</strong>). Observa el experimento del archivo <code>EjemploLocales.java</code> del repositorio <strong>BaseDatos</strong>:
</p>

<div class="code-wrapper relative pt-6 mb-6">
    <div class="absolute top-0 left-0 bg-rose-500/20 text-rose-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-rose-300 text-sm"></i> EjemploLocales.java (Proyecto BaseDatos)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos.Locales;

import java.util.Locale;

public class EjemploLocales {
    public static void main(String[] args) {
        float valor = 1.5f;

        // En España (es_ES) y varios países hispanohablantes, el separador decimal es la COMA (,)
        Locale.setDefault(new Locale("es", "ES"));
        System.out.println("Con Locale es_ES: " + String.format("%f", valor)); // Imprime: 1,500000

        // En EE.UU. (en_US) y México (es_MX), el separador decimal es el PUNTO (.)
        Locale.setDefault(Locale.US);
        System.out.println("Con Locale US:    " + String.format("%f", valor)); // Imprime: 1.500000
    }
}</code></pre>
</div>

<div class="glass p-6 rounded-xl border-l-4 border-l-rose-500 mb-8">
    <h4 class="font-bold text-rose-400 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-bug"></i> ¿Por qué <code>Locale</code> puede romper tus <code>INSERT</code> o <code>UPDATE</code> en SQL?
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed mb-3">
        En <code>AdmonCafe.java</code>, la consulta SQL se construye con <code>String.format</code>:
    </p>
    <div class="bg-black/60 p-3 rounded-lg font-mono text-xs text-slate-200 mb-3">
        String consulta = String.format(<span class="text-emerald-300">"INSERT INTO Cafe(Productor, VariedadCafe, Cantidad) VALUES('%s', %d, %f)"</span>, productor, variedad, cantidad);
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
        Si la PC donde corre el programa tiene <code>Locale("es", "ES")</code>, entonces <code>%f</code> convierte <code>2.5f</code> en <code>2,500000</code> (con coma). La consulta resultante será:<br>
        <code class="text-rose-300">INSERT INTO Cafe(Productor, VariedadCafe, Cantidad) VALUES('FincaSol', 1, 2,500000)</code><br>
        ¡SQL interpretará la coma de <code>2,500000</code> como un <strong>cuarto valor separado</strong> y lanzará un <code>SQLException: column count doesn't match value count</code>!
        <br><br>
        <strong class="text-emerald-400">Soluciones:</strong> Pasar explícitamente <code>String.format(Locale.US, "INSERT ...", ...)</code>, configurar <code>Locale.setDefault(Locale.US)</code> al inicio del programa, o utilizar parámetros <code>?</code> con <code>PreparedStatement.setFloat()</code>.
    </p>
</div>
`,P=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-database"></i></span>
    17. Fundamentos de Bases de Datos Relacionales y SQL
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    Mientras que los archivos de texto (<code>.txt</code>, <code>.csv</code>) o binarios (<code>.dat</code>) obligan a cargar y reescribir colecciones completas en memoria, un <strong>Sistema Gestor de Bases de Datos Relacionales (RDBMS)</strong> permite almacenar, relacionar, filtrar y actualizar millones de registros de forma segura, atómica (transacciones ACID) y estructurada mediante el lenguaje estándar <strong>SQL (Structured Query Language)</strong>.
</p>

<!-- 1. CONCEPTOS TEÓRICOS FUNDAMENTALES -->
<h3 class="text-2xl font-bold text-blue-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-book-open text-blue-400"></i> 1. Conceptos Clave del Modelo Relacional
</h3>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="glass p-5 rounded-xl border-t-4 border-t-blue-500">
        <h4 class="font-bold text-blue-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-table"></i> Tabla, Fila y Columna
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Una <strong>Tabla (Entidad)</strong> equivale a una clase POJO en Java (ej. <code>Cafe</code>). Cada <strong>Columna (Atributo/Campo)</strong> representa una propiedad con su tipo de dato (<code>Productor</code>, <code>Cantidad</code>), y cada <strong>Fila (Tupla/Registro)</strong> es una instancia u objeto concreto guardado.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-emerald-500">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-key"></i> Clave Primaria (Primary Key - PK)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Identificador único e irrepetible de cada fila (ej. <code>IDCafe</code> o <code>IDVariedad</code>). Nunca puede ser <code>NULL</code>. Suele configurarse como <code>AUTOINCREMENT</code> (SQLite) o <code>AUTO_INCREMENT</code> (MySQL) para que el motor asigne el número automáticamente al insertar.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-purple-500">
        <h4 class="font-bold text-purple-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-link"></i> Clave Foránea (Foreign Key - FK)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Columna de una tabla hija que apunta a la <code>PRIMARY KEY</code> de otra tabla padre para establecer una relación y garantizar la <strong>integridad referencial</strong> (no puedes registrar un café con una variedad que no exista en <code>VariedadCafe</code>).
        </p>
    </div>
</div>

<!-- DIAGRAMA DE RELACIÓN 1:N DEL PROYECTO BASEDATOS -->
<div class="glass p-6 rounded-xl border border-white/10 mb-8">
    <h4 class="font-bold text-cyan-300 mb-3 flex items-center gap-2">
        <i class="fa-solid fa-diagram-project text-cyan-400"></i> Modelo Entidad-Relación del Proyecto <code>BaseDatos</code> (Relación 1 a Muchos - 1:N)
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed mb-4">
        En la base de datos <code>informacion.db</code> / <code>informacion_db</code> del proyecto, una <strong>Variedad de Café</strong> (ej. <em>1 - Caturra</em>, <em>2 - Negro</em>) puede estar asociada a <strong>muchos lotes de Café</strong>, pero cada lote de Café tiene una sola variedad:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        <div class="bg-black/60 p-4 rounded-xl border border-emerald-500/40">
            <div class="text-emerald-400 font-bold border-b border-white/10 pb-2 mb-2 flex justify-between">
                <span>TABLA PADRE: VariedadCafe</span>
                <span class="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px]">1</span>
            </div>
            <div class="space-y-1 text-slate-300">
                <div><i class="fa-solid fa-key text-amber-400 mr-2"></i><strong>IDVariedad</strong> : INTEGER (PK, AI)</div>
                <div><i class="fa-solid fa-font text-slate-400 mr-2"></i><strong>Descripcion</strong> : TEXT NOT NULL</div>
            </div>
            <div class="mt-3 pt-2 border-t border-white/10 text-[11px] text-slate-400">
                Ejemplo de datos: <code>(1, 'Caturra')</code>, <code>(2, 'Negro')</code>
            </div>
        </div>

        <div class="bg-black/60 p-4 rounded-xl border border-blue-500/40">
            <div class="text-blue-400 font-bold border-b border-white/10 pb-2 mb-2 flex justify-between">
                <span>TABLA HIJA: Cafe</span>
                <span class="bg-blue-500/20 px-2 py-0.5 rounded text-[10px]">N (Muchos)</span>
            </div>
            <div class="space-y-1 text-slate-300">
                <div><i class="fa-solid fa-key text-amber-400 mr-2"></i><strong>IDCafe</strong> : INTEGER (PK, AI)</div>
                <div><i class="fa-solid fa-font text-slate-400 mr-2"></i><strong>Productor</strong> : TEXT NOT NULL</div>
                <div><i class="fa-solid fa-link text-purple-400 mr-2"></i><strong>VariedadCafe</strong> : INTEGER (FK &rarr; VariedadCafe.IDVariedad)</div>
                <div><i class="fa-solid fa-hashtag text-cyan-400 mr-2"></i><strong>Cantidad</strong> : REAL NOT NULL</div>
            </div>
            <div class="mt-3 pt-2 border-t border-white/10 text-[11px] text-slate-400">
                Ejemplo: <code>(1, 'El chiringuito', 1, 2.5)</code>, <code>(2, 'FincaSol', 2, 1.0)</code>
            </div>
        </div>
    </div>
</div>

<!-- 2. COMPARATIVA SQLITE VS MYSQL -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-scale-balanced text-emerald-400"></i> 2. SQLite vs MySQL: ¿Cuándo usar cada motor?
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    El proyecto <strong>BaseDatos</strong> implementa una arquitectura dual muy interesante: utiliza <strong>MySQL</strong> como servidor principal y <strong>SQLite</strong> como base de datos local de respaldo (<em>fallback</em>). Veamos sus diferencias técnicas:
</p>

<div class="overflow-x-auto mb-8">
    <table class="w-full text-left border-collapse glass rounded-xl overflow-hidden text-xs">
        <thead>
            <tr class="bg-white/10 text-slate-200 border-b border-white/10">
                <th class="p-3.5 font-bold">Característica</th>
                <th class="p-3.5 font-bold text-cyan-300"><i class="fa-solid fa-feather mr-1"></i> SQLite (Embebido / Local)</th>
                <th class="p-3.5 font-bold text-amber-300"><i class="fa-solid fa-server mr-1"></i> MySQL / MariaDB (Cliente-Servidor)</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-white/5 text-slate-300">
            <tr>
                <td class="p-3 font-semibold text-white">Arquitectura</td>
                <td class="p-3">Sin servidor (<em>Serverless</em>). Toda la BD reside en un único archivo en disco (<code>informacion.db</code>).</td>
                <td class="p-3">Motor Cliente-Servidor que escucha peticiones por red en un puerto TCP (por defecto <code>3306</code>).</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">URL JDBC</td>
                <td class="p-3"><code>jdbc:sqlite:informacion.db</code></td>
                <td class="p-3"><code>jdbc:mysql://localhost:3306/informacion_db</code></td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Autenticación</td>
                <td class="p-3">No tiene usuarios ni contraseñas (depende de los permisos del archivo en el SO).</td>
                <td class="p-3">Requiere usuario (ej. <code>root</code>), contraseña y permisos por host/base de datos.</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Tipos de Datos</td>
                <td class="p-3">Tipado dinámico por afinidad: <code>INTEGER</code>, <code>TEXT</code>, <code>REAL</code>, <code>NUMERIC</code>, <code>BLOB</code>.</td>
                <td class="p-3">Tipado estricto: <code>INT</code>, <code>VARCHAR(n)</code>, <code>FLOAT</code>, <code>DOUBLE</code>, <code>DECIMAL</code>, <code>DATE</code>.</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Herramienta Visual</td>
                <td class="p-3"><strong>DB Browser for SQLite</strong></td>
                <td class="p-3"><strong>XAMPP + phpMyAdmin</strong> / MySQL Workbench</td>
            </tr>
        </tbody>
    </table>
</div>

<!-- 3. DDL: CREACIÓN DE TABLAS -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-hammer text-cyan-400"></i> 3. SQL DDL (Data Definition Language): Creando las Tablas del Proyecto
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    El sublenguaje <strong>DDL</strong> (<code>CREATE</code>, <code>ALTER</code>, <code>DROP</code>) define la estructura de las tablas. Observa la pequeña diferencia sintáctica entre el autoincremento de SQLite (<code>AUTOINCREMENT</code>) y el de MySQL (<code>AUTO_INCREMENT</code>):
</p>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Script SQLite -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-solid fa-code text-cyan-300 text-sm"></i> Esquema en SQLite (informacion.db)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-sql">-- 1. Tabla Padre: VariedadCafe
CREATE TABLE "VariedadCafe" (
    "IDVariedad"  INTEGER NOT NULL,
    "Descripcion" TEXT NOT NULL,
    PRIMARY KEY("IDVariedad" AUTOINCREMENT)
);

-- 2. Tabla Hija: Cafe
CREATE TABLE "Cafe" (
    "IDCafe"       INTEGER,
    "Productor"    TEXT NOT NULL,
    "VariedadCafe" INTEGER NOT NULL,
    "Cantidad"     REAL NOT NULL,
    PRIMARY KEY("IDCafe" AUTOINCREMENT),
    FOREIGN KEY("VariedadCafe")
        REFERENCES "VariedadCafe"("IDVariedad")
);</code></pre>
    </div>

    <!-- Script MySQL -->
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-solid fa-server text-amber-300 text-sm"></i> Esquema en MySQL / XAMPP (informacion_db)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-sql">CREATE DATABASE IF NOT EXISTS informacion_db;
USE informacion_db;

-- 1. Tabla Padre: VariedadCafe
CREATE TABLE VariedadCafe (
    IDVariedad INT NOT NULL AUTO_INCREMENT,
    Descripcion VARCHAR(100) NOT NULL,
    PRIMARY KEY (IDVariedad)
);

-- 2. Tabla Hija: Cafe
CREATE TABLE Cafe (
    IDCafe INT NOT NULL AUTO_INCREMENT,
    Productor VARCHAR(150) NOT NULL,
    VariedadCafe INT NOT NULL,
    Cantidad FLOAT NOT NULL,
    PRIMARY KEY (IDCafe),
    FOREIGN KEY (VariedadCafe)
        REFERENCES VariedadCafe(IDVariedad)
);</code></pre>
    </div>
</div>

<!-- 4. DML Y DQL: OPERACIONES CRUD Y JOINS -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-magnifying-glass-chart text-purple-400"></i> 4. SQL DML & DQL: Las 4 Operaciones CRUD e <code>INNER JOIN</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Todo sistema de base de datos se apoya en el acrónimo <strong>CRUD</strong>: <strong>C</strong>reate (<code>INSERT</code>), <strong>R</strong>ead (<code>SELECT</code>), <strong>U</strong>pdate (<code>UPDATE</code>) y <strong>D</strong>elete (<code>DELETE</code>). Estas son exactamente las sentencias que ejecuta <code>AdmonCafe.java</code>:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-solid fa-terminal text-purple-300 text-sm"></i> Operaciones CRUD completas + INNER JOIN
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-sql">-- ==========================================
-- 1. CREATE (Insertar nuevos registros)
-- ==========================================
INSERT INTO VariedadCafe (Descripcion) VALUES ('Caturra');
INSERT INTO VariedadCafe (Descripcion) VALUES ('Negro');

INSERT INTO Cafe (Productor, VariedadCafe, Cantidad) VALUES ('El chiringuito', 1, 2.5);
INSERT INTO Cafe (Productor, VariedadCafe, Cantidad) VALUES ('FincaSol', 2, 1.0);

-- ==========================================
-- 2. READ (Consultar registros)
-- ==========================================
-- Consulta simple de toda la tabla
SELECT * FROM Cafe;

-- Consulta combinada (INNER JOIN) para ver el nombre de la variedad en lugar de solo su ID numérico
SELECT c.IDCafe, c.Productor, v.Descripcion AS NombreVariedad, c.Cantidad
FROM Cafe c
INNER JOIN VariedadCafe v ON c.VariedadCafe = v.IDVariedad
WHERE c.Cantidad >= 1.0
ORDER BY c.IDCafe ASC;

-- ==========================================
-- 3. UPDATE (Modificar un registro existente)
-- ¡NUNCA OLVIDES EL WHERE O ACTUALIZARÁS TODA LA TABLA!
-- ==========================================
UPDATE Cafe
SET Productor = 'Finca Sol Premium', VariedadCafe = 1, Cantidad = 4.75
WHERE IDCafe = 2;

-- ==========================================
-- 4. DELETE (Borrar un registro específico)
-- ¡NUNCA OLVIDES EL WHERE O VACIARÁS TODA LA TABLA!
-- ==========================================
DELETE FROM Cafe WHERE IDCafe = 2;</code></pre>
</div>
`,T=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-screwdriver-wrench"></i></span>
    18. Guía Práctica: DB Browser (SQLite) y XAMPP (MySQL)
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    Para trabajar cómodamente con bases de datos en Java necesitamos herramientas visuales que nos permitan diseñar tablas, cargar datos de prueba, verificar qué insertó nuestro programa y monitorear las conexiones activas. Aquí tienes la guía paso a paso de las dos herramientas utilizadas en clase: <strong>DB Browser for SQLite</strong> y <strong>XAMPP + phpMyAdmin</strong>.
</p>

<!-- PARTE 1: DB BROWSER FOR SQLITE -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-Hard-drive text-cyan-400"></i> Parte 1: Guía Completa de DB Browser for SQLite
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    <strong>DB Browser for SQLite (DB4S)</strong> es la herramienta visual gratuita para crear y administrar archivos de base de datos SQLite (<code>.db</code> o <code>.sqlite</code>).
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="glass p-5 rounded-xl border-l-4 border-l-cyan-500">
        <h4 class="font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-circle-plus"></i> Paso 1: Crear <code>informacion.db</code> en la Raíz del Proyecto
        </h4>
        <ol class="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Abre DB Browser y haz clic en <strong>Nueva base de datos (New Database)</strong>.</li>
            <li>Navega hasta la <strong>carpeta raíz de tu proyecto Java</strong> (en el mismo nivel donde está el archivo <code>pom.xml</code>).</li>
            <li>Nómbrala exactamente <code>informacion.db</code> y guarda. Así, la ruta relativa <code>jdbc:sqlite:informacion.db</code> la encontrará sin depender de rutas absolutas como <code>C:\\Users\\...</code>.</li>
        </ol>
    </div>

    <div class="glass p-5 rounded-xl border-l-4 border-l-emerald-500">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-table-list"></i> Paso 2: Diseñar las Tablas Visualmente
        </h4>
        <ol class="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Se abrirá la ventana <strong>Editar definición de la tabla</strong>. Escribe el nombre <code>VariedadCafe</code>.</li>
            <li>Haz clic en <strong>Añadir (Add)</strong> para agregar campos:
                <ul class="list-disc list-inside ml-4 mt-1 text-slate-400">
                    <li><code>IDVariedad</code> &rarr; Tipo: <code>INTEGER</code> &rarr; Marca casillas <strong>NN</strong> (Not Null), <strong>PK</strong> (Primary Key) y <strong>AI</strong> (Autoincrement).</li>
                    <li><code>Descripcion</code> &rarr; Tipo: <code>TEXT</code> &rarr; Marca casilla <strong>NN</strong>.</li>
                </ul>
            </li>
            <li>Repite el proceso para la tabla <code>Cafe</code> y, en la columna <code>VariedadCafe</code>, haz doble clic en la columna <strong>Clave Foránea (Foreign Key)</strong> y selecciona <code>VariedadCafe(IDVariedad)</code>.</li>
        </ol>
    </div>
</div>

<!-- LAS 4 PESTAÑAS DE DB BROWSER -->
<div class="glass p-6 rounded-xl border border-white/10 mb-6">
    <h4 class="font-bold text-white mb-4 flex items-center gap-2">
        <i class="fa-solid fa-window-maximize text-cyan-400"></i> Las 4 Pestañas de DB Browser que Usarás a Diario
    </h4>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div class="bg-black/50 p-4 rounded-lg border border-white/5">
            <div class="font-bold text-cyan-300 mb-1">1. Estructura de la BD</div>
            <p class="text-slate-400 leading-relaxed">Muestra la lista de tablas, índices, vistas y triggers. Desde aquí puedes crear, modificar o eliminar tablas.</p>
        </div>
        <div class="bg-black/50 p-4 rounded-lg border border-white/5">
            <div class="font-bold text-emerald-300 mb-1">2. Hoja de Datos (Browse Data)</div>
            <p class="text-slate-400 leading-relaxed">Permite elegir la tabla en un desplegable, ver sus filas como en Excel, insertar filas nuevas con el icono <i class="fa-solid fa-file-circle-plus text-emerald-400"></i> o borrar registros.</p>
        </div>
        <div class="bg-black/50 p-4 rounded-lg border border-white/5">
            <div class="font-bold text-amber-300 mb-1">3. Editar Pragmas</div>
            <p class="text-slate-400 leading-relaxed">Configuración interna de SQLite. Aquí puedes asegurarte de que la casilla <code>Foreign Keys</code> esté activada.</p>
        </div>
        <div class="bg-black/50 p-4 rounded-lg border border-white/5">
            <div class="font-bold text-purple-300 mb-1">4. Ejecutar SQL</div>
            <p class="text-slate-400 leading-relaxed">Editor donde escribes sentencias <code>SELECT</code>, <code>INSERT</code> o <code>CREATE TABLE</code> y las ejecutas con el botón Play (<kbd>F5</kbd>).</p>
        </div>
    </div>
</div>

<!-- ALERTA CRÍTICA DB BROWSER -->
<div class="glass p-6 rounded-xl border-l-4 border-l-rose-500 mb-10">
    <h4 class="font-bold text-rose-400 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation"></i> ¡Cuidado! El Error Más Común en DB Browser: "Guardar Cambios (Write Changes)"
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed">
        Cuando agregas, editas o eliminas datos en DB Browser, los cambios quedan en una <strong>transacción abierta en memoria</strong>. Mientras no presiones el botón superior <strong>"Guardar cambios" (Write Changes / <kbd>Ctrl+S</kbd>)</strong>:
    </p>
    <ul class="list-disc list-inside text-xs text-slate-300 mt-2 space-y-1">
        <li>Tu aplicación Java <strong>NO verá los datos nuevos</strong> que metiste en DB Browser.</li>
        <li>Si tu aplicación Java intenta hacer un <code>INSERT</code>, <code>UPDATE</code> o <code>DELETE</code> mientras DB Browser tiene cambios sin guardar, SQLite lanzará el error <code class="text-rose-300">[SQLITE_BUSY] The database file is locked</code>.</li>
    </ul>
</div>

<!-- PARTE 2: XAMPP Y PHPMYADMIN -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-server text-amber-400"></i> Parte 2: Guía de XAMPP y phpMyAdmin (Servidor MySQL)
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    <strong>XAMPP</strong> es un paquete de desarrollo local que incluye el servidor web <strong>Apache</strong> y el motor de base de datos <strong>MySQL / MariaDB</strong> junto con su panel de administración web <strong>phpMyAdmin</strong>.
</p>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="glass p-5 rounded-xl border-t-4 border-t-amber-500">
        <h4 class="font-bold text-amber-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-play"></i> 1. Encender los Servicios
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Abre el <strong>XAMPP Control Panel</strong> y pulsa <strong>Start</strong> en dos módulos:
            <br>&bull; <strong>Apache</strong> (necesario para abrir la interfaz web phpMyAdmin en el puerto 80).
            <br>&bull; <strong>MySQL</strong> (inicia el servidor de base de datos en el puerto <code>3306</code>). Ambos deben ponerse en color verde.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-blue-500">
        <h4 class="font-bold text-blue-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-globe"></i> 2. Crear <code>informacion_db</code>
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Haz clic en el botón <strong>Admin</strong> de la fila MySQL (o entra a <code>http://localhost/phpmyadmin</code> en tu navegador). En la barra lateral izquierda haz clic en <strong>Nueva (New)</strong>, escribe <code>informacion_db</code> y pulsa <strong>Crear</strong>. Luego ve a la pestaña <strong>SQL</strong> y pega el script de creación de tablas.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-emerald-500">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-gauge-high"></i> 3. Monitorear Conexiones Activas
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            En la página principal de phpMyAdmin, ve a la pestaña superior <strong>Estado del servidor (Status) &rarr; Procesos (Processes)</strong>. Ahí verás en tiempo real cada conexión TCP abierta por tu aplicación Java, el usuario (<code>root</code>), la BD (<code>informacion_db</code>) y el estado (<code>Sleep</code> / <code>Query</code>).
        </p>
    </div>
</div>

<!-- VERIFICACIÓN DE SINGLETON EN PHPMYADMIN (EJEMPLOMYSQL.JAVA) -->
<div class="glass p-6 rounded-xl border border-amber-500/30 mb-8">
    <h4 class="font-bold text-amber-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-microscope text-amber-400"></i> Práctica de Laboratorio: Verificando el Singleton en phpMyAdmin (<code>EjemploMYSQL.java</code>)
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed mb-3">
        En el repositorio <strong>BaseDatos</strong> se incluye la clase <code>EjemploMYSQL.java</code>, diseñada específicamente para comprobar en XAMPP por qué el patrón Singleton es vital en bases de datos:
    </p>
    <ol class="text-xs text-slate-300 space-y-2 list-decimal list-inside">
        <li>El programa ejecuta un bucle <code>for</code> de 10 iteraciones pidiendo <code>DatosMYSQL.getInstance().getConexion()</code>.</li>
        <li>Sin Singleton, se abrirían <strong>10 conexiones simultáneas</strong> contra MySQL, agotando rápidamente el límite de conexiones del servidor (error <code>Too many connections</code>).</li>
        <li>Con Singleton, las 10 variables apuntan a la <strong>misma referencia en memoria</strong>, y al revisar <em>Estado del servidor &rarr; Procesos</em> en phpMyAdmin mientras el programa espera un <code>ENTER</code> en consola, comprobarás que <strong>solo existe 1 proceso activo</strong>.</li>
    </ol>
</div>
`,I=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-plug-circle-bolt"></i></span>
    19. JDBC, Singleton y Arquitectura ADMON/DAO (MySQL + SQLite)
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    <strong>JDBC (Java Database Connectivity)</strong> es la API oficial de Java (paquete <code>java.sql</code>) que permite que tu código se comunique con cualquier motor de base de datos relacional usando exactamente las mismas clases (<code>Connection</code>, <code>PreparedStatement</code>, <code>ResultSet</code>). En esta sección analizaremos a fondo la arquitectura completa del repositorio <strong>BaseDatos</strong>.
</p>

<!-- 1. CONFIGURACIÓN MAVEN Y MODULE-INFO -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-puzzle-piece text-cyan-400"></i> 1. Dependencias Maven (Drivers JDBC) y <code>module-info.java</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Para que \`DriverManager\` sepa cómo hablar con SQLite o con MySQL, debemos agregar sus conectores (drivers) en el archivo <code>pom.xml</code> y declarar <code>requires java.sql;</code> en <code>module-info.java</code>:
</p>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-solid fa-file-code text-cyan-300 text-sm"></i> pom.xml (Drivers SQLite y MySQL)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-xml">&lt;!-- Conector JDBC para SQLite --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;org.xerial&lt;/groupId&gt;
    &lt;artifactId&gt;sqlite-jdbc&lt;/artifactId&gt;
    &lt;version&gt;3.47.0.0&lt;/version&gt;
&lt;/dependency&gt;
&lt;!-- Logger requerido por sqlite-jdbc --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;org.slf4j&lt;/groupId&gt;
    &lt;artifactId&gt;slf4j-simple&lt;/artifactId&gt;
    &lt;version&gt;2.0.16&lt;/version&gt;
&lt;/dependency&gt;

&lt;!-- Conector JDBC para MySQL / XAMPP --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;com.mysql&lt;/groupId&gt;
    &lt;artifactId&gt;mysql-connector-j&lt;/artifactId&gt;
    &lt;version&gt;8.4.0&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
    </div>

    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-purple-300 text-sm"></i> module-info.java
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">module com.example.basedatos {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.sql; // Indispensable para JDBC
    requires java.desktop;
    requires net.sf.jasperreports.core;

    opens com.example.basedatos.POJO;
    exports com.example.basedatos.POJO;
    opens com.example.basedatos.ADMON to javafx.base;
    opens com.example.basedatos to javafx.fxml, javafx.base;
    exports com.example.basedatos;
    exports EjemploJasper;
}</code></pre>
    </div>
</div>

<!-- 2. LOS 4 PILARES DE JAVA.SQL -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-cubes-stacked text-emerald-400"></i> 2. Las 4 Clases Esenciales de <code>java.sql</code>
</h3>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div class="glass p-4 rounded-xl border-t-4 border-t-cyan-500">
        <h4 class="font-bold text-cyan-300 text-sm mb-1">1. DriverManager</h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Lee el prefijo de la URL (<code>jdbc:mysql:...</code> o <code>jdbc:sqlite:...</code>) y abre la conexión con <code>DriverManager.getConnection(...)</code>.
        </p>
    </div>
    <div class="glass p-4 rounded-xl border-t-4 border-t-blue-500">
        <h4 class="font-bold text-blue-300 text-sm mb-1">2. Connection</h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Representa la sesión activa con la BD. A partir de ella preparamos sentencias con <code>conexion.prepareStatement(sql)</code>.
        </p>
    </div>
    <div class="glass p-4 rounded-xl border-t-4 border-t-emerald-500">
        <h4 class="font-bold text-emerald-300 text-sm mb-1">3. PreparedStatement</h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Ejecuta consultas de lectura con <code>executeQuery()</code> (devuelve un <code>ResultSet</code>) o modificaciones con <code>execute()</code> / <code>executeUpdate()</code>.
        </p>
    </div>
    <div class="glass p-4 rounded-xl border-t-4 border-t-amber-500">
        <h4 class="font-bold text-amber-300 text-sm mb-1">4. ResultSet</h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Cursor que apunta a las filas devueltas por un <code>SELECT</code>. Se recorre con <code>while(rs.next())</code> extrayendo columnas con <code>getInt("col")</code>, <code>getString("col")</code>, etc.
        </p>
    </div>
</div>

<!-- 3. CLASE DATOS.JAVA: SINGLETON + FAILOVER HÍBRIDO MYSQL -> SQLITE -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-shield-cat text-amber-400"></i> 3. <code>Datos.java</code>: Patrón Singleton con Failover Automático (MySQL &rarr; SQLite)
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Observa la elegancia de la clase <code>Datos.java</code> en el paquete <code>ADMON</code>:
</p>
<ul class="list-disc list-inside text-xs text-slate-300 space-y-2 mb-6">
    <li><strong class="text-amber-300">Patrón Singleton:</strong> Su constructor es <code>private</code> y expone <code>Datos.getInstance()</code> para abrir una única conexión durante toda la ejecución.</li>
    <li><strong class="text-emerald-300">Conexión Híbrida Resiliente (Failover):</strong> Primero intenta conectarse al servidor principal <strong>MySQL</strong> (<code>urlServer</code>). Si el servidor XAMPP está apagado o no hay red, captura el <code>SQLException</code> y en el bloque <code>catch</code> se conecta automáticamente a la base de datos local <strong>SQLite</strong> (<code>informacion.db</code>). ¡La aplicación sigue funcionando sin caerse!</li>
</ul>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-amber-300 text-sm"></i> ADMON/Datos.java (Singleton + Failover MySQL a SQLite)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos.ADMON;

import java.io.IOException;
import java.io.InputStream;
import java.sql.*;
import java.util.Properties;

public class Datos {
    private static Datos datos = null;
    private Connection conexion;

    private Datos() {
        Properties propiedades = new Properties();
        try (InputStream input = Datos.class.getResourceAsStream("/database.properties")) {
            propiedades.load(input);
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }

        String urlServer = propiedades.getProperty("db.url", propiedades.getProperty("url", "jdbc:mysql://localhost:3306/informacion_db"));
        String user = propiedades.getProperty("db.user", propiedades.getProperty("user", "root"));
        String password = propiedades.getProperty("db.password", propiedades.getProperty("password", ""));
        String urlLocal = propiedades.getProperty("db.local.url", propiedades.getProperty("db.url.local", "jdbc:sqlite:informacion.db"));

        try {
            // 1. Intentar conectar al servidor principal (MySQL)
            conexion = DriverManager.getConnection(urlServer, user, password);
            System.out.println("bd conectada al servidor (MySQL)");
        } catch (SQLException e) {
            System.err.println("MySQL no disponible (" + e.getMessage() + "). Conectando a SQLite local...");
            try {
                // 2. Respaldo automático: conectar al archivo local SQLite
                conexion = DriverManager.getConnection(urlLocal);
                System.out.println("bd conectada en modo local (SQLite)");
            } catch (SQLException ex) {
                System.err.println(ex.getMessage());
            }
        }
    }

    public static Datos getInstance() {
        if (datos == null) {
            datos = new Datos();
        }
        return datos;
    }

    // Para sentencias SELECT (devuelve las filas en un ResultSet)
    public ResultSet ejecutarConsulta(String consulta) {
        ResultSet resultado = null;
        try {
            resultado = this.conexion.prepareStatement(consulta).executeQuery();
        } catch (SQLException e) {
            System.err.println(e.getMessage());
        }
        return resultado;
    }

    // Para sentencias INSERT, UPDATE o DELETE
    public boolean ejecutarInstruccion(String consulta) {
        try {
            this.conexion.prepareStatement(consulta).execute();
        } catch (SQLException e) {
            System.err.println(e.getMessage());
        }
        return true;
    }

    public Connection getConexion() {
        return this.conexion;
    }
}</code></pre>
</div>

<!-- 4. DEMOSTRACIÓN DE SINGLETON CON EJEMPLOMYSQL.JAVA -->
<h3 class="text-2xl font-bold text-sky-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-vial-circle-check text-sky-400"></i> 4. Prueba del Singleton con <code>DatosMYSQL.java</code> y <code>EjemploMYSQL.java</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Observa cómo <code>EjemploMYSQL.java</code> solicita 10 veces la conexión dentro de un bucle y comprueba con <code>stream().allMatch(...)</code> que las 10 referencias apuntan exactamente al mismo objeto <code>Connection</code>:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-sky-500/20 text-sky-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-sky-300 text-sm"></i> EjemploMYSQL.java (Comprobación de instancia única)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos;

import java.sql.Connection;
import java.util.LinkedList;
import java.util.Scanner;

public class EjemploMYSQL {
    public static void main(String[] args) {
        try {
            LinkedList<Connection> conexiones = new LinkedList<>();

            System.out.println("=== Probando el modelo Singleton con DatosMYSQL ===");
            for (int i = 0; i < 10; i++) {
                // Obtenemos la conexión a través de la instancia Singleton
                Connection con = DatosMYSQL.getInstance().getConexion();
                conexiones.add(con);
                System.out.println("Iteración " + (i + 1) + " -> Referencia de conexión: " + con);
            }

            if (!conexiones.isEmpty() && conexiones.getFirst() != null) {
                boolean todasIguales = conexiones.stream().allMatch(c -> c == conexiones.getFirst());
                System.out.println("¿Todas las referencias son exactamente la misma instancia?: " + todasIguales);
            }

            System.out.println("Presiona ENTER para cerrar la conexión y salir...");
            new Scanner(System.in).nextLine();

            if (DatosMYSQL.getInstance().getConexion() != null && !DatosMYSQL.getInstance().getConexion().isClosed()) {
                DatosMYSQL.getInstance().getConexion().close();
                System.out.println("Conexión cerrada exitosamente.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}</code></pre>
</div>

<!-- 5. CAPA POJO Y CAPA ADMON (DAO) -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-layer-group text-purple-400"></i> 5. Separación en Capas: POJOs, Clase Administradora (<code>AdmonCafe</code>) y Controlador JavaFX
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Un proyecto limpio nunca mezcla sentencias SQL dentro de los botones de la interfaz gráfica. En su lugar, divide el código en tres capas:
</p>
<ol class="list-decimal list-inside text-xs text-slate-300 space-y-1 mb-6">
    <li><strong class="text-cyan-300">Paquete <code>POJO</code> (<code>Cafe.java</code>, <code>VariedadCafe.java</code>):</strong> Clases simples con atributos, constructores, getters/setters y <code>toString()</code> que representan una fila de cada tabla.</li>
    <li><strong class="text-purple-300">Paquete <code>ADMON</code> (<code>AdmonCafe.java</code>, <code>AdmonVariedadCafe.java</code>):</strong> Clases administradoras (Data Access Objects) que traducen objetos Java en sentencias <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> y convierten el <code>ResultSet</code> de <code>SELECT</code> en una <code>LinkedList&lt;Cafe&gt;</code>.</li>
    <li><strong class="text-emerald-300">Controlador JavaFX (<code>CafeController.java</code>):</strong> Gestiona los eventos de la vista y llama a los métodos de <code>AdmonCafe</code>.</li>
</ol>

<div class="code-wrapper relative pt-6 mb-6">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> ADMON/AdmonCafe.java (CRUD completo contra la BD)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos.ADMON;

import com.example.basedatos.POJO.Cafe;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;

public class AdmonCafe {
    private Datos datos;

    public AdmonCafe() {
        datos = Datos.getInstance();
    }

    public void agregar(Cafe cafe) throws Exception {
        String consulta = String.format(
            "INSERT INTO Cafe(Productor, VariedadCafe, Cantidad) VALUES('%s', %d, %f)",
            cafe.getProductor(), cafe.getVariedadCafe(), cafe.getCantidad()
        );
        datos.ejecutarInstruccion(consulta);
    }

    public void editar(Cafe cafe) throws Exception {
        String consulta = String.format(
            "UPDATE Cafe SET Productor='%s', VariedadCafe=%d, Cantidad=%f WHERE IDCafe=%d",
            cafe.getProductor(), cafe.getVariedadCafe(), cafe.getCantidad(), cafe.getIdcafe()
        );
        datos.ejecutarInstruccion(consulta);
    }

    public void borrar(Integer idCafe) throws Exception {
        String consulta = String.format("DELETE FROM Cafe WHERE IDCafe=%d", idCafe);
        datos.ejecutarInstruccion(consulta);
    }

    public LinkedList<Cafe> obtenerCafe() throws Exception {
        LinkedList<Cafe> Cafes = new LinkedList<>();
        String consulta = "SELECT * FROM Cafe";
        try {
            ResultSet resultado = datos.ejecutarConsulta(consulta);
            if (resultado != null) {
                // Avanzamos fila por fila con resultado.next()
                while (resultado.next()) {
                    Cafes.add(new Cafe(
                        resultado.getInt("IDCafe"),
                        resultado.getString("Productor"),
                        resultado.getInt("VariedadCafe"),
                        resultado.getFloat("Cantidad")
                    ));
                }
                resultado.close(); // Importante liberar el cursor al terminar
            }
        } catch (SQLException e) {
            System.err.println("Error al cargar Cafes: " + e.getMessage());
        }
        return Cafes;
    }
}</code></pre>
</div>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> CafeController.java (Integración de TableView, ComboBox y AdmonCafe)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos;

import com.example.basedatos.ADMON.AdmonCafe;
import com.example.basedatos.ADMON.AdmonVariedadCafe;
import com.example.basedatos.POJO.Cafe;
import com.example.basedatos.POJO.VariedadCafe;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.input.MouseEvent;
import java.net.URL;
import java.util.ResourceBundle;

public class CafeController implements Initializable {
    @FXML private TextField textFieldID;
    @FXML private TextField textFieldProductor;
    @FXML private TextField textFieldCantidad;
    @FXML private ComboBox<VariedadCafe> comboVariedad;
    @FXML private TableView<Cafe> tablaCafe;

    private AdmonCafe AdministradorCafe = new AdmonCafe();
    private AdmonVariedadCafe Variedad = new AdmonVariedadCafe();

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        inicializarTabla();
        try {
            // Poblar el ComboBox con las variedades desde la tabla VariedadCafe
            comboVariedad.getItems().setAll(Variedad.obtenerVariedadCafe());
        } catch (Exception e) {
            System.err.println("Error al cargar variedades: " + e.getMessage());
        }
        cargarTabla();
    }

    private void inicializarTabla() {
        TableColumn<Cafe, Integer> tcID = new TableColumn<>("ID");
        TableColumn<Cafe, String> tcProductor = new TableColumn<>("Productor");
        TableColumn<Cafe, Integer> tcVariedadID = new TableColumn<>("VariedadID");
        TableColumn<Cafe, Float> tcCantidad = new TableColumn<>("Cantidad");

        tcID.setCellValueFactory(new PropertyValueFactory<>("IDCafe"));
        tcProductor.setCellValueFactory(new PropertyValueFactory<>("Productor"));
        tcVariedadID.setCellValueFactory(new PropertyValueFactory<>("VariedadCafe"));
        tcCantidad.setCellValueFactory(new PropertyValueFactory<>("Cantidad"));

        tablaCafe.getColumns().setAll(tcID, tcProductor, tcVariedadID, tcCantidad);
    }

    // Al hacer clic en una fila de la tabla, rellenamos los TextField y seleccionamos su Variedad en el ComboBox
    public void clicInformacion(MouseEvent mouseEvent) {
        Cafe cafe = tablaCafe.getSelectionModel().getSelectedItem();
        if (cafe == null) return;

        textFieldID.setText(String.valueOf(cafe.getIdcafe()));
        textFieldProductor.setText(cafe.getProductor());
        textFieldCantidad.setText(String.valueOf(cafe.getCantidad()));

        for (VariedadCafe variedad : comboVariedad.getItems()) {
            if (variedad.getIDVariedad().equals(cafe.getVariedadCafe())) {
                comboVariedad.getSelectionModel().select(variedad);
            }
        }
    }

    public void clicAgregar(ActionEvent actionEvent) {
        Cafe cafe = new Cafe(
            null, // El ID es autoincremental en la BD
            textFieldProductor.getText(),
            comboVariedad.getSelectionModel().getSelectedItem().getIDVariedad(),
            Float.valueOf(textFieldCantidad.getText())
        );
        try {
            AdministradorCafe.agregar(cafe);
            cargarTabla();
            limpiarCampos();
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }

    public void clicEditar(ActionEvent actionEvent) {
        Cafe cafe = new Cafe(
            Integer.valueOf(textFieldID.getText()),
            textFieldProductor.getText(),
            comboVariedad.getSelectionModel().getSelectedItem().getIDVariedad(),
            Float.valueOf(textFieldCantidad.getText())
        );
        try {
            AdministradorCafe.editar(cafe);
            cargarTabla();
            limpiarCampos();
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }

    public void clicBorrar(ActionEvent actionEvent) {
        try {
            AdministradorCafe.borrar(Integer.valueOf(textFieldID.getText()));
            cargarTabla();
            limpiarCampos();
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }

    public void cargarTabla() {
        try {
            tablaCafe.getItems().setAll(AdministradorCafe.obtenerCafe());
        } catch (Exception e) {
            System.err.println("Error al cargar Cafes: " + e.getMessage());
        }
    }

    public void limpiarCampos() {
        textFieldID.setText("");
        textFieldProductor.setText("");
        textFieldCantidad.setText("");
        comboVariedad.getSelectionModel().clearSelection();
    }
}</code></pre>
</div>

<!-- 6. EL ENFOQUE PROFESIONAL: SIN SINGLETON, PREPAREDSTATEMENT CON ? Y PREVENCIÓN DE SQL INJECTION -->
<h3 class="text-2xl font-bold text-rose-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-shield-halved text-rose-400"></i> 6. ¿Y cómo se hace SIN Singleton? <code>PreparedStatement</code> con <code>?</code> (Placeholders)
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    En los ejemplos anteriores del repositorio <code>BaseDatos</code>, vimos que <code>AdmonCafe.java</code> armaba las consultas usando <code>String.format("INSERT INTO Cafe ... VALUES('%s', %d, %f)", ...)</code> apoyándose en la conexión única y global de <code>Datos.getInstance()</code>. Aunque esa forma es muy rápida para prácticas escolares, <strong>en proyectos profesionales NO se hace así</strong>. Veamos por qué y cómo se programa el enfoque estándar de la industria.
</p>

<!-- LOS 2 PROBLEMAS GRAVES DE STRING.FORMAT Y CONEXIONES PERMANENTES -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="glass p-5 rounded-xl border-l-4 border-l-rose-500">
        <h4 class="font-bold text-rose-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i> 1. El Peligro Mortal: Inyección SQL (SQL Injection)
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Cuando usas <code>String.format</code> o concatenación con <code>+</code>, el motor de base de datos interpreta lo que escriba el usuario como código SQL ejecutable.
        </p>
        <div class="bg-black/60 p-3 rounded-lg border border-rose-500/30 text-xs font-mono text-rose-200 mb-2">
            // Si el usuario escribe esto en textFieldProductor:<br>
            <span class="text-amber-300">"Don Pedro', 1, 0); DROP TABLE Cafe; --"</span><br><br>
            // String.format produce este comando letal:<br>
            INSERT INTO Cafe(Productor, VariedadCafe, Cantidad)<br>
            VALUES('Don Pedro', 1, 0); <span class="text-rose-400 font-bold">DROP TABLE Cafe;</span> --', 1, 0);
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
            ¡La tabla <code>Cafe</code> completa es eliminada al instante! Además, si un cliente se apellida <code>O'Connor</code> o <code>D'Angelo</code>, la comilla simple rompe la sintaxis y lanza una excepción <code>SQLException: syntax error</code>.
        </p>
    </div>

    <div class="glass p-5 rounded-xl border-l-4 border-l-amber-500">
        <h4 class="font-bold text-amber-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-plug-circle-xmark"></i> 2. ¿Por qué prescindir del Singleton global?
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-2">
            Tener un <strong>Singleton con una sola conexión abierta para siempre</strong> tiene riesgos en producción:
        </p>
        <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>Conexión caída o timeout:</strong> Si MySQL o SQLite cierran la conexión por inactividad, toda la aplicación deja de funcionar porque el Singleton nunca la reabre.</li>
            <li><strong>Concurrencia:</strong> Si dos hilos o pantallas intentan usar la misma <code>Connection</code> al mismo tiempo, las transacciones se cruzan.</li>
            <li><strong>La Solución Estándar:</strong> Cada operación abre su propia conexión bajo demanda y la cierra inmediatamente al terminar, o mejor aún, la pide a un <em>Pool de Conexiones</em> (como HikariCP).</li>
        </ul>
    </div>
</div>

<!-- CÓMO FUNCIONA PREPAREDSTATEMENT CON SIGNOS DE INTERROGACIÓN ? -->
<h4 class="text-xl font-bold text-cyan-300 mb-3 flex items-center gap-2">
    <i class="fa-solid fa-circle-question text-cyan-400"></i> Anatomía de <code>PreparedStatement</code> con Comodines <code>?</code> (Placeholders)
</h4>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Con <code>PreparedStatement</code>, la sentencia SQL se escribe con signos de interrogación <code>?</code> en cada valor variable. Luego se usan los métodos tipados <code>setX(indice, valor)</code> para inyectar los datos:
</p>

<div class="glass p-5 rounded-xl border border-cyan-500/30 mb-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
            <div class="font-bold text-white text-xs mb-2 flex items-center gap-2">
                <span class="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono">1</span>
                Plantilla SQL con comodines <code>?</code>
            </div>
            <pre class="bg-black/60 p-3 rounded-lg border border-white/10 text-xs font-mono text-cyan-200"><code>String sql = "INSERT INTO Cafe (Productor, VariedadCafe, Cantidad) VALUES (?, ?, ?)";
PreparedStatement ps = con.prepareStatement(sql);</code></pre>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                El motor de la base de datos <strong>compila primero la consulta</strong> antes de recibir los valores. Ningún texto ingresado podrá alterar la lógica del comando SQL.
            </p>
        </div>

        <div>
            <div class="font-bold text-white text-xs mb-2 flex items-center gap-2">
                <span class="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">2</span>
                Asignación con <code>setX(índice, valor)</code>
            </div>
            <pre class="bg-black/60 p-3 rounded-lg border border-white/10 text-xs font-mono text-emerald-300"><code>// ¡REGLA DE ORO DE JDBC! Los índices empiezan en 1 (NO en 0)
ps.setString(1, cafe.getProductor());    // 1er ? -> VARCHAR
ps.setInt(2, cafe.getVariedadCafe());    // 2do ? -> INTEGER
ps.setFloat(3, cafe.getCantidad());      // 3er ? -> FLOAT

ps.executeUpdate(); // Ejecuta INSERT, UPDATE o DELETE</code></pre>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Si <code>cafe.getProductor()</code> vale <code>"O'Connor"</code> o incluye código malicioso, el driver escapa todo de forma nativa a nivel binario.
            </p>
        </div>
    </div>
</div>

<!-- CÓDIGO COMPLETO: CAFEDAO SIN SINGLETON CON TRY-WITH-RESOURCES -->
<h4 class="text-xl font-bold text-emerald-300 mb-3 flex items-center gap-2">
    <i class="fa-solid fa-code text-emerald-400"></i> Código Completo: <code>CafeDAO.java</code> (Sin Singleton + <code>try-with-resources</code>)
</h4>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Observa cómo luce la clase administradora profesional: ya no llama a <code>Datos.getInstance()</code>. En su lugar, usa un método <code>conectar()</code> y la sentencia <code>try (...)</code> con recursos automáticos, la cual cierra la <code>Connection</code>, el <code>PreparedStatement</code> y el <code>ResultSet</code> automáticamente sin riesgo de fugas de memoria:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> src/main/java/com/example/basedatos/ADMON/CafeDAO.java (Enfoque Sin Singleton)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos.ADMON;

import com.example.basedatos.POJO.Cafe;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;

public class CafeDAO {
    // Datos de conexión (pueden venir de un .properties o pasarse directo)
    private static final String URL_SQLITE = "jdbc:sqlite:informacion.db";
    private static final String URL_MYSQL = "jdbc:mysql://localhost:3306/informacion_db";
    private static final String USER = "root";
    private static final String PASS = "";

    // Método que abre una conexión fresca bajo demanda
    private Connection obtenerConexion() throws SQLException {
        try {
            // Intentar MySQL primero
            return DriverManager.getConnection(URL_MYSQL, USER, PASS);
        } catch (SQLException e) {
            // Respaldo local a SQLite si MySQL no está encendido
            return DriverManager.getConnection(URL_SQLITE);
        }
    }

    // 1. AGREGAR (INSERT) con comodines ? y PreparedStatement
    public boolean agregar(Cafe cafe) {
        String sql = "INSERT INTO Cafe (Productor, VariedadCafe, Cantidad) VALUES (?, ?, ?)";

        // try-with-resources: ¡Garantiza que conexion y ps se cierren solos al terminar!
        try (Connection con = obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            // Asignación de parámetros por posición (inicia en 1)
            ps.setString(1, cafe.getProductor());
            ps.setInt(2, cafe.getVariedadCafe());
            ps.setFloat(3, cafe.getCantidad());

            // executeUpdate() devuelve cuántas filas fueron afectadas (1 si se guardó bien)
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al agregar cafe: " + e.getMessage());
            return false;
        }
    }

    // 2. EDITAR (UPDATE) con comodines ?
    public boolean editar(Cafe cafe) {
        String sql = "UPDATE Cafe SET Productor = ?, VariedadCafe = ?, Cantidad = ? WHERE IDCafe = ?";

        try (Connection con = obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, cafe.getProductor());
            ps.setInt(2, cafe.getVariedadCafe());
            ps.setFloat(3, cafe.getCantidad());
            ps.setInt(4, cafe.getIdcafe()); // 4to ? es la condición del WHERE

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al editar cafe: " + e.getMessage());
            return false;
        }
    }

    // 3. BORRAR (DELETE) con comodín ?
    public boolean borrar(int idCafe) {
        String sql = "DELETE FROM Cafe WHERE IDCafe = ?";

        try (Connection con = obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idCafe);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al borrar cafe: " + e.getMessage());
            return false;
        }
    }

    // 4. CONSULTAR (SELECT) y mapeo de ResultSet
    public LinkedList<Cafe> obtenerTodos() {
        LinkedList<Cafe> lista = new LinkedList<>();
        String sql = "SELECT IDCafe, Productor, VariedadCafe, Cantidad FROM Cafe";

        try (Connection con = obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) { // Para lectura usamos executeQuery()

            while (rs.next()) {
                lista.add(new Cafe(
                    rs.getInt("IDCafe"),
                    rs.getString("Productor"),
                    rs.getInt("VariedadCafe"),
                    rs.getFloat("Cantidad")
                ));
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar cafes: " + e.getMessage());
        }
        return lista;
    }
}</code></pre>
</div>

<!-- TABLA COMPARATIVA FINAL -->
<div class="glass p-6 rounded-xl border border-white/10 mb-8 overflow-x-auto">
    <h4 class="font-bold text-white mb-4 flex items-center gap-2">
        <i class="fa-solid fa-scale-balanced text-amber-400"></i> Tabla Comparativa: Enfoque Singleton vs Enfoque PreparedStatement Estándar
    </h4>
    <table class="w-full text-xs text-left text-slate-300">
        <thead class="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
            <tr>
                <th class="p-3">Característica</th>
                <th class="p-3 text-amber-300">Enfoque con Singleton (Datos.java)</th>
                <th class="p-3 text-emerald-300">Enfoque Estándar Sin Singleton (CafeDAO)</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
            <tr>
                <td class="p-3 font-semibold text-white">Ciclo de vida de la conexión</td>
                <td class="p-3">Una sola conexión global estática que nunca se cierra.</td>
                <td class="p-3">Se abre y se cierra en cada operación con <code>try-with-resources</code> (o mediante Pool).</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Construcción de la consulta</td>
                <td class="p-3">Concatenación de cadenas con <code>String.format(...)</code>.</td>
                <td class="p-3">Plantilla precompilada con comodines <code>?</code> (Placeholders).</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Seguridad (Inyección SQL)</td>
                <td class="p-3 text-rose-400 font-semibold"><i class="fa-solid fa-xmark mr-1"></i> Vulnerable a código malicioso en campos de texto.</td>
                <td class="p-3 text-emerald-400 font-semibold"><i class="fa-solid fa-check mr-1"></i> 100% Inmune; los datos viajan separados del comando.</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Caracteres como comillas simples (<code>'</code>)</td>
                <td class="p-3 text-rose-300">Rompe la consulta con error de sintaxis SQL.</td>
                <td class="p-3 text-emerald-300">Se escapan de forma totalmente transparente y automática.</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Rendimiento</td>
                <td class="p-3">La base de datos recompila la consulta cada vez.</td>
                <td class="p-3">El motor reutiliza el plan de ejecución precompilado de la sentencia.</td>
            </tr>
            <tr>
                <td class="p-3 font-semibold text-white">Ejecución de cambios</td>
                <td class="p-3"><code>ps.execute()</code> genérico.</td>
                <td class="p-3"><code>ps.executeUpdate()</code> (devuelve filas afectadas para validar éxito).</td>
            </tr>
        </tbody>
    </table>
</div>
`,O=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-rose-500/20 text-rose-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-file-pdf"></i></span>
    20. Generación de Reportes y PDF con JasperReports
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    En sistemas empresariales y proyectos escolares completos, mostrar datos en un <code>TableView</code> no es suficiente: el usuario necesita imprimir facturas, inventarios o exportar reportes en <strong>PDF</strong>. Para ello, el ecosistema Java utiliza <strong>JasperReports Library</strong> junto con su diseñador visual <strong>Jaspersoft Studio</strong>, tal como se implementa en el paquete <code>EjemploJasper</code> del proyecto <strong>BaseDatos</strong>.
</p>

<!-- 1. FLUJO DE TRABAJO DE JASPERREPORTS -->
<h3 class="text-2xl font-bold text-rose-300 mb-4 mt-8 flex items-center gap-2">
    <i class="fa-solid fa-diagram-next text-rose-400"></i> 1. El Flujo de Trabajo en 4 Pasos (De <code>.jrxml</code> al Visor / PDF)
</h3>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div class="glass p-4 rounded-xl border-t-4 border-t-amber-500">
        <div class="text-xs font-mono text-amber-400 mb-1">PASO 1: Diseño XML</div>
        <h4 class="font-bold text-white text-sm mb-1"><code>ReporteCafe.jrxml</code></h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Se diseña visualmente arrastrando textos, líneas y campos en <strong>Jaspersoft Studio</strong> (similar a Scene Builder pero para documentos).
        </p>
    </div>

    <div class="glass p-4 rounded-xl border-t-4 border-t-cyan-500">
        <div class="text-xs font-mono text-cyan-400 mb-1">PASO 2: Compilación</div>
        <h4 class="font-bold text-white text-sm mb-1"><code>ReporteCafe.jasper</code></h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            En Jaspersoft Studio pulsas el icono <em>Compile Report</em> (martillo) para generar el archivo binario <code>.jasper</code> que colocas en la raíz de tu proyecto Java.
        </p>
    </div>

    <div class="glass p-4 rounded-xl border-t-4 border-t-purple-500">
        <div class="text-xs font-mono text-purple-400 mb-1">PASO 3: Llenado (Fill)</div>
        <h4 class="font-bold text-white text-sm mb-1"><code>JasperFillManager</code></h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Java toma el archivo <code>.jasper</code> y le inyecta tu <code>LinkedList&lt;Cafe&gt;</code> envuelta en un <code>JRBeanCollectionDataSource</code>, produciendo un <code>JasperPrint</code>.
        </p>
    </div>

    <div class="glass p-4 rounded-xl border-t-4 border-t-emerald-500">
        <div class="text-xs font-mono text-emerald-400 mb-1">PASO 4: Salida</div>
        <h4 class="font-bold text-white text-sm mb-1"><code>JasperViewer</code> / PDF</h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Se abre la ventana interactiva <code>JasperViewer</code> (desde donde el usuario puede imprimir o guardar en PDF, Excel, DOCX) o se exporta directo a PDF.
        </p>
    </div>
</div>

<!-- 2. DEPENDENCIAS EN POM.XML Y MODULE-INFO -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-gears text-amber-400"></i> 2. Configuración en <code>pom.xml</code> y <code>module-info.java</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    En la versión <strong>7.0.8</strong> de JasperReports utilizada en el proyecto, se agregan los artefactos <code>jasperreports</code> y <code>jasperreports-pdf</code>. Además, como <code>JasperViewer</code> está construido sobre Swing/AWT y lee los POJOs por reflexión, el archivo <code>module-info.java</code> requiere permisos específicos:
</p>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-solid fa-file-code text-amber-300 text-sm"></i> pom.xml (Dependencias JasperReports 7.0.8)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-xml">&lt;!-- JasperReports 7.0.8 --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;net.sf.jasperreports&lt;/groupId&gt;
    &lt;artifactId&gt;jasperreports&lt;/artifactId&gt;
    &lt;version&gt;7.0.8&lt;/version&gt;
&lt;/dependency&gt;
&lt;dependency&gt;
    &lt;groupId&gt;net.sf.jasperreports&lt;/groupId&gt;
    &lt;artifactId&gt;jasperreports-pdf&lt;/artifactId&gt;
    &lt;version&gt;7.0.8&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
    </div>

    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-purple-300 text-sm"></i> module-info.java (Requerimientos de Jasper)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">module com.example.basedatos {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.sql;
    requires java.desktop; // Requerido por JasperViewer (Swing)
    requires net.sf.jasperreports.core; // Motor de JasperReports

    // OBLIGATORIO: abrir el paquete POJO para que JRBeanCollectionDataSource
    // pueda invocar getIdcafe(), getProductor() y getCantidad() por reflexión
    opens com.example.basedatos.POJO;
    exports com.example.basedatos.POJO;
    exports EjemploJasper;
}</code></pre>
    </div>
</div>

<!-- 3. ANATOMÍA DEL ARCHIVO JRXML -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-file-lines text-cyan-400"></i> 3. Anatomía de la Plantilla <code>ReporteCafe.jrxml</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Un reporte en Jaspersoft Studio se divide en <strong>Bandas (Bands)</strong> horizontales y utiliza dos tipos de expresiones dinámicas:
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="glass p-5 rounded-xl border border-cyan-500/30">
        <h4 class="font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-sliders"></i> Parámetros: <code>$P{nombre}</code> y Campos: <code>$F{atributo}</code>
        </h4>
        <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Parámetros (<code>&lt;parameter name="anio"/&gt;</code> &rarr; <code>$P{anio}</code>):</strong> Valores únicos para todo el reporte (ej. título, fecha, nombre del usuario que imprimió).</li>
            <li><strong>Campos (<code>&lt;field name="idcafe"/&gt;</code> &rarr; <code>$F{idcafe}</code>):</strong> Deben llamarse <strong>exactamente igual que la propiedad JavaBean</strong> de tu clase <code>Cafe.java</code> (como el getter es <code>getIdcafe()</code>, el field debe llamarse <code>idcafe</code>).</li>
        </ul>
    </div>

    <div class="glass p-5 rounded-xl border border-emerald-500/30">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-bars-staggered"></i> Bandas Principales del Documento
        </h4>
        <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong><code>&lt;title&gt;</code>:</strong> Aparece una sola vez al principio del reporte (ej. <code>"Cafe reportes " + $P{anio}</code>).</li>
            <li><strong><code>&lt;columnHeader&gt;</code>:</strong> Cabecera de la tabla con textos estáticos (<code>ID Café</code>, <code>Productor</code>, <code>Cantidad</code>).</li>
            <li><strong><code>&lt;detail&gt;</code>:</strong> ¡Se repite automáticamente <strong>una vez por cada objeto <code>Cafe</code></strong> de tu <code>LinkedList</code>!</li>
        </ul>
    </div>
</div>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-solid fa-code text-cyan-300 text-sm"></i> ReporteCafe.jrxml (Plantilla real del proyecto BaseDatos)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-xml">&lt;!-- Created with Jaspersoft Studio version 7.0.8.final --&gt;
&lt;jasperReport name="ReporteCafe" language="java" pageWidth="595" pageHeight="842" columnWidth="555" leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20"&gt;
    &lt;!-- 1. Parámetro global con valor por defecto "2026" --&gt;
    &lt;parameter name="anio" class="java.lang.String"&gt;
        &lt;defaultValueExpression&gt;&lt;![CDATA["2026"]]&gt;&lt;/defaultValueExpression&gt;
    &lt;/parameter&gt;

    &lt;!-- 2. Campos enlazados a los getters de Cafe.java (getIdcafe, getProductor, getCantidad) --&gt;
    &lt;field name="idcafe" class="java.lang.Integer"/&gt;
    &lt;field name="productor" class="java.lang.String"/&gt;
    &lt;field name="cantidad" class="java.lang.Float"/&gt;

    &lt;!-- 3. Banda de Título --&gt;
    &lt;title height="50"&gt;
        &lt;element kind="textField" x="0" y="10" width="555" height="30" fontSize="18.0" bold="true" hTextAlign="Center" vTextAlign="Middle"&gt;
            &lt;expression&gt;&lt;![CDATA["Cafe reportes  " + $P{anio}]]&gt;&lt;/expression&gt;
        &lt;/element&gt;
    &lt;/title&gt;

    &lt;!-- 4. Banda de Encabezados de Columna --&gt;
    &lt;columnHeader height="25"&gt;
        &lt;element kind="staticText" x="0" y="0" width="100" height="25" bold="true" hTextAlign="Center"&gt;
            &lt;text&gt;&lt;![CDATA[ID Café]]&gt;&lt;/text&gt;
        &lt;/element&gt;
        &lt;element kind="staticText" x="100" y="0" width="300" height="25" bold="true" hTextAlign="Left"&gt;
            &lt;text&gt;&lt;![CDATA[Productor]]&gt;&lt;/text&gt;
        &lt;/element&gt;
        &lt;element kind="staticText" x="400" y="0" width="155" height="25" bold="true" hTextAlign="Right"&gt;
            &lt;text&gt;&lt;![CDATA[Cantidad]]&gt;&lt;/text&gt;
        &lt;/element&gt;
    &lt;/columnHeader&gt;

    &lt;!-- 5. Banda de Detalle (Se repite por cada elemento de la LinkedList) --&gt;
    &lt;detail&gt;
        &lt;band height="20"&gt;
            &lt;element kind="textField" x="0" y="0" width="100" height="20" hTextAlign="Center"&gt;
                &lt;expression&gt;&lt;![CDATA[$F{idcafe}]]&gt;&lt;/expression&gt;
            &lt;/element&gt;
            &lt;element kind="textField" x="100" y="0" width="300" height="20" hTextAlign="Left"&gt;
                &lt;expression&gt;&lt;![CDATA[$F{productor}]]&gt;&lt;/expression&gt;
            &lt;/element&gt;
            &lt;element kind="textField" x="400" y="0" width="155" height="20" pattern="#,##0.00" hTextAlign="Right"&gt;
                &lt;expression&gt;&lt;![CDATA[$F{cantidad}]]&gt;&lt;/expression&gt;
            &lt;/element&gt;
        &lt;/band&gt;
    &lt;/detail&gt;
&lt;/jasperReport&gt;</code></pre>
</div>

<!-- 4. CÓDIGO JAVA PARA GENERAR Y VISUALIZAR EL REPORTE -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-play text-emerald-400"></i> 4. Ejecución en Java: <code>EjemploJasper.java</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Observa cómo en menos de 20 líneas de código consultamos la base de datos mediante <code>AdmonCafe</code>, transformamos la <code>LinkedList&lt;Cafe&gt;</code> en un <code>JRBeanCollectionDataSource</code>, rellenamos el reporte compilado <code>ReporteCafe.jasper</code> y lanzamos el visor:
</p>

<div class="code-wrapper relative pt-6 mb-6">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> EjemploJasper/EjemploJasper.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package EjemploJasper;

import com.example.basedatos.ADMON.AdmonCafe;
import com.example.basedatos.POJO.Cafe;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.view.JasperViewer;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class EjemploJasper {
    public static void main(String[] args) {
        try {
            // 1. Obtener la lista de objetos desde la Base de Datos (MySQL o SQLite)
            AdmonCafe admon = new AdmonCafe();
            LinkedList<Cafe> cafes = admon.obtenerCafe();

            for (Cafe cafe : cafes) {
                System.out.println(cafe);
            }

            // 2. Envolver la LinkedList en un DataSource de JavaBeans para Jasper
            JRBeanCollectionDataSource datos = new JRBeanCollectionDataSource(cafes);

            // (Opcional) Mapa de parámetros para enviar valores a $P{anio}
            Map<String, Object> parametros = new HashMap<>();
            parametros.put("anio", "2026 - Cosecha Especial");

            // 3. Llenar el reporte compilado (.jasper) con los parámetros (o null) y la colección
            JasperPrint reporte = JasperFillManager.fillReport("ReporteCafe.jasper", parametros, datos);

            // 4. Mostrar el visor interactivo.
            // IMPORTANTE: el segundo parámetro "false" (isExitOnClose) evita que al cerrar
            // la ventana del reporte se cierre toda tu aplicación JavaFX con System.exit(0).
            JasperViewer vista = new JasperViewer(reporte, false);
            vista.setVisible(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}</code></pre>
</div>

<div class="glass p-5 rounded-xl border-l-4 border-l-emerald-500 mb-6">
    <h4 class="font-bold text-emerald-300 mb-1 flex items-center gap-2">
        <i class="fa-solid fa-lightbulb text-yellow-400"></i> Tip: ¿Por qué pasar <code>false</code> en <code>new JasperViewer(reporte, false)</code>?
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed">
        Si usas el constructor de un solo argumento <code>new JasperViewer(reporte)</code>, cuando el usuario cierre la ventana del visor de PDF con la "X", JasperViewer ejecutará internamente <code>System.exit(0)</code> y <strong>matará toda tu ventana principal de JavaFX</strong>. Al pasar <code>false</code> como segundo argumento (<code>isExitOnClose = false</code>), solo se cierra la ventana del reporte y tu aplicación continúa activa.
    </p>
</div>
`,D=`<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
    <span class="bg-rose-500/20 text-rose-400 p-2 rounded-lg text-xl"><i class="fa-solid fa-database"></i></span>
    21. JasperReports con Base de Datos: Data Adapter, Dataset SQL e Integración en IntelliJ
</h2>

<p class="text-slate-300 mb-8 text-base leading-relaxed">
    En la sección anterior alimentamos el reporte enviando una <code>LinkedList&lt;Cafe&gt;</code> desde Java (<code>JRBeanCollectionDataSource</code>), pero eso tenía una limitación importante: el objeto <code>Cafe</code> solo guardaba el número <code>variedadCafe</code> (ID foráneo) y no el nombre de la variedad. En esta sección veremos el flujo completo de <strong>JasperReports conectado directamente a una Base de Datos mediante SQL</strong> tal como se implementó en el repositorio <a href="https://github.com/MarwiVex/baseDatos" target="_blank" class="text-blue-400 hover:underline font-mono">MarwiVex/baseDatos</a>: descargar el <code>.jar</code> de Maven, crear el <strong>Data Adapter</strong> en Jaspersoft Studio, configurar el <strong>Dataset and Query</strong> con clic derecho usando <code>INNER JOIN</code>, pasar los parámetros y la conexión desde <strong>IntelliJ IDEA</strong>, y lanzar el reporte desde un botón en <strong>JavaFX</strong>.
</p>

<!-- COMPARATIVA RÁPIDA: SECCIÓN 20 VS SECCIÓN 21 -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
    <div class="glass p-5 rounded-xl border-l-4 border-l-purple-500">
        <div class="text-xs font-mono text-purple-400 mb-1">ENFOQUE 1 (Sección 20): Colección de Objetos</div>
        <h4 class="font-bold text-white text-sm mb-2"><code>JRBeanCollectionDataSource(cafes)</code></h4>
        <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>El archivo <code>.jrxml</code> <strong>no tiene consulta SQL</strong>.</li>
            <li>Los campos <code>$F{...}</code> leen los getters de <code>Cafe.java</code> por reflexión.</li>
            <li>Tercer parámetro de <code>fillReport</code>: el objeto <code>JRBeanCollectionDataSource</code>.</li>
        </ul>
    </div>

    <div class="glass p-5 rounded-xl border-l-4 border-l-emerald-500">
        <div class="text-xs font-mono text-emerald-400 mb-1">ENFOQUE 2 (Sección 21): Conexión Directa a BD + SQL</div>
        <h4 class="font-bold text-white text-sm mb-2"><code>datos.getConexion()</code> + <code>&lt;query language="SQL"&gt;</code></h4>
        <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>El reporte guarda adentro su propia consulta SQL con <code>INNER JOIN</code>.</li>
            <li>Permite cruzar tablas (<code>Cafe</code> + <code>VariedadCafe</code>) para mostrar el nombre de la variedad.</li>
            <li>Tercer parámetro de <code>fillReport</code>: el objeto <code>Connection</code> (<code>datos.getConexion()</code>).</li>
        </ul>
    </div>
</div>

<!-- PASO 1: DESCARGAR EL .JAR DE MAVEN PARA EL ADAPTADOR -->
<h3 class="text-2xl font-bold text-amber-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-box-archive text-amber-400"></i> 1. Obtener el Driver <code>.jar</code> de Maven para Jaspersoft Studio
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Aunque IntelliJ descarga automáticamente los drivers JDBC gracias al <code>pom.xml</code>, <strong>Jaspersoft Studio es un programa independiente</strong> y no lee tu <code>pom.xml</code>. Para que Jaspersoft Studio pueda abrir tu archivo <code>informacion.db</code> (SQLite) o conectarse a MySQL mientras diseñas el reporte, necesitas indicarle la ruta del archivo <strong><code>.jar</code> del conector JDBC</strong>. Tienes <strong>3 formas</strong> de obtenerlo:
</p>

<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
    <div class="glass p-5 rounded-xl border-t-4 border-t-amber-500">
        <h4 class="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
            <i class="fa-solid fa-globe"></i> Opción A: Descargar de Maven Repository
        </h4>
        <ol class="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Entra a <code>mvnrepository.com</code> y busca <strong><code>sqlite-jdbc</code></strong> (grupo <code>org.xerial</code>, versión <code>3.47.0.0</code>) o <strong><code>mysql-connector-j</code></strong> (versión <code>8.4.0</code>).</li>
            <li>Entra a la versión y en la fila <strong>Files</strong> haz clic en el botón <strong><code>jar</code></strong> para descargar <code>sqlite-jdbc-3.47.0.0.jar</code>.</li>
            <li>Guárdalo en una carpeta accesible (por ejemplo, en Documentos o en la carpeta de tu proyecto).</li>
        </ol>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-cyan-500">
        <h4 class="font-bold text-cyan-300 text-sm mb-2 flex items-center gap-2">
            <i class="fa-solid fa-folder-tree"></i> Opción B: Usar la Carpeta Local <code>.m2</code> de Maven
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-2">
            Como IntelliJ ya descargó las dependencias del <code>pom.xml</code>, el archivo <code>.jar</code> <strong>ya está en tu disco duro</strong> dentro de la caché oculta <code>.m2</code> de tu usuario:
        </p>
        <div class="bg-black/50 p-2.5 rounded-lg border border-white/10 font-mono text-[11px] text-cyan-200 break-all">
            C:\\Users\\TuUsuario\\.m2\\repository\\org\\xerial\\sqlite-jdbc\\3.47.0.0\\sqlite-jdbc-3.47.0.0.jar
        </div>
    </div>

    <div class="glass p-5 rounded-xl border-t-4 border-t-emerald-500">
        <h4 class="font-bold text-emerald-300 text-sm mb-2 flex items-center gap-2">
            <i class="fa-solid fa-terminal"></i> Opción C: Comando Maven en Terminal
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-2">
            Si abres la terminal integrada de <strong>IntelliJ IDEA</strong> (<code>Alt + F12</code>) y ejecutas este comando, Maven copiará todos los <code>.jar</code> de tu proyecto en <code>target/dependency/</code>:
        </p>
        <div class="bg-black/50 p-2.5 rounded-lg border border-white/10 font-mono text-[11px] text-emerald-300">
            mvn dependency:copy-dependencies
        </div>
    </div>
</div>

<!-- PASO 2: CREAR EL DATA ADAPTER EN JASPERSOFT STUDIO -->
<h3 class="text-2xl font-bold text-cyan-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-plug text-cyan-400"></i> 2. Crear el Data Adapter (<code>informacionCafe</code>) en Jaspersoft Studio
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Un <strong>Data Adapter</strong> le enseña a Jaspersoft Studio cómo conectarse a tu base de datos para validar tu consulta SQL y extraer las columnas automáticamente. Sigue estos pasos exactos:
</p>

<div class="glass p-6 rounded-xl border border-cyan-500/30 mb-8">
    <ol class="text-xs text-slate-300 space-y-4 list-decimal list-inside leading-relaxed">
        <li>
            <strong class="text-white">Abrir el Repository Explorer:</strong> En Jaspersoft Studio, ubica el panel <strong>Repository Explorer</strong> (normalmente a la izquierda). Si no lo ves, ve al menú superior <em>Window &rarr; Show View &rarr; Other... &rarr; Jaspersoft Studio &rarr; Repository Explorer</em>.
        </li>
        <li>
            <strong class="text-white">Clic derecho en Data Adapters:</strong> Dentro de <em>Repository Explorer</em>, haz <strong>clic derecho sobre el icono <code>Data Adapters</code></strong> &rarr; selecciona <strong><code>Create Data Adapter</code></strong>.
        </li>
        <li>
            <strong class="text-white">Elegir tipo JDBC:</strong> En la lista elige <strong><code>Database JDBC Connection</code></strong> y haz clic en <strong>Next</strong>.
        </li>
        <li>
            <strong class="text-amber-300">¡PRIMERO! Pestaña Inferior "Driver Classpath" (Agregar el <code>.jar</code>):</strong>
            <div class="mt-1.5 ml-5 p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-slate-300">
                En la parte inferior de la ventana verás dos pestañas: <em>Database Location</em> y <em>Driver Classpath</em>. Entra a <strong><code>Driver Classpath</code></strong>, haz clic en el botón <strong><code>Add</code></strong> y selecciona el archivo <strong><code>sqlite-jdbc-3.47.0.0.jar</code></strong> (o <code>mysql-connector-j-8.4.0.jar</code>) que descargaste en el Paso 1.
                <br><span class="text-rose-300 font-semibold">Nota:</span> Si olvidas este paso, al probar la conexión te dará el error <code>java.lang.ClassNotFoundException: org.sqlite.JDBC</code>.
            </div>
        </li>
        <li>
            <strong class="text-cyan-300">Pestaña Superior "Database Location" (Driver y Ruta / URL):</strong> Regresa a la pestaña <strong><code>Database Location</code></strong> y llena los datos exactamente así:
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3 ml-5">
                <div class="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
                    <div class="font-bold text-cyan-300 mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-file-shield"></i> Configuración para SQLite (<code>informacion.db</code>)
                    </div>
                    <ul class="space-y-1.5 font-mono text-[11px] text-slate-300">
                        <li><span class="text-slate-400">Name:</span> <code class="text-emerald-300">informacionCafe</code></li>
                        <li><span class="text-slate-400">JDBC Driver:</span> <code class="text-amber-300">org.sqlite.JDBC</code> <span class="font-sans text-slate-400">(escríbelo manualmente si no sale en la lista)</span></li>
                        <li><span class="text-slate-400">JDBC Url:</span> <code class="text-cyan-300">jdbc:sqlite:C:/Users/TuUsuario/.../baseDatos/informacion.db</code></li>
                        <li><span class="text-slate-400">Username / Password:</span> <span class="font-sans italic text-slate-400">(Dejar completamente en blanco)</span></li>
                    </ul>
                    <p class="mt-2 text-[11px] text-slate-400 font-sans">
                        <i class="fa-solid fa-circle-info text-cyan-400 mr-1"></i> En Jaspersoft Studio <strong>sí debes poner la ruta absoluta completa</strong> hacia el archivo <code>informacion.db</code> de tu proyecto después de <code>jdbc:sqlite:</code>.
                    </p>
                </div>

                <div class="bg-black/60 p-4 rounded-lg border border-amber-500/30">
                    <div class="font-bold text-amber-300 mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-server"></i> Alternativa para MySQL / XAMPP (<code>informacion_db</code>)
                    </div>
                    <ul class="space-y-1.5 font-mono text-[11px] text-slate-300">
                        <li><span class="text-slate-400">Name:</span> <code class="text-emerald-300">informacionCafe</code></li>
                        <li><span class="text-slate-400">JDBC Driver:</span> <code class="text-amber-300">com.mysql.cj.jdbc.Driver</code></li>
                        <li><span class="text-slate-400">JDBC Url:</span> <code class="text-cyan-300">jdbc:mysql://localhost:3306/informacion_db</code></li>
                        <li><span class="text-slate-400">Username:</span> <code class="text-white">root</code> | <span class="text-slate-400">Password:</span> <span class="font-sans italic text-slate-400">(vacío)</span></li>
                    </ul>
                    <p class="mt-2 text-[11px] text-slate-400 font-sans">
                        <i class="fa-solid fa-circle-info text-amber-400 mr-1"></i> Requiere tener encendido el módulo <strong>MySQL</strong> en el panel de control de XAMPP y agregar <code>mysql-connector-j-8.4.0.jar</code> en <em>Driver Classpath</em>.
                    </p>
                </div>
            </div>
        </li>
        <li>
            <strong class="text-emerald-300">Probar y Guardar:</strong> Haz clic en el botón <strong><code>Test</code></strong> (arriba a la derecha). Debe aparecer una ventana emergente diciendo <strong>"Successful"</strong>.Finalmente pulsa <strong><code>Finish</code></strong>.
        </li>
    </ol>
</div>

<!-- PASO 3: CLIC DERECHO -> DATASET AND QUERY Y COMANDO SQL -->
<h3 class="text-2xl font-bold text-purple-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-computer-mouse text-purple-400"></i> 3. Clic Derecho &rarr; <code>Dataset and Query...</code> y Comando SQL con <code>INNER JOIN</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Una vez creado el adaptador <code>informacionCafe</code>, hay que vincularlo a nuestro reporte y escribir la consulta SQL que extrae los cafés junto con el nombre de su variedad:
</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="glass p-5 rounded-xl border-l-4 border-l-purple-500">
        <h4 class="font-bold text-purple-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-arrow-pointer"></i> ¿Dónde hacer Clic Derecho para abrir Dataset and Query?
        </h4>
        <ol class="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Abre tu archivo <code>ReporteCafe.jrxml</code> en Jaspersoft Studio.</li>
            <li>Ve al panel <strong>Outline</strong> (esquina inferior izquierda, donde están <em>Styles, Parameters, Fields, Variables, Title, Detail...</em>).</li>
            <li>Haz <strong>clic derecho sobre el primer elemento raíz (<code>ReporteCafe</code>)</strong> y selecciona <strong><code>Dataset and Query...</code></strong> en el menú contextual.</li>
            <li><em>Atajo alternativo:</em> También puedes hacer clic derecho directamente sobre una zona vacía del diseño del reporte &rarr; <strong><code>Dataset and Query...</code></strong> (o pulsar el icono de cilindro con una tabla en la esquina superior derecha del área de diseño).</li>
        </ol>
    </div>

    <div class="glass p-5 rounded-xl border-l-4 border-l-emerald-500">
        <h4 class="font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Configurar el Diálogo y Leer los Campos (Read Fields)
        </h4>
        <ol class="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>En la esquina superior izquierda de la ventana <em>Dataset and Query Dialog</em>, despliega la lista de <strong>Data Adapter</strong> y selecciona tu adaptador <strong><code>informacionCafe</code></strong>.</li>
            <li>Asegúrate de que en <strong>Language</strong> esté seleccionado <strong><code>SQL</code></strong> (en el panel izquierdo verás tus tablas <code>Cafe</code> y <code>VariedadCafe</code>).</li>
            <li>Pega el comando SQL con <code>INNER JOIN</code> en el cuadro de texto central.</li>
            <li>Haz clic en el botón <strong><code>Read Fields</code></strong> (arriba a la derecha). Verás cómo en la pestaña inferior <strong>Fields</strong> aparecen automáticamente <code>idcafe</code>, <code>productor</code>, <code>variedad</code> y <code>cantidad</code>.</li>
            <li>(Opcional) Entra a la pestaña inferior <strong>Data Preview</strong> y pulsa <em>Refresh Preview Data</em> para verificar que devuelve los registros reales. Pulsa <strong>OK</strong>.</li>
        </ol>
    </div>
</div>

<!-- COMANDO SQL DEL REPORTE -->
<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-solid fa-database text-purple-300 text-sm"></i> Comando SQL en "Dataset and Query" (Une Cafe y VariedadCafe)
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-sql">SELECT C.IDCafe, C.Productor, VC.Descripcion AS Variedad, C.Cantidad
FROM Cafe C INNER JOIN VariedadCafe VC
ON C.VariedadCafe=VC.IDVariedad</code></pre>
</div>

<div class="glass p-5 rounded-xl border border-amber-500/30 mb-8">
    <h4 class="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
        <i class="fa-solid fa-hammer text-amber-400"></i> Arrastrar <code>$F{variedad}</code> y Compilar a <code>ReporteCafeSQL.jasper</code>
    </h4>
    <p class="text-xs text-slate-300 leading-relaxed">
        De vuelta en el diseño visual, abre el nodo <strong>Fields</strong> en el panel <em>Outline</em> y arrastra el nuevo campo <strong><code>variedad</code></strong> hacia la banda <strong>Detail</strong> (entre <em>Productor</em> y <em>Cantidad</em>). Jaspersoft creará automáticamente el encabezado estático <code>Variedad</code> en la banda <strong>Column Header</strong> y la expresión <code>$F{variedad}</code> en <strong>Detail</strong>.
        <br><br>
        Finalmente, haz clic en el icono del <strong>Martillo (Compile Report)</strong> en la barra superior de herramientas (o clic derecho sobre el reporte en el explorador &rarr; <em>Compile Report</em>). Esto generará el archivo compilado <strong><code>ReporteCafeSQL.jasper</code></strong> (y/o actualizará <code>ReporteCafe.jasper</code>), el cual debes <strong>copiar a la carpeta raíz de tu proyecto en IntelliJ IDEA</strong> (al mismo nivel que <code>pom.xml</code> e <code>informacion.db</code>).
    </p>
</div>

<!-- ARCHIVO JRXML ACTUALIZADO COMPLETO -->
<div class="code-wrapper relative pt-6 mb-10">
    <div class="absolute top-0 left-0 bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-solid fa-file-code text-cyan-300 text-sm"></i> ReporteCafe.jrxml (Con Data Adapter "informacionCafe", Query SQL y Campo $F{variedad})
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-xml">&lt;!-- Created with Jaspersoft Studio version 7.0.8.final using JasperReports Library version 7.0.8-6f896111  --&gt;
&lt;jasperReport name="ReporteCafe" language="java" pageWidth="595" pageHeight="842" columnWidth="555" leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20" uuid="c1b52a78-9e11-4b16-928e-591b6190f84a"&gt;
	&lt;property name="com.jaspersoft.studio.data.defaultdataadapter" value="informacionCafe"/&gt;
	&lt;property name="com.jaspersoft.studio.data.sql.tables" value=""/&gt;
	&lt;parameter name="anio" class="java.lang.String"&gt;
		&lt;defaultValueExpression&gt;&lt;![CDATA["2026"]]&gt;&lt;/defaultValueExpression&gt;
	&lt;/parameter&gt;
	&lt;query language="SQL"&gt;&lt;![CDATA[SELECT C.IDCafe, C.Productor, VC.Descripcion AS Variedad, C.Cantidad
FROM Cafe C INNER JOIN VariedadCafe VC
ON C.VariedadCafe=VC.IDVariedad]]&gt;&lt;/query&gt;
	&lt;field name="idcafe" class="java.lang.Integer"/&gt;
	&lt;field name="productor" class="java.lang.String"/&gt;
	&lt;field name="cantidad" class="java.lang.Float"/&gt;
	&lt;field name="variedad" class="java.lang.String"/&gt;
	&lt;title height="50"&gt;
		&lt;element kind="textField" uuid="7cfd47c4-2792-411a-a681-ec06913e6d8a" x="0" y="10" width="555" height="30" fontSize="18.0" bold="true" hTextAlign="Center" vTextAlign="Middle"&gt;
			&lt;expression&gt;&lt;![CDATA["Cafe reportes " + $P{anio}]]&gt;&lt;/expression&gt;
		&lt;/element&gt;
	&lt;/title&gt;
	&lt;columnHeader height="30"&gt;
		&lt;element kind="staticText" uuid="5fa7c3bc-1188-4c17-9154-2c0926d52671" x="0" y="0" width="100" height="25" fontSize="11.0" bold="true" hTextAlign="Center" vTextAlign="Middle"&gt;
			&lt;box&gt;&lt;bottomPen lineWidth="1.0"/&gt;&lt;/box&gt;
			&lt;text&gt;&lt;![CDATA[ID Café]]&gt;&lt;/text&gt;
		&lt;/element&gt;
		&lt;element kind="staticText" uuid="f9ea531b-417d-4c3e-8c65-27a4192b0051" x="100" y="0" width="180" height="25" fontSize="11.0" bold="true" hTextAlign="Left" vTextAlign="Middle"&gt;
			&lt;box&gt;&lt;bottomPen lineWidth="1.0"/&gt;&lt;/box&gt;
			&lt;text&gt;&lt;![CDATA[Productor]]&gt;&lt;/text&gt;
		&lt;/element&gt;
		&lt;element kind="staticText" uuid="68b64401-5bbd-48e8-975c-932198177e5c" x="280" y="0" width="120" height="25" fontSize="11.0" bold="true" hTextAlign="Left" vTextAlign="Middle"&gt;
			&lt;box&gt;&lt;bottomPen lineWidth="1.0"/&gt;&lt;/box&gt;
			&lt;text&gt;&lt;![CDATA[Variedad]]&gt;&lt;/text&gt;
		&lt;/element&gt;
		&lt;element kind="staticText" uuid="c08e58a7-3ce9-4a0b-967f-4775e53303c2" x="400" y="0" width="155" height="25" fontSize="11.0" bold="true" hTextAlign="Right" vTextAlign="Middle"&gt;
			&lt;box&gt;&lt;bottomPen lineWidth="1.0"/&gt;&lt;/box&gt;
			&lt;text&gt;&lt;![CDATA[Cantidad]]&gt;&lt;/text&gt;
		&lt;/element&gt;
	&lt;/columnHeader&gt;
	&lt;detail&gt;
		&lt;band height="25"&gt;
			&lt;element kind="textField" uuid="7ab4a530-eb3d-4c7b-bf2d-7bb2157a9228" x="0" y="0" width="100" height="20" hTextAlign="Center" vTextAlign="Middle"&gt;
				&lt;expression&gt;&lt;![CDATA[$F{idcafe}]]&gt;&lt;/expression&gt;
			&lt;/element&gt;
			&lt;element kind="textField" uuid="09ef0a4a-0a25-4fc1-a9f7-6d65377f0fc1" x="100" y="0" width="180" height="20" hTextAlign="Left" vTextAlign="Middle"&gt;
				&lt;expression&gt;&lt;![CDATA[$F{productor}]]&gt;&lt;/expression&gt;
			&lt;/element&gt;
			&lt;element kind="textField" uuid="80786793-26c7-4498-91f5-98507e1930fc" x="280" y="0" width="120" height="20" hTextAlign="Left" vTextAlign="Middle"&gt;
				&lt;expression&gt;&lt;![CDATA[$F{variedad}]]&gt;&lt;/expression&gt;
			&lt;/element&gt;
			&lt;element kind="textField" uuid="b5a198c9-9ebc-4c49-9831-5079a4c861ea" x="400" y="0" width="155" height="20" pattern="#,##0.00" hTextAlign="Right" vTextAlign="Middle"&gt;
				&lt;expression&gt;&lt;![CDATA[$F{cantidad}]]&gt;&lt;/expression&gt;
			&lt;/element&gt;
		&lt;/band&gt;
	&lt;/detail&gt;
&lt;/jasperReport&gt;</code></pre>
</div>

<!-- PASO 4: TODO DENTRO DE INTELLIJ IDEA -->
<h3 class="text-2xl font-bold text-emerald-300 mb-4 mt-10 flex items-center gap-2">
    <i class="fa-solid fa-laptop-code text-emerald-400"></i> 4. Todo dentro de IntelliJ IDEA: Parámetros, Conexión y <code>AdmonReporte</code>
</h3>

<p class="text-slate-300 mb-4 text-sm leading-relaxed">
    Ahora veamos exactamente qué se pasa como parámetro en <code>JasperFillManager.fillReport(...)</code> dentro de IntelliJ IDEA. El método recibe <strong>3 argumentos</strong>:
</p>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="glass p-4 rounded-xl border-t-4 border-t-rose-500">
        <div class="text-xs font-mono text-rose-400 mb-1">ARGUMENTO 1: sourceFileName</div>
        <h4 class="font-bold text-white text-sm mb-1"><code>"ReporteCafeSQL.jasper"</code></h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Ruta relativa al archivo binario <code>.jasper</code> ubicado en la raíz del proyecto IntelliJ.
        </p>
    </div>

    <div class="glass p-4 rounded-xl border-t-4 border-t-amber-500">
        <div class="text-xs font-mono text-amber-400 mb-1">ARGUMENTO 2: params (<code>Map&lt;String, Object&gt;</code>)</div>
        <h4 class="font-bold text-white text-sm mb-1"><code>parametros</code> o <code>null</code></h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            Un <code>HashMap</code> donde la clave coincide con el nombre del parámetro en Jaspersoft (ej. <code>parametros.put("anio", "2067")</code> para <code>$P{anio}</code>). Si pasas <code>null</code>, Jasper usa el <code>defaultValueExpression</code> (<code>"2026"</code>).
        </p>
    </div>

    <div class="glass p-4 rounded-xl border-t-4 border-t-emerald-500">
        <div class="text-xs font-mono text-emerald-400 mb-1">ARGUMENTO 3: connection (<code>java.sql.Connection</code>)</div>
        <h4 class="font-bold text-white text-sm mb-1"><code>datos.getConexion()</code></h4>
        <p class="text-xs text-slate-300 leading-relaxed">
            ¡El cambio clave! En vez de pasar una lista, le pasamos la <strong>conexión JDBC del Singleton</strong>. Jasper ejecuta internamente el <code>SELECT ... INNER JOIN</code> sobre esa conexión.
        </p>
    </div>
</div>

<!-- 4A: EJEMPLOJASPER.JAVA ACTUALIZADO -->
<h4 class="text-lg font-bold text-white mb-3 mt-6 flex items-center gap-2">
    <span class="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded text-xs font-mono">A</span>
    Prueba Directa y Exportación a PDF en <code>EjemploJasper.java</code>
</h4>

<p class="text-slate-300 mb-3 text-xs leading-relaxed">
    Observa cómo en <code>EjemploJasper.java</code> se comentaron las líneas antiguas de <code>JRBeanCollectionDataSource</code>, se creó el mapa <code>parametros</code> pasando <code>"anio" &rarr; "2067"</code>, se pasó <code>conexion</code> a <code>fillReport</code> y además se usó <code>JasperExportManager.exportReportToPdfFile(reporte, "ReporteCafe.pdf")</code> para generar el PDF directo en la raíz del proyecto:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-emerald-300 text-sm"></i> src/main/java/EjemploJasper/EjemploJasper.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package EjemploJasper;

import com.example.basedatos.ADMON.AdmonCafe;
import com.example.basedatos.ADMON.Datos;
import com.example.basedatos.POJO.Cafe;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.view.JasperViewer;

import java.sql.Connection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class EjemploJasper {
    public static void main(String[] args){
        try {
            AdmonCafe admon = new AdmonCafe();
            LinkedList&lt;Cafe&gt; cafes = admon.obtenerCafe();

            for(Cafe cafe : cafes){
                System.out.println(cafe);
            }

            // 1. Mapa de parámetros: la clave "anio" inyecta el valor en $P{anio} del reporte
            Map&lt;String, Object&gt; parametros = new HashMap&lt;&gt;();
            parametros.put("anio", "2067");

            //JRBeanCollectionDataSource datos = new JRBeanCollectionDataSource(cafes);
            // 2. Obtenemos la conexión activa a la BD desde nuestro Singleton Datos
            Connection conexion = Datos.getInstance().getConexion();

            //JasperPrint reporte = JasperFillManager.fillReport("ReporteCafe.jasper", parametros, datos);
            // 3. Pasamos (archivo .jasper, mapa de parámetros, objeto Connection)
            JasperPrint reporte = JasperFillManager.fillReport("ReporteCafe.jasper", parametros, conexion);

            // 4. Exporta automáticamente el reporte lleno a un archivo PDF físico
            JasperExportManager.exportReportToPdfFile(reporte, "ReporteCafe.pdf");

            // 5. Muestra la ventana de vista previa sin matar la app al cerrar (false)
            JasperViewer vista = new JasperViewer(reporte, false);
            vista.setVisible(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}</code></pre>
</div>

<!-- 4B: CLASE ADMONREPORTE.JAVA -->
<h4 class="text-lg font-bold text-white mb-3 mt-8 flex items-center gap-2">
    <span class="bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded text-xs font-mono">B</span>
    Arquitectura Limpia: Clase <code>AdmonReporte.java</code> en el Paquete <code>ADMON</code>
</h4>

<p class="text-slate-300 mb-3 text-xs leading-relaxed">
    Para integrar los reportes dentro de la aplicación JavaFX respetando la arquitectura en capas del proyecto, creamos la clase administradora <strong><code>AdmonReporte.java</code></strong> dentro de <code>com.example.basedatos.ADMON</code>. Esta clase encapsula la llamada a <code>Datos.getInstance()</code> y devuelve el objeto <code>JasperPrint</code> listo para mostrarse:
</p>

<div class="code-wrapper relative pt-6 mb-8">
    <div class="absolute top-0 left-0 bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
        <i class="fa-brands fa-java text-purple-300 text-sm"></i> src/main/java/com/example/basedatos/ADMON/AdmonReporte.java
    </div>
    <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
    <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">package com.example.basedatos.ADMON;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;

public class AdmonReporte {
    private Datos datos;

    public AdmonReporte(){
        try{
            datos = Datos.getInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public JasperPrint reporteCafes(){
        try {
            // Pasamos el archivo compilado con SQL, null en parámetros (usa el default "2026")
            // y la conexión JDBC (datos.getConexion())
            return JasperFillManager.fillReport("ReporteCafeSQL.jasper", null, datos.getConexion());
        } catch (JRException e) {
            System.err.println(e.getMessage());
        }
        return null;
    }
}</code></pre>
</div>

<!-- 4C: BOTÓN EN JAVAFX (CAFE.FXML Y CAFECONTROLLER.JAVA) -->
<h4 class="text-lg font-bold text-white mb-3 mt-8 flex items-center gap-2">
    <span class="bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded text-xs font-mono">C</span>
    Conectar el Botón <code>Reporte</code> en Scene Builder (<code>cafe.fxml</code>) y <code>CafeController.java</code>
</h4>

<p class="text-slate-300 mb-3 text-xs leading-relaxed">
    Por último, agregamos un cuarto botón <strong>"Reporte"</strong> con el evento <code>onAction="#clicReporte"</code> en nuestra vista <code>cafe.fxml</code> y programamos su controlador en <code>CafeController.java</code>:
</p>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-solid fa-code text-blue-300 text-sm"></i> cafe.fxml (Botón con onAction="#clicReporte")
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-xml">&lt;Button layoutY="140.0" mnemonicParsing="false"
        onAction="#clicAgregar" text="Agregar" /&gt;
&lt;Button layoutX="78.0" layoutY="140.0" mnemonicParsing="false"
        onAction="#clicEditar" text="Editar" /&gt;
&lt;Button layoutX="144.0" layoutY="140.0" mnemonicParsing="false"
        onAction="#clicBorrar" text="Borrar" /&gt;
&lt;!-- Nuevo botón para disparar el reporte desde JavaFX --&gt;
&lt;Button layoutX="205.0" layoutY="140.0" mnemonicParsing="false"
        onAction="#clicReporte" text="Reporte" /&gt;</code></pre>
    </div>

    <div class="code-wrapper relative pt-6">
        <div class="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-t-lg font-mono border-b border-white/10 w-full z-10 flex items-center gap-2">
            <i class="fa-brands fa-java text-emerald-300 text-sm"></i> CafeController.java (Método clicReporte)
        </div>
        <button class="copy-btn mt-6 z-20" onclick="copyCode(this)"><i class="fa-regular fa-copy mr-1"></i> Copiar</button>
        <pre class="rounded-xl rounded-tl-none shadow-lg border border-white/10 m-0"><code class="language-java">import com.example.basedatos.ADMON.AdmonReporte;
import net.sf.jasperreports.view.JasperViewer;

// ... dentro de CafeController:

@FXML
public void clicReporte(ActionEvent actionEvent){
    AdmonReporte reportes = new AdmonReporte();
    // false = al cerrar el visor de Jasper NO se cierra la ventana de JavaFX
    JasperViewer vista = new JasperViewer(reportes.reporteCafes(), false);
    vista.setVisible(true);
}</code></pre>
    </div>
</div>

<!-- RESUMEN VISUAL DE ARCHIVOS EN LA RAÍZ DEL PROYECTO -->
<div class="glass p-6 rounded-xl border-l-4 border-l-amber-500 mb-6">
    <h4 class="font-bold text-amber-300 mb-2 flex items-center gap-2">
        <i class="fa-solid fa-folder-open text-amber-400"></i> Checklist Final: ¿Dónde van los archivos en IntelliJ IDEA?
    </h4>
    <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
        <li><code>informacion.db</code>, <code>ReporteCafe.jrxml</code>, <code>ReporteCafe.jasper</code> y <code>ReporteCafeSQL.jasper</code> deben estar directamente en la <strong>raíz del proyecto</strong> (afuera de <code>src/</code>, al mismo nivel que <code>pom.xml</code>).</li>
        <li>En <strong>Jaspersoft Studio</strong> el Data Adapter usa la ruta completa al archivo (<code>jdbc:sqlite:C:/.../baseDatos/informacion.db</code>) y tiene el <code>.jar</code> de Maven cargado en la pestaña <strong>Driver Classpath</strong>.</li>
        <li>En <strong>IntelliJ IDEA</strong> no importa en qué computadora se abra el proyecto: aunque el reporte <code>.jrxml</code> diga <code>defaultdataadapter="informacionCafe"</code>, cuando llamas a <code>JasperFillManager.fillReport("ReporteCafeSQL.jasper", null, datos.getConexion())</code> desde Java, <strong>Jasper ignora la ruta fija del adaptador y usa la conexión dinámica de tu clase <code>Datos.java</code></strong> (MySQL o SQLite local).</li>
    </ul>
</div>
`,R=`<h2 class="text-3xl font-bold mb-4 flex items-center gap-3 text-emerald-400">
    <i class="fa-solid fa-flask"></i>
    Laboratorio
</h2>

<p class="text-slate-300 mb-8 text-sm">Aplica lo aprendido. Usa la <strong>Terminal Global</strong> de la derecha para escribir, resolver y ejecutar estos retos.</p>

<div class="flex flex-col gap-8">
    <!-- Reto 1 -->
    <div class="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <h4 class="text-xl font-bold text-blue-400 mb-3">Reto 1: Scanner y Arreglos</h4>
        <p class="text-sm text-slate-300 mb-4 leading-relaxed">
            <strong>Objetivo:</strong> Crea un programa que declare un arreglo 1D vacío de tamaño 3. <br>
            Usa la caja negra (<code>Scanner</code>) para pedirle al usuario 3 números en la consola dentro de un ciclo <code>for</code> y guárdalos en el arreglo. Al final, imprime todo usando el bucle <code>for-each</code>.
        </p>
        
        <button onclick="toggleHint('hint1')" class="text-xs font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"><i class="fa-solid fa-eye mr-2"></i>Ver Pista</button>
        <div id="hint1" class="hidden mt-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg text-sm text-blue-200 font-mono">
            import java.util.Scanner;<br><br>
            Scanner sc = new Scanner(System.in);<br>
            int[] arr = new int[3];<br>
            // Haz un for usando i < arr.length<br>
            // Dentro pon arr[i] = sc.nextInt();
        </div>
    </div>

    <!-- Reto 2 -->
    <div class="bg-black/40 border border-emerald-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <h4 class="text-xl font-bold text-emerald-400 mb-3">Reto 2: Rompiendo la Copia Fantasma</h4>
        <p class="text-sm text-slate-300 mb-4 leading-relaxed">
            <strong>Objetivo:</strong> Entender el caos y curarlo.<br>
            1. Crea <code>int[][] matriz = {{10,20}, {30,40}};</code><br>
            2. Haz una copia mala: <code>int[][] mala = matriz.clone();</code><br>
            3. Modifica <code>mala[0][0] = 99;</code> y luego imprime <code>matriz[0][0]</code>. Verás que se rompió la original.<br>
            4. Elimina la copia mala e implementa tú mismo la <strong>Copia Profunda</strong> con doble ciclo <code>for</code>. Demuestra que modificar la copia ya no afecta el original.
        </p>
        <button onclick="toggleHint('hint2')" class="text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg transition-colors"><i class="fa-solid fa-check mr-2"></i>Ver Solución Parcial</button>
        <div id="hint2" class="hidden mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-200 font-mono">
            int[][] copiaFinal = new int[matriz.length][];<br>
            for(int i=0; i &lt; matriz.length; i++){<br>
            &nbsp;&nbsp;copiaFinal[i] = new int[matriz[i].length]; // Aísla la fila<br>
            &nbsp;&nbsp;for(int j=0; j &lt; matriz[i].length; j++){<br>
            &nbsp;&nbsp;&nbsp;&nbsp;copiaFinal[i][j] = matriz[i][j]; // Copia el valor<br>
            &nbsp;&nbsp;}<br>
            }
        </div>
    </div>
</div>
`,M={intro:m,"io-control":u,arreglos:b,matrices:g,poo:x,uml:f,"poo-avanzado":v,excepciones:h,archivos:C,binarios:S,interfaces:y,enums:E,clone:A,javafx:w,"javafx-avanzado":L,propiedades:j,"bd-fundamentos":P,"bd-herramientas":T,"jdbc-dao":I,"reportes-jasper":O,"reportes-jasper-bd":D,laboratorio:R};window.switchTab=function(e){document.querySelectorAll(".btn-tab").forEach(o=>{o.classList.remove("active"),o.id.includes("laboratorio")||(o.classList.replace("text-blue-400","text-slate-300"),o.classList.remove("font-bold"))});const a=document.getElementById("main-content");a.innerHTML=M[e];const n=document.getElementById("tab-"+e);n&&(n.classList.add("active"),e!=="laboratorio"&&(n.classList.replace("text-slate-300","text-blue-400"),n.classList.add("font-bold"))),window.hljs&&window.hljs.highlightAll(),e==="uml"&&N()};let l="";function i(){const e=document.getElementById("uml-editor"),a=document.getElementById("uml-diagram-img"),n=document.getElementById("uml-status"),o=document.getElementById("uml-loading");if(!e||!a)return;const t=e.value;o&&o.classList.remove("hidden"),n&&(n.textContent="Compilando...",n.className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono"),fetch("https://kroki.io/plantuml/svg",{method:"POST",headers:{"Content-Type":"text/plain"},body:t}).then(s=>{if(!s.ok)throw new Error("Network response was not ok");return s.blob()}).then(s=>{const p=URL.createObjectURL(s);a.src=p,o&&o.classList.add("hidden"),n&&(n.textContent="Actualizado",n.className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono")}).catch(s=>{o&&o.classList.add("hidden"),n&&(n.textContent="Error de sintaxis",n.className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono")})}let d=null;function N(){const e=document.getElementById("uml-editor");e&&(l||(l=e.value),i(),e.addEventListener("input",()=>{clearTimeout(d),d=setTimeout(i,400)}))}window.resetUmlCode=function(){const e=document.getElementById("uml-editor");e&&l&&(e.value=l,i())};window.copyUmlCode=function(){const e=document.getElementById("uml-editor");e&&navigator.clipboard.writeText(e.value).then(()=>{c()})};window.toggleHint=function(e){const a=document.getElementById(e);a.classList.contains("hidden")?a.classList.remove("hidden"):a.classList.add("hidden")};window.copyCode=function(e){const n=e.nextElementSibling.querySelector("code").innerText;navigator.clipboard.writeText(n).then(()=>{c()}).catch(o=>{console.error("Error al intentar copiar al portapapeles: ",o),alert("No se pudo copiar automáticamente. Puedes seleccionar el texto y copiarlo manualmente.")})};function c(){const e=document.getElementById("toast");e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},3e3)}window.toggleTerminal=function(){const e=document.getElementById("terminal-widget"),a=document.getElementById("terminal-overlay");e.classList.contains("translate-x-full")?(e.classList.remove("translate-x-full"),a.classList.remove("hidden"),setTimeout(()=>{a.classList.remove("opacity-0"),a.classList.add("opacity-100")},10)):(e.classList.add("translate-x-full"),a.classList.remove("opacity-100"),a.classList.add("opacity-0"),setTimeout(()=>{a.classList.add("hidden")},300))};document.addEventListener("DOMContentLoaded",()=>{window.switchTab("intro")});
