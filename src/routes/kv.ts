import { Hono } from "hono";

import type { Bindings } from "../types";

const app = new Hono<{
  Bindings: Bindings;
}>();

/**
 * Get a key from the KV namespace
 */
app.get("/get/:key", async (c) => {
  const key = c.req.param("key");
  const value = await c.env.MY_KV_NAMESPACE.get(key);
  return c.json({
    key,
    value,
  });
});

/**
 * Put a value into the KV namespace
 */
app.put("/put/:key", async (c) => {
  const key = c.req.param("key");
  const value = await c.req.text();
  await c.env.MY_KV_NAMESPACE.put(key, value);
  return c.json(value);
});

/**
 * Delete a key from the KV namespace
 */
app.delete("/delete/:key", async (c) => {
  const key = c.req.param("key");
  const value = await c.req.text();
  await c.env.MY_KV_NAMESPACE.delete(key);
  return c.json(value);
});

export default app;
