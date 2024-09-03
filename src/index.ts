import { instrument } from "@fiberplane/hono-otel";
import { Hono } from "hono";

import { ai, d1, kv, r2 } from "./routes";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/README", (c) => {
  return c.text(`
Hey! A few tips:

1. Configure AI Request Generation in Settings to be able to generate sample request payloads for you.
   That can be a good starting point.

2. When testing D1, you may need to create a table first. The database is empty.

3. If you're testing without AI Request Generation, you will want to look at the API
   source code to understand the request shape.
  `.trim());
});

app.route("/d1", d1);
app.route("/ai", ai);
app.route("/r2", r2);
app.route("/kv", kv);

export default instrument(app, {
  monitor: {
    fetch: true,
    logging: true,
    cfBindings: true,
  },
});
