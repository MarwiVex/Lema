import { prisma } from '../src/lib/prisma';

const preamble = `\\documentclass[10pt, landscape, twocolumn]{article}

% --- Librerías Requeridas ---
\\usepackage[margin=0.5in, columnsep=0.4in]{geometry}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{xcolor}
\\usepackage{tabularx}
\\usepackage{booktabs}
\\usepackage{listings} % For code blocks

% --- Configuración de Formato ---
\\pagestyle{empty} % Sin números de página
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{2pt}

% Ajuste de espacios en ecuaciones
\\AtBeginDocument{
  \\setlength{\\abovedisplayskip}{3pt}
  \\setlength{\\belowdisplayskip}{3pt}
  \\setlength{\\abovedisplayshortskip}{1pt}
  \\setlength{\\belowdisplayshortskip}{1pt}
}

% --- Definición de Colores ---
\\definecolor{themeblue}{RGB}{0, 90, 160}
\\definecolor{themegray}{RGB}{80, 80, 80}

% --- Comandos Personalizados para Títulos ---
\\newcommand{\\cheatsheetsection}[1]{
    \\vspace{0.6em}
    {\\color{themeblue}\\large\\bfseries #1} \\par
    \\vspace{-0.5em}
    {\\color{themeblue}\\rule{\\linewidth}{1pt}} \\par
    \\vspace{0.2em}
}

\\newcommand{\\cheatsheetsubsection}[1]{
    \\vspace{0.4em}
    {\\color{themeblue}\\normalsize\\bfseries #1} \\par
    \\vspace{0.1em}
}`;

function makeDoc(title: string, subtitle: string, body: string) {
  return `${preamble}

% --- Inicio del Documento ---
\\begin{document}

% --- Cabecera ---
\\begin{center}
    \\vspace{-1em}
    {\\color{themeblue}\\huge\\bfseries ${title}}\\\\[0.1em]
    {\\color{themegray}\\small ${subtitle}}\\\\[0.4em]
    {\\color{themegray}\\footnotesize \\textbf{Por MarwiVex}}
\\end{center}
\\vspace{-1em}

${body}

\\end{document}`;
}

const topics = [
  {
    title: "1. Fundamentos de Java",
    content: makeDoc("Fundamentos de Java", "Variables, Control de Flujo y Estructuras de Datos", `
\\cheatsheetsection{Impresión en Consola}
Si vienes de C, Java te será muy familiar. Como un repaso súper rápido, todo en Java vive dentro de una \\texttt{class} y arranca desde un método \\texttt{public static void main(String[] args)}.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class principal {
    public static void main(String[] args){
        System.out.print("Hola Mundo");     // Sin salto de línea
        System.out.println("Hola Mundo");   // Con salto de línea
        System.out.printf("Hola Mundo \\n"); // Formateado (Igual que C)

        System.err.println("Hola Error");   // Imprime un error (rojo en consola)
    }
}
\\end{lstlisting}

\\cheatsheetsection{Cadenas (Strings)}
En Java ya no sufres con los arreglos de \\texttt{char}. Existe el objeto \\texttt{String} que se concatena fácilmente con el símbolo \\texttt{+} o \\texttt{+=}.
\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class string {
    public static void main(String[] args){
        String Cadena = "Hola mundo";
        Cadena += " desde Java\\n";
        Cadena += " en clase de POO";
        System.out.println(Cadena);

        // Los char[] aún existen, pero se usan poco
        char arreglo[] = {'H', 'o', 'l', 'a'};
        System.out.println(arreglo);
    }
}
\\end{lstlisting}

\\cheatsheetsection{Datos Primitivos vs Wrappers}
Además de los primitivos que ya conoces (\\texttt{int}, \\texttt{float}), Java tiene envoltorios o "Wrappers" (\\texttt{Integer}, \\texttt{Float}). Hacen lo mismo pero incluyen funciones extra.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class datos {
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
}
\\end{lstlisting}

\\cheatsheetsection{Scanner: La "Caja Negra"}
Olvídate del \\texttt{scanf}. En Java se utilizan Flujos de Datos (Streams) y clases para leer datos. 
Como aún no dominas la Programación Orientada a Objetos, el profesor te indica usar \\texttt{Scanner} como una caja negra: solo apréndete la sintaxis exacta, pon los datos que te pide, y obtén la respuesta. Magia.

\\begin{itemize}
    \\item Regla 1: Importar arriba: \\texttt{import java.util.Scanner;}
    \\item Regla 2: Instanciar: \\texttt{Scanner leer = new Scanner(System.in);}
    \\item Regla 3: Extraer valores: \\texttt{leer.nextInt()}, \\texttt{leer.next()}, etc.
\\end{itemize}

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
import java.util.Scanner; // Importación OBLIGATORIA

public class pasevalores {
    public static void main(String[] args){
        // CAJA NEGRA: Crear el scanner
        Scanner leer = new Scanner(System.in);
        
        // Evita bugs visuales en la terminal con los 'Enters'
        leer.useDelimiter("\\n"); 

        System.out.print("Ingresa un número entero: ");
        int dato = leer.nextInt(); // Lee entero de la consola
        System.out.println("Leíste: " + dato);
        
        System.out.print("Ingresa un texto continuo: ");
        String cadena = leer.next(); // Lee un string
        System.out.println("Leíste: " + cadena);
    }
}
\\end{lstlisting}

\\cheatsheetsection{Estructuras de Control (Repaso)}
Si sabes C, ya sabes esto. \\texttt{if}, \\texttt{for}, \\texttt{while} y \\texttt{do-while} operan idéntico. La única mejora brutal es que en Java el \\texttt{switch} \\textbf{sí permite evaluar Strings}.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class Estructuracontrol {
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
}
\\end{lstlisting}

\\cheatsheetsection{Funciones (Métodos)}
Para hacer una función, simplemente métela en tu clase. Si vas a llamarla directamente desde tu \\texttt{main} (que es \\texttt{static}), tu función obligatoriamente debe ser \\texttt{static} también.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class funciones {
    public static void main(String[] args){
        int resultado = suma(2, 3);
        System.out.println("Resultado: " + resultado);
    }

    // public: Todo el mundo la ve
    // static: Pertenece a la clase, se llama directo
    public static int suma(int a, int b){
        return a + b;
    }
}
\\end{lstlisting}

\\cheatsheetsection{Arreglos (Arrays) y Memoria}
En Java olvídate de pedir memoria manualmente con \\texttt{malloc}. Los arreglos siempre se guardan de forma dinámica usando la palabra reservada \\texttt{new}. ¿Y cómo evitas fugas de memoria sin \\texttt{free()}? 
Java tiene un sistema llamado Garbaje Collector (Recolector de Basura) que destruye automáticamente la memoria que ya no está en uso. Una maravilla!

A diferencia de C, donde un arreglo no sabe su propio tamaño, en Java todo arreglo tiene una propiedad mágica llamada \\texttt{.length}. Además, te presentamos el bucle For-Each, que te permite recorrer todos los datos de golpe sin usar índices.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class arreglos {
    public static void main(String[] args){
        // Pedimos memoria en Heap para 3 enteros. 
        // Nota: Por defecto, Java los inicializa en 0 (no en basura)
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
}
\\end{lstlisting}

\\cheatsheetsection{Matrices y Copias}
Llegamos al tema donde la mayoría tropieza. En Java, \\textbf{NO EXISTEN las matrices de verdad}. Es decir, no reserva un cuadro perfecto en memoria. Lo que hace Java es crear "Arreglos que apuntan a otros arreglos" (Jagged Arrays o Arreglos Escalonados).

Instancias un arreglo "maestro" (las filas). Luego, a cada espacio de ese arreglo le insertas otro arreglo (las columnas). Esto permite que cada fila pueda tener un tamaño diferente.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class matriz {
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
}
\\end{lstlisting}

\\cheatsheetsubsection{El Peligro: La Copia Fantasma (Shallow Copy)}
Si tienes un arreglo de 1 dimensión y usas el método \\texttt{.clone()}, hace una copia perfecta. Pero si tienes una matriz, \\textbf{es una trampa mortal!}

Al hacer \\texttt{matriz.clone()}, Java copia la estructura principal (las filas), pero NO duplica la memoria de las columnas internas. 
Ambas matrices (original y copia) terminan compartiendo las mismas columnas en la RAM. Si alteras la copia, la original se muta mágicamente y tus datos colapsan.

\\cheatsheetsubsection{Solución: La Copia Profunda (Deep Copy)}
Para crear una copia verdaderamente independiente y aislada de todo, tienes que decirle a Java que asigne memoria nueva a cada fila y luego copiar los números uno por uno manualmente con un \\texttt{for}.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class copiaprofunda {
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
        
        // PRUEBA DE AISLAMIENTO
        copiaLimpia[0][0] = 999;
        System.out.println("Original: " + original[0][0]); // Imprime 1
        System.out.println("Copia: " + copiaLimpia[0][0]); // Imprime 999
    }
}
\\end{lstlisting}`)
  },
  {
    title: "2. Programacion Orientada a Objetos",
    content: makeDoc("Programación Orientada a Objetos", "Fundamentos, UML, Herencia y Polimorfismo", `
\\cheatsheetsection{Conceptos Fundamentales}
La Programación Orientada a Objetos (POO) es el paradigma principal en Java. Se basa en organizar el código modelando entidades del mundo real llamadas "objetos".
\\begin{itemize}
    \\item \\textbf{Clase:} Plantilla o molde abstracto que define los atributos (datos/estado) y métodos (comportamientos).
    \\item \\textbf{Objeto:} Unidad básica en POO que combina estado y comportamiento.
    \\item \\textbf{Instancia:} La materialización concreta e individualizada en memoria de una clase (con \\texttt{new}).
    \\item \\textbf{Método:} Subrutina o función definida dentro de una clase.
\\end{itemize}

\\cheatsheetsection{Los 4 Pilares de la POO}
\\begin{itemize}
    \\item \\textbf{Abstracción:} Modelar únicamente las características esenciales de una entidad.
    \\item \\textbf{Encapsulamiento:} Ocultamiento de los detalles internos, exponiendo interfaces seguras.
    \\item \\textbf{Herencia:} Derivar atributos y métodos de una clase existente.
    \\item \\textbf{Polimorfismo:} Tratar objetos de distintas subclases como instancias de una superclase común.
\\end{itemize}

\\cheatsheetsection{Ejemplo en Java}
\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class Alumno {
    // Atributos PRIVADOS (Protegidos)
    private String nombre;
    private int edad;
    private int nua;

    // Setters (Validación)
    public void setNombre(String valor) { this.nombre = valor; }

    public void setEdad(int valor) {
        if (valor >= 15 && valor <= 100) {
            this.edad = valor;
        } else {
            System.out.println("Error: Edad no permitida.");
        }
    }

    public void setNUA(int valor) { this.nua = valor; }

    // Getters
    public String getNombre() { return this.nombre; }
    public int getEdad() { return this.edad; }
    public int getNUA() { return this.nua; }

    public String imprimir() {
        return String.format("%d, %s, %d \\n", nua, nombre, edad);
    }
}

public class Principal {
    public static void main(String[] args) {
        Alumno alumno1 = new Alumno();
        alumno1.setNombre("Juan");
        alumno1.setEdad(18); // Válido
        alumno1.setNUA(213232);

        System.out.print(alumno1.imprimir());
        alumno1.setEdad(200); // Rechazado por validación
    }
}
\\end{lstlisting}

\\cheatsheetsection{Diagramas UML}
Los diagramas de clases UML (Unified Modeling Language) son una representación visual del diseño orientado a objetos de un sistema. Nos permiten planificar la estructura de clases, sus atributos, métodos y las relaciones entre ellas.

\\cheatsheetsubsection{Nomenclatura UML}
\\begin{itemize}
    \\item \\textbf{- Privado (private):} Accesible solo dentro de la misma clase.
    \\item \\textbf{+ Público (public):} Accesible desde cualquier lugar del programa.
    \\item \\textbf{\\# Protegido (protected):} Accesible en el paquete y por subclases.
\\end{itemize}

\\cheatsheetsubsection{Código Java Equivalente a un Diagrama}
Así se traduce la jerarquía de un diagrama UML a código Java real:

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
// Superclase
class Electronico {
    private String NS;
    private String Marca;
    private float Precio;

    public void setNS(String NS) { this.NS = NS; }
    public String getNS() { return this.NS; }
    public void setMarca(String Marca) { this.Marca = Marca; }
    public String getMarca() { return this.Marca; }
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

// Subclase 2: Consola (Hereda de Electronico)
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
        tv.setPulgadas(65.0f);
        tv.setPrecio(1200.50f);

        System.out.println("TV Marca: " + tv.getMarca() + " | Pulgadas: " + tv.getPulgadas());
    }
}
\\end{lstlisting}

\\cheatsheetsection{POO Avanzado: Herencia, Polimorfismo, Casteo}

\\cheatsheetsubsection{Herencia en Java: La palabra clave extends}
La palabra clave \\texttt{extends} establece una relación de Herencia entre dos clases, creando una jerarquía de tipo "Es Un" (Is-A). 
Por ejemplo: \\texttt{public class Televisor extends Electronico} significa que un Televisor es un Electrónico.

El modificador \\texttt{protected} permite que los atributos de la superclase sean accesibles directamente por las clases hijas. En Java NO existe herencia múltiple de clases.

\\cheatsheetsubsection{Polimorfismo, Casteo e instanceof}
El Polimorfismo permite tratar objetos de distintas subclases a través de un tipo genérico común.

\\textbf{Upcasting (Conversión Implícita):}
\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
Electronico e1 = new Televisor(); // Válido y automático
\\end{lstlisting}

\\textbf{Downcasting (Conversión Explícita):}
Requiere casteo manual y debe ser validado con \\texttt{instanceof}.
\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
if (electronico instanceof Televisor tele) {
    tele.setPulgadas(55f);
}
\\end{lstlisting}

\\cheatsheetsubsection{Ocultamiento de Variables (Shadowing)}
NUNCA vuelvas a declarar en una clase hija un atributo que ya heredaste del padre (ej. \\texttt{private Float precio;} cuando el padre ya tiene uno). Java creará dos variables distintas en memoria y causará inconsistencias lógicas.

\\cheatsheetsubsection{LinkedList vs Arreglos en Memoria}
\\begin{itemize}
    \\item \\textbf{Arreglos / ArrayList:} Bloque contiguo. Acceso inmediato O(1). Inserción costosa O(N).
    \\item \\textbf{LinkedList:} Nodos dispersos. Acceso por índice es O(N). Inserción en los extremos O(1).
\\end{itemize}

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
import java.util.LinkedList;

class Electronico {
    protected String marca;
    protected Float precio;
    public void setMarca(String m) { this.marca = m; }
}

class Televisor extends Electronico {
    private Float pulgadas;
    public void setPulgadas(Float p) { this.pulgadas = p; }
}

public class Main {
    public static void main(String[] args) {
        LinkedList<Electronico> electronicos = new LinkedList<>();
        electronicos.add(new Televisor());

        Electronico primerElem = electronicos.get(0);
        primerElem.setMarca("Samsung");

        if (primerElem instanceof Televisor tele) {
            tele.setPulgadas(55f);
        }
    }
}
\\end{lstlisting}`)
  },
  {
    title: "3. Laboratorio Practico",
    content: makeDoc("Laboratorio Práctico", "Ejercicios y Retos de Java", `
\\cheatsheetsection{Reto 1: Scanner y Arreglos}
\\textbf{Objetivo:} Crea un programa que declare un arreglo 1D vacío de tamaño 3. Usa la caja negra (\\texttt{Scanner}) para pedirle al usuario 3 números en la consola dentro de un ciclo \\texttt{for} y guárdalos en el arreglo. Al final, imprime todo usando el bucle \\texttt{for-each}.

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
import java.util.Scanner;

public class Reto1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] arr = new int[3];
        
        for (int i = 0; i < arr.length; i++) {
            System.out.print("Ingresa el numero " + (i+1) + ": ");
            arr[i] = sc.nextInt();
        }
        
        for (int num : arr) {
            System.out.println(num);
        }
    }
}
\\end{lstlisting}

\\cheatsheetsection{Reto 2: Rompiendo la Copia Fantasma}
\\textbf{Objetivo:} Entender el caos y curarlo con una Copia Profunda.
\\begin{itemize}
    \\item 1. Crea \\texttt{int[][] matriz = \\{\\{10,20\\}, \\{30,40\\}\\};}
    \\item 2. Haz una copia mala: \\texttt{int[][] mala = matriz.clone();}
    \\item 3. Modifica \\texttt{mala[0][0] = 99;} y luego imprime \\texttt{matriz[0][0]}. Verás que se rompió la original.
    \\item 4. Implementa la Copia Profunda aislando memoria y copiando valor a valor.
\\end{itemize}

\\begin{lstlisting}[language=Java, basicstyle=\\ttfamily\\scriptsize, frame=single, breaklines=true]
public class Reto2 {
    public static void main(String[] args) {
        int[][] matriz = {{10, 20}, {30, 40}};
        
        int[][] copiaFinal = new int[matriz.length][];
        for(int i=0; i < matriz.length; i++){
            copiaFinal[i] = new int[matriz[i].length]; // Aísla la fila
            for(int j=0; j < matriz[i].length; j++){
                copiaFinal[i][j] = matriz[i][j]; // Copia el valor
            }
        }
    }
}
\\end{lstlisting}`)
  }
];

async function main() {
  const oldFolders = await prisma.folder.findMany({
    where: { name: 'Curso de Java Interactive' }
  });
  
  for (const f of oldFolders) {
    const projects = await prisma.latexProject.findMany({
      where: { folderId: f.id }
    });
    for (const p of projects) {
        await prisma.latexProject.delete({ where: { id: p.id } });
    }
    await prisma.folder.delete({ where: { id: f.id } });
    console.log('Deleted old folder:', f.id);
  }

  const folder = await prisma.folder.create({
    data: { name: 'Curso de Java Interactive' }
  });
  console.log('Created new folder:', folder.id);

  for (const topic of topics) {
    const project = await prisma.latexProject.create({
      data: {
        title: topic.title,
        folderId: folder.id,
        files: {
          create: [
            {
              filename: 'main.tex',
              content: topic.content,
              isMain: true,
              isBinary: false
            }
          ]
        }
      }
    });
    console.log('Created LatexProject with restored content:', project.title, project.id);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
});
