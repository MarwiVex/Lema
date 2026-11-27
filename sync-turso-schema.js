try {
  process.loadEnvFile?.();
} catch {
  // .env optional if vars are already in environment
}

const { createClient } = require('@libsql/client');

const useLocal = process.argv.includes('--local');
const url = useLocal
  ? process.env.DATABASE_URL || 'file:./dev.db'
  : process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = useLocal ? undefined : process.env.TURSO_AUTH_TOKEN;

if (!url.startsWith('file:') && !authToken) {
  console.error('Error: TURSO_AUTH_TOKEN es requerido cuando se usa una URL remota de Turso.');
  process.exit(1);
}

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

const baseStatements = [
  `CREATE TABLE IF NOT EXISTS "Folder" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "parentId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("parentId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "Document" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "normalizedTitle" TEXT NOT NULL DEFAULT '',
      "type" TEXT NOT NULL DEFAULT 'TEXT',
      "content" TEXT NOT NULL,
      "whiteboardData" TEXT,
      "folderId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "OcrCache" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "imageHash" TEXT NOT NULL UNIQUE,
      "blocksJson" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "LatexProject" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "pdfBase64" TEXT,
      "compiledAt" DATETIME,
      "folderId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "LatexFile" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "filename" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "isBinary" BOOLEAN NOT NULL DEFAULT 0,
      "isMain" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("projectId") REFERENCES "LatexProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "_DocumentLinks" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      FOREIGN KEY ("A") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("B") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "GraphEdge" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sourceId" TEXT NOT NULL,
      "targetId" TEXT NOT NULL,
      "label" TEXT,
      "weight" REAL NOT NULL DEFAULT 1.0,
      "kind" TEXT NOT NULL DEFAULT 'AUTO',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
  );`,
];

const indexStatements = [
  `CREATE INDEX IF NOT EXISTS "Folder_createdAt_idx" ON "Folder"("createdAt");`,
  `CREATE INDEX IF NOT EXISTS "Folder_parentId_idx" ON "Folder"("parentId");`,
  `CREATE INDEX IF NOT EXISTS "Document_folderId_idx" ON "Document"("folderId");`,
  `CREATE INDEX IF NOT EXISTS "Document_title_idx" ON "Document"("title");`,
  `CREATE INDEX IF NOT EXISTS "Document_normalizedTitle_idx" ON "Document"("normalizedTitle");`,
  `CREATE INDEX IF NOT EXISTS "Document_updatedAt_idx" ON "Document"("updatedAt");`,
  `CREATE INDEX IF NOT EXISTS "OcrCache_createdAt_idx" ON "OcrCache"("createdAt");`,
  `CREATE INDEX IF NOT EXISTS "LatexProject_folderId_idx" ON "LatexProject"("folderId");`,
  `CREATE INDEX IF NOT EXISTS "LatexProject_updatedAt_idx" ON "LatexProject"("updatedAt");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LatexFile_projectId_filename_key" ON "LatexFile"("projectId", "filename");`,
  `CREATE INDEX IF NOT EXISTS "LatexFile_projectId_isMain_idx" ON "LatexFile"("projectId", "isMain");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "_DocumentLinks_AB_unique" ON "_DocumentLinks"("A", "B");`,
  `CREATE INDEX IF NOT EXISTS "_DocumentLinks_B_index" ON "_DocumentLinks"("B");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "GraphEdge_sourceId_targetId_key" ON "GraphEdge"("sourceId", "targetId");`,
  `CREATE INDEX IF NOT EXISTS "GraphEdge_sourceId_idx" ON "GraphEdge"("sourceId");`,
  `CREATE INDEX IF NOT EXISTS "GraphEdge_targetId_idx" ON "GraphEdge"("targetId");`,
];

async function ensureFolderParentIdColumn() {
  const info = await client.execute(`PRAGMA table_info("Folder");`);
  const hasCol = info.rows.some((r) => r.name === 'parentId');
  if (!hasCol) {
    console.log('Adding Folder.parentId column...');
    await client.execute(
      `ALTER TABLE "Folder" ADD COLUMN "parentId" TEXT REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;`
    );
  }
}

async function ensureNormalizedTitleColumn() {
  const info = await client.execute(`PRAGMA table_info("Document");`);
  const hasCol = info.rows.some((r) => r.name === 'normalizedTitle');
  if (!hasCol) {
    console.log('Adding Document.normalizedTitle column...');
    await client.execute(
      `ALTER TABLE "Document" ADD COLUMN "normalizedTitle" TEXT NOT NULL DEFAULT '';`
    );
  }
  await client.execute(
    `UPDATE "Document" SET "normalizedTitle" = lower(trim("title")) WHERE "normalizedTitle" = '' OR "normalizedTitle" IS NULL;`
  );
}

async function deduplicateLatexFiles() {
  const dupRes = await client.execute(`
    SELECT "projectId", "filename", COUNT(*) as cnt
    FROM "LatexFile"
    GROUP BY "projectId", "filename"
    HAVING cnt > 1;
  `);

  for (const row of dupRes.rows) {
    const projectId = row.projectId;
    const filename = row.filename;
    const filesRes = await client.execute({
      sql: `SELECT "id" FROM "LatexFile" WHERE "projectId" = ? AND "filename" = ? ORDER BY "isMain" DESC, "updatedAt" DESC;`,
      args: [projectId, filename],
    });
    const idsToRename = filesRes.rows.slice(1).map((r) => r.id);
    for (let idx = 0; idx < idsToRename.length; idx++) {
      const suffix = `.dup_${idx + 1}`;
      await client.execute({
        sql: `UPDATE "LatexFile" SET "filename" = ? WHERE "id" = ?;`,
        args: [`${filename}${suffix}`, idsToRename[idx]],
      });
    }
  }
}

async function main() {
  const safeTarget = url.startsWith('file:') ? url : url.replace(/\/\/([^@]+@)?/, '//');
  console.log(`Synchronizing schema with ${safeTarget}...`);

  for (const stmt of baseStatements) {
    await client.execute(stmt);
  }

  await ensureFolderParentIdColumn();
  await ensureNormalizedTitleColumn();
  await deduplicateLatexFiles();

  for (const stmt of indexStatements) {
    await client.execute(stmt);
  }

  console.log('Schema synchronized successfully!');
}

main().catch((err) => {
  console.error('Failed to sync schema:', err);
  process.exit(1);
});
