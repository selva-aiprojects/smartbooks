import { defineConfig } from "@prisma/client";

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
  shadowDatasourceUrl: process.env.SHADOW_DATABASE_URL,
  relationMode: "prisma"
});
