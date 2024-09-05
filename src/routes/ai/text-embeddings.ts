import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";
import { aiModelsByType } from "./helpers";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available text embeddings models
 */
app.get("/models", async (c) => {
  return c.json(aiModelsByType.BaseAiTextEmbeddingsModels);
});

/**
 * Generate text embeddings from a model on Workers AI.
 */
app.post("/", async (c) => {
  const MODELS = [
    "@cf/baai/bge-small-en-v1.5",
    "@cf/baai/bge-base-en-v1.5",
    "@cf/baai/bge-large-en-v1.5",
  ];

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

  const AiTextEmbeddingsInputSchema = z.object({
    text: z.union([z.string(), z.array(z.string())]),
  });

  const parsedInputs = AiTextEmbeddingsInputSchema.parse(inputs);

  console.log("Using inputs:", parsedInputs);
  const result = await c.env.AI.run(
    model as BaseAiTextEmbeddingsModels,
    inputs,
  );
  return c.json(result);
});

export default app;
