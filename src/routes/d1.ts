import { Hono } from "hono";

import type { Bindings } from "../types";

const app = new Hono<{
  Bindings: Bindings;
}>();

/**
 * Execute a D1 query
 */
app.post("/query", async (c) => {
  const { query } = await c.req.json();
  const result = await c.env.DB.prepare(query).all();
  return c.json(result);
});

export default app;
