-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "whiteboardData" TEXT,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OcrCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageHash" TEXT NOT NULL,
    "blocksJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LatexProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pdfBase64" TEXT,
    "compiledAt" DATETIME,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LatexProject_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LatexFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isBinary" BOOLEAN NOT NULL DEFAULT false,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LatexFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LatexProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GraphEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "label" TEXT,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "kind" TEXT NOT NULL DEFAULT 'AUTO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DocumentLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DocumentLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Folder_createdAt_idx" ON "Folder"("createdAt");

-- CreateIndex
CREATE INDEX "Document_folderId_idx" ON "Document"("folderId");

-- CreateIndex
CREATE INDEX "Document_title_idx" ON "Document"("title");

-- CreateIndex
CREATE INDEX "Document_normalizedTitle_idx" ON "Document"("normalizedTitle");

-- CreateIndex
CREATE INDEX "Document_updatedAt_idx" ON "Document"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OcrCache_imageHash_key" ON "OcrCache"("imageHash");

-- CreateIndex
CREATE INDEX "OcrCache_createdAt_idx" ON "OcrCache"("createdAt");

-- CreateIndex
CREATE INDEX "LatexProject_folderId_idx" ON "LatexProject"("folderId");

-- CreateIndex
CREATE INDEX "LatexProject_updatedAt_idx" ON "LatexProject"("updatedAt");

-- CreateIndex
CREATE INDEX "LatexFile_projectId_isMain_idx" ON "LatexFile"("projectId", "isMain");

-- CreateIndex
CREATE UNIQUE INDEX "LatexFile_projectId_filename_key" ON "LatexFile"("projectId", "filename");

-- CreateIndex
CREATE INDEX "GraphEdge_sourceId_idx" ON "GraphEdge"("sourceId");

-- CreateIndex
CREATE INDEX "GraphEdge_targetId_idx" ON "GraphEdge"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "GraphEdge_sourceId_targetId_key" ON "GraphEdge"("sourceId", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentLinks_AB_unique" ON "_DocumentLinks"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentLinks_B_index" ON "_DocumentLinks"("B");

