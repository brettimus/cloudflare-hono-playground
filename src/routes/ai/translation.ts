import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available translation models
 */
app.get("/models", (c) => {
  const MODELS = ["@cf/meta/m2m100-1.2b"];
  return c.json(MODELS);
});

/**
 * Translate text using a model on Workers AI.
 */
app.post("/", async (c) => {
  const MODELS = ["@cf/meta/m2m100-1.2b"];

  const model = c.req.query("model");
  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: MODELS }, 400);
  }

  const inputs = await c.req.json();

  const AiTranslationInputSchema = z.object({
    text: z.string(),
    target_lang: z.string(),
    source_lang: z.string().optional(),
  });

  const parsedInputs = AiTranslationInputSchema.parse(inputs);

  console.log("Using inputs:", parsedInputs);
  const result = await c.env.AI.run(model, parsedInputs);
  return c.json(result);
});

export default app;
