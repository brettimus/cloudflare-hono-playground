import { createMiddleware } from "hono/factory";
import { z } from "zod";

export const BaseAiTranslationModels = ["@cf/meta/m2m100-1.2b"];

export const validateModel = createMiddleware(async (c, next) => {
  // HACK - Keep the models list in here so Studio AI generation can use it
  const MODELS = ["@cf/meta/m2m100-1.2b"];

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
  // We need to do this as a multipart/form-data request to be able to attach a file in the Fiberplane Studio UI in a sane way
  // TODO - Convert inputs.image to a buffer
  const inputs = await c.req.json();

  const AiTranslationInputSchema = z.object({
    text: z.string(),
    target_lang: z.string(),
    source_lang: z.string().optional(),
  });

  const parsedInputs = AiTranslationInputSchema.parse(inputs);

  c.set("inputs", parsedInputs);

  await next();
});
