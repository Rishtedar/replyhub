// Used only for `prisma migrate deploy --config prisma.migrate.config.ts`.
//
// DATABASE_URL runs through Supabase's transaction-mode pooler (port 6543)
// for normal app queries, but that pooler doesn't hold the session-level
// advisory lock `prisma migrate deploy` needs — it hangs indefinitely
// against it. DIRECT_URL (session-mode, port 5432) is a separate connection
// used for this one command only; the app itself never reads it.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
