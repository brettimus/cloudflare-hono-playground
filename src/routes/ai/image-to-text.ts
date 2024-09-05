import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";
import { aiModelsByType } from "./helpers";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available image-to-text models
 */
app.get("/models", async (c) => {
  return c.json(aiModelsByType.BaseAiImageToTextModels);
});

/**
 * Generate text from an image using a model on Workers AI.
 *
 * Note that to support Fiberplane Studio's AI Request Generation,
 * we need to do validation either in the handler or in middleware,
 * while keeping all possible input values clear in the code.
 */
app.post("/", async (c) => {
  const MODELS = [
    "@cf/unum/uform-gen2-qwen-500m",
    "@cf/llava-hf/llava-1.5-7b-hf",
  ];

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
    prompt: formData.prompt,
    max_tokens: parseIntOrUndefined(formData.max_tokens),
    temperature: parseFloatOrUndefined(formData.temperature),
    top_p: parseFloatOrUndefined(formData.top_p),
    top_k: parseIntOrUndefined(formData.top_k),
    seed: parseIntOrUndefined(formData.seed),
    repetition_penalty: parseFloatOrUndefined(formData.repetition_penalty),
    frequency_penalty: parseFloatOrUndefined(formData.frequency_penalty),
    presence_penalty: parseFloatOrUndefined(formData.presence_penalty),
    raw: parseBooleanOrUndefined(formData.raw),
  };

  const AiImageToTextInputSchema = z.object({
    image: z.array(z.number()),
    prompt: z.string().optional(),
    max_tokens: z.number().optional(),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    top_k: z.number().optional(),
    seed: z.number().optional(),
    repetition_penalty: z.number().optional(),
    frequency_penalty: z.number().optional(),
    presence_penalty: z.number().optional(),
    raw: z.boolean().optional(),
  });

  const parsedInputs = AiImageToTextInputSchema.parse(inputs);

  console.log("Using inputs:", parsedInputs);
  const result = await c.env.AI.run(
    model as BaseAiImageToTextModels,
    parsedInputs,
  );
  return c.json(result);
});

const parseIntOrUndefined = (
  value: File | string | undefined,
): number | undefined =>
  value ? Number.parseInt(value as string, 10) : undefined;

const parseFloatOrUndefined = (
  value: File | string | undefined,
): number | undefined =>
  value ? Number.parseFloat(value as string) : undefined;

const parseBooleanOrUndefined = (
  value: File | string | undefined,
): boolean | undefined => {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return undefined;
};

export default app;
