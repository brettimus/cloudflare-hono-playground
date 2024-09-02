import { Hono } from "hono";

import type { Bindings } from "../types";

const app = new Hono<{
  Bindings: Bindings;
}>();

// List all objects in the R2 bucket
app.get("/list", async (c) => {
  const objects = await c.env.MY_BUCKET.list();
  return c.json(objects);
});

// Get a specific object from the R2 bucket
app.get("/get/:key", async (c) => {
  const object = await c.env.MY_BUCKET.get(c.req.param("key"));
  // TODO - return the correct headers
  return c.json(object);
});

/**
 * Upload an object to the R2 bucket
 * @param key - The key of the object to upload
 * @returns - The uploaded object
 */
app.post("/put/:key", async (c) => {
  const object = await c.env.MY_BUCKET.put(c.req.param("key"), c.req.raw.body);
  // TODO - 204? 201?
  return c.json(object, 201);
});

/**
 * Delete an object from the R2 bucket
 * @param key - The key of the object to delete
 * @returns - 204 No Content
 */
app.delete("/delete/:key", async (c) => {
  await c.env.MY_BUCKET.delete(c.req.param("key"));
  return c.body(null, 204);
});

export default app;
