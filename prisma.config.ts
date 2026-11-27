try {
  process.loadEnvFile?.();
} catch {
  // Ignore if .env is absent in CI/production
}
import { defineConfig } from "prisma/config";

// Prisma CLI's SQLite datasource only accepts local file: URLs.
// Remote Turso schemas are synchronized via sync-turso-schema.js.
const localUrl =
  process.env["DATABASE_URL"] ||
  (process.env["TURSO_DATABASE_URL"]?.startsWith("file:")
    ? process.env["TURSO_DATABASE_URL"]
    : "file:./dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: localUrl,
  },
});
