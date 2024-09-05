import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available text classification models
 */
app.get("/models", (c) => {
  const MODELS = ["@cf/huggingface/distilbert-sst-2-int8"];
  return c.json(MODELS);
});

/**
 * Classify text using a model on Workers AI.
 */
app.post("/", async (c) => {
  const MODELS = ["@cf/huggingface/distilbert-sst-2-int8"];

  const model = c.req.query("model");
  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: MODELS }, 400);
  }

  const inputs = await c.req.json();

  const AiTextClassificationInputSchema = z.object({
    text: z.string(),
  });

  const parsedInputs = AiTextClassificationInputSchema.parse(inputs);

  console.log("Using inputs:", parsedInputs);
  const result = await c.env.AI.run(
    model as BaseAiTextClassificationModels,
    parsedInputs,
  );
  return c.json(result);
});

export default app;
