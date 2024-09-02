import { instrument } from "@fiberplane/hono-otel";
import { Hono } from "hono";

import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default instrument(app);
