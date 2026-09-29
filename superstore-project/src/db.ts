import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
      host: process.env.PGHOST || "localhost",
      port: parseInt(process.env.PGPORT || "5433", 10),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "postgres",
    }
);
