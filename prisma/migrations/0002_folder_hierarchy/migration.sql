-- AlterTable
ALTER TABLE "Folder" ADD COLUMN "parentId" TEXT REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Folder_parentId_idx" ON "Folder"("parentId");
