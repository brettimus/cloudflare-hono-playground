import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";
import { aiModelsByType } from "./helpers";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available object detection models
 */
app.get("/models", async (c) => {
  return c.json(aiModelsByType.BaseAiObjectDetectionModels);
});

/**
 * Detect objects in an image using a model on Workers AI.
 *
 * Note that to support Fiberplane Studio's AI Request Generation,
 * we need to do validation either in the handler or in middleware,
 * while keeping all possible input values clear in the code.
 */
app.post("/", async (c) => {
  const MODELS = ["@cf/facebook/detr-resnet-50"]

  const model = c.req.query("model");
  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: MODELS }, 400);
  }

  console.log("Running model:", model);

  // We need to do this as a multipart/form-data request to be able to attach a file in the Fiberplane Studio UI in a sane way
  const formData = await c.req.parseBody();

  let imageArray: number[] = [];
  if (formData.image instanceof File) {
    const arrayBuffer = await formData.image.arrayBuffer();
    imageArray = Array.from(new Uint8Array(arrayBuffer));
  }

  const inputs = {
    image: imageArray,
  };

  const AiObjectDetectionInputSchema = z.object({
    image: z.array(z.number()),
  });

  const parsedInputs = AiObjectDetectionInputSchema.parse(inputs);

  console.log("Using inputs:", parsedInputs);
  const result = await c.env.AI.run(
    model as BaseAiObjectDetectionModels,
    parsedInputs,
  );
  return c.json(result);
});

export default app;
