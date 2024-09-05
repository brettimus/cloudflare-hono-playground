import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";
import { aiModelsByType } from "./helpers";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available summarization models
 */
app.get("/models", async (c) => {
  return c.json(aiModelsByType.BaseAiSummarizationModels);
});

/**
 * Generate a summary from a model on Workers AI.
 */
app.post("/", async (c) => {
  const MODELS = ["@cf/facebook/bart-large-cnn"];

  const model = c.req.query("model");

  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: MODELS }, 400);
  }

  console.log("Running model:", model);

  // Validate the inputs
  const inputs = await c.req.json();

  const AiSummarizationInputSchema = z.object({
    input_text: z.string(),
    max_length: z.number().optional(),
  });

  const parsedInputs = AiSummarizationInputSchema.parse(inputs);

  console.log("Using inputs:", parsedInputs);
  const result = await c.env.AI.run(
    model as BaseAiSummarizationModels,
    parsedInputs,
  );
  return c.json(result);
});

export default app;
