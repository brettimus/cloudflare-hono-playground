import { Hono } from "hono";

import type { Bindings } from "../types";

const app = new Hono<{
  Bindings: Bindings;
}>();

/**
 * Execute a D1 query
 *
 * The database is local and does not have any data,
 * so you may need to create a table and insert some data first.
 *
 * Alternatively, try a query like `SELECT 1;` to see if the connection is working.
 */
app.post("/query", async (c) => {
  const { query } = await c.req.json();
  const result = await c.env.DB.prepare(query).all();
  return c.json(result);
});

export default app;
