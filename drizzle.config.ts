import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/lib/server/db/schema.ts', // Point to your schema file
    out: './drizzle', // Where SQL migrations will be saved
    dialect: 'sqlite', // D1 is SQLite-based
});
