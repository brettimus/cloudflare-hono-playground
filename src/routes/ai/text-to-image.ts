import { createMiddleware } from "hono/factory";
import { z } from "zod";

export const validateModel = createMiddleware(async (c, next) => {
  // HACK - Keep the models list in here so Studio AI generation can use it
  const MODELS = [
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    "@cf/runwayml/stable-diffusion-v1-5-inpainting",
    "@cf/runwayml/stable-diffusion-v1-5-img2img",
    "@cf/lykon/dreamshaper-8-lcm",
    "@cf/bytedance/stable-diffusion-xl-lightning"
  ];

  const model = c.req.query("model");
  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: MODELS }, 400);
  }

  await next();
});

export const validateInputs = createMiddleware(async (c, next) => {
  const inputs = await c.req.json();

  const AiTextToImageInputSchema = z.object({
    prompt: z.string(),
    image: z.array(z.number()).optional(),
    mask: z.array(z.number()).optional(),
    // Depends on model, some need to be less than 20 (SDXL)
    num_steps: z.number().optional().describe("Number of steps to take in the image generation process"),
    strength: z.number().optional(),
    guidance: z.number().optional(),
  });

  const parsedInputs = AiTextToImageInputSchema.parse(inputs);

  c.set("inputs", parsedInputs);

  await next();
});
