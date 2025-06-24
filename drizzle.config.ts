
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "./dev.db",
  },
});
