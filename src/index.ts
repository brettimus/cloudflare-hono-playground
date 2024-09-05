import { instrument } from "@fiberplane/hono-otel";
import { Hono } from "hono";

import { ai, d1, kv, r2 } from "./routes";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/README", (c) => {
  return c.text(
    `
Hey! A few tips:

1. You can use the R2 browser to upload files to your bucket. 
   The \`/r2/put\` endpoint accepts multipart/form-data uploads with a field called "file"
   and the \`/r2/put-raw/:key\` endpoint accepts file bodies directly.

2. When testing D1, you may need to create a table first. The database is empty.

3. Configure AI Request Generation on Fiberplane Studio's Settings page 
   to be able to generate sample request payloads for you.
   That can be a good starting point for making requests!

4. If you're testing without AI Request Generation, you will want to look at the API
   source code to understand the request shape.
  `.trim(),
  );
});

app.route("/d1", d1);
app.route("/r2", r2);
app.route("/ai", ai);
app.route("/kv", kv);

export default instrument(app, {
  monitor: {
    fetch: true,
    logging: true,
    /** Gives us traces for Cloudflare bindings */
    cfBindings: true,
  },
});
