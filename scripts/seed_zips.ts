import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';

async function walk(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

async function processFolder(folderName: string, folderPath: string) {
  if (!fs.existsSync(folderPath)) return;
  console.log(`Procesando carpeta: ${folderName}`);
  
  // Buscar si ya existe la carpeta y borrarla? O crearla nueva.
  // Vamos a crearla siempre nueva.
  const folder = await prisma.folder.create({
    data: { name: folderName }
  });

  const files = await walk(folderPath);
  const texFiles = files.filter(f => f.endsWith('.tex'));
  if (texFiles.length === 0) {
    console.log(`No .tex files found in ${folderPath}`);
    return;
  }
  
  const latexProject = await prisma.latexProject.create({
    data: {
      title: folderName, // Same as folder name by default
      folderId: folder.id,
    }
  });

  for (const file of files) {
    const isBinary = !file.endsWith('.tex') && !file.endsWith('.sty') && !file.endsWith('.cls') && !file.endsWith('.bib');
    const isMain = path.basename(file) === 'main.tex';
    let content = '';
    
    if (isBinary) {
      content = fs.readFileSync(file, 'base64');
    } else {
      content = fs.readFileSync(file, 'utf-8');
    }

    const relPath = path.relative(folderPath, file).replace(/\\/g, '/');

    await prisma.latexFile.create({
      data: {
        projectId: latexProject.id,
        filename: relPath,
        content,
        isBinary,
        isMain
      }
    });
  }
  console.log(`Importado ${folderName} con éxito.`);
}

async function main() {
  // 1. Delete old "Guitarra" folders
  console.log("Eliminando carpetas antiguas de 'Guitarra'...");
  await prisma.folder.deleteMany({
    where: { name: 'Guitarra' }
  });

  // 2. Process Discrete Mathematics
  await processFolder('Matemáticas Discretas', path.resolve('Discrete_mathematics'));

  // 3. Process Guitarra
  await processFolder('Guitarra', path.resolve('Guitarra'));
  
  console.log("Completado");
}

main().catch(console.error).finally(() => prisma.$disconnect());
