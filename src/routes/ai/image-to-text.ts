import { createMiddleware } from "hono/factory";
import { z } from "zod";

export const BaseAiImageToTextModels = [
  "@cf/unum/uform-gen2-qwen-500m",
  "@cf/llava-hf/llava-1.5-7b-hf",
];

export const validateModel = createMiddleware(async (c, next) => {
  // HACK - Keep the models list in here so Studio AI generation can use it
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

  await next();
});

export const validateInputs = createMiddleware(async (c, next) => {
  // We need to do this as a multipart/form-data request to be able to attach a file in the Fiberplane Studio UI in a sane way
  // TODO - Convert inputs.image to a buffer
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
    // NOTE - This is too unwieldy for Studio, but in theory you would pass the messages as a JSON string...
    // messages: formData.messages ? JSON.parse(formData.messages as string) : undefined,
  };

  const AiImageToTextInputSchema = z.object({
    image: z.array(z.number()),
    // NOTE - Prompt and messages can clash
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
    // NOTE - Prompt and messages can clash
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system", "tool"]),
          content: z.string(),
        }),
      )
      .optional(),
  });

  const parsedInputs = AiImageToTextInputSchema.parse(inputs);

  c.set("inputs", parsedInputs);

  await next();
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
