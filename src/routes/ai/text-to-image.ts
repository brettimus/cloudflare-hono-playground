import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available text-to-image models
 */
app.get("/models", (c) => {
  const MODELS = [
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    "@cf/runwayml/stable-diffusion-v1-5-inpainting",
    "@cf/runwayml/stable-diffusion-v1-5-img2img",
    "@cf/lykon/dreamshaper-8-lcm",
    "@cf/bytedance/stable-diffusion-xl-lightning",
  ];
  return c.json(MODELS);
});

/**
 * Generate an image from text using a model on Workers AI.
 */
app.post("/", async (c) => {
  const MODELS = [
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    "@cf/runwayml/stable-diffusion-v1-5-inpainting",
    "@cf/runwayml/stable-diffusion-v1-5-img2img",
    "@cf/lykon/dreamshaper-8-lcm",
    "@cf/bytedance/stable-diffusion-xl-lightning",
  ];

  const model = c.req.query("model");
  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: MODELS }, 400);
  }

  const inputs = await c.req.json();

  const AiTextToImageInputSchema = z.object({
    prompt: z.string(),
    image: z.array(z.number()).optional(),
    mask: z.array(z.number()).optional(),
    num_steps: z
      .number()
      .optional()
      .describe("Number of steps to take in the image generation process"),
    strength: z.number().optional(),
    guidance: z.number().optional(),
  });

  const parsedInputs = AiTextToImageInputSchema.parse(inputs);

  const result = await c.env.AI.run(
    model as BaseAiTextToImageModels,
    parsedInputs,
  );

  // NOTE - Not sure if all the models output a png, need to check
  c.header("Content-Type", "image/png");

  return c.body(result);
});

export default app;
