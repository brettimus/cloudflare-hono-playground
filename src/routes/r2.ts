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

  if (!object) {
    return c.json({ message: "Object not found" }, 404);
  }

  const responseHeaders = mapR2HttpMetadataToHeaders(object.httpMetadata);

  return c.body(object.body, {
    headers: responseHeaders,
  });
});

/**
 * Example of uploading a file to the R2 bucket via a `multipart/form-data` upload
 *
 * Expects a form with a file field named "file"
 *
 * @param key - The key of the object to upload
 * @returns - The uploaded object
 */
app.post("/put/:key", async (c) => {
  const key = c.req.param("key");

  const formData = await c.req.parseBody();

  const { file } = formData;

  // Validate the file is a File
  if (!(file instanceof File)) {
    return c.json(
      { message: "The 'file' field must be a File", actualType: typeof file },
      422,
    );
  }

  const options: R2PutOptions = {
    httpMetadata: { contentType: file.type },
  };

  const object = await c.env.MY_BUCKET.put(key, file, options);

  return c.json(object, 201);
});

/**
 * Upload any old object to the R2 bucket, using the raw request body.
 *
 * This relies on the content-type header to be set correctly by the client.
 *
 * If you wanted to go a step further and detect the file type from the content itself
 * (in case the Content-Type header is not set or is incorrect),
 * you could use a library like file-type. However, this would require reading the entire file into memory, which might not be ideal for large files. In a Cloudflare Workers environment, you'd need to ensure such a library is compatible and doesn't exceed size limits.
 *
 * @param key - The key of the object to upload
 * @returns - The uploaded object
 */
app.post("/put-raw/:key", async (c) => {
  const key = c.req.param("key");
  const body = c.req.raw.body;
  const contentType =
    c.req.header("Content-Type") || "application/octet-stream";
  const options: R2PutOptions = {
    httpMetadata: {
      contentType: contentType,
    },
  };
  const object = await c.env.MY_BUCKET.put(key, body, options);
  return c.json(object, 201);
});

/**
 * Delete an object from the R2 bucket
 * @param key - The key of the object to delete
 * @returns - 204 No Content
 */
app.delete("/delete/:key", async (c) => {
  try {
    await c.env.MY_BUCKET.delete(c.req.param("key"));
    // HACK - Fiberplane Studio can't handle 204s right now
    return c.text("", 200);
  } catch (error) {
    return c.json({ message: "Failed to delete object", error }, 500);
  }
});

export default app;

/**
 * Helper function that returns the headers for a given R2 object
 *
 * @param metadata - The R2 HTTP metadata
 * @returns - The headers
 */
function mapR2HttpMetadataToHeaders(metadata?: R2HTTPMetadata): Headers {
  const headers = new Headers();

  if (!metadata) {
    return headers;
  }

  if (metadata.contentType) {
    headers.set("Content-Type", metadata.contentType);
  }
  if (metadata.contentLanguage) {
    headers.set("Content-Language", metadata.contentLanguage);
  }
  if (metadata.contentDisposition) {
    headers.set("Content-Disposition", metadata.contentDisposition);
  }
  if (metadata.contentEncoding) {
    headers.set("Content-Encoding", metadata.contentEncoding);
  }
  if (metadata.cacheControl) {
    headers.set("Cache-Control", metadata.cacheControl);
  }
  if (metadata.cacheExpiry) {
    headers.set("Cache-Expiry", metadata.cacheExpiry.toUTCString());
  }

  return headers;
}
