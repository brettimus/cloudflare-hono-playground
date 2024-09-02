import { instrument } from "@fiberplane/hono-otel";
import { Hono } from "hono";

import { ai, kv, r2 } from "./routes";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/README", (c) => {
  return c.text("Hello Hono! TODO");
});

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
