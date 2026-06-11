import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.TURSO_DB_URL || "file:./data.db";
const authToken = process.env.TURSO_DB_TOKEN;

const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });
export { schema };
