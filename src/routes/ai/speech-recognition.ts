import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../types";
import { aiModelsByType } from "./helpers";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get the list of available speech recognition models
 */
app.get("/models", async (c) => {
  return c.json(aiModelsByType.BaseAiSpeechRecognitionModels);
});

/**
 * Perform speech recognition using a model on Workers AI.
 */
app.post("/", async (c) => {
  const MODELS = [
    "@cf/openai/whisper",
    "@cf/openai/whisper-tiny-en",
    "@cf/openai/whisper-sherpa",
  ];

  const model = c.req.query("model");

  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: MODELS }, 400);
  }

  console.log("Running model:", model);

  // Handle streaming input
  const formData = await c.req.parseBody();

  let audioArray: number[] = [];
  if (formData.audio instanceof File) {
    const arrayBuffer = await formData.audio.arrayBuffer();
    audioArray = Array.from(new Uint8Array(arrayBuffer));
  }

  const inputs = {
    audio: audioArray,
  };

  const AiSpeechRecognitionInputSchema = z.object({
    audio: z.array(z.number()),
  });

  // Validate the inputs
  const parsedInputs = AiSpeechRecognitionInputSchema.parse(inputs);

  console.log("Using inputs:", parsedInputs);
  const result = await c.env.AI.run(
    model as BaseAiSpeechRecognitionModels,
    inputs,
  );
  return c.json(result);
});

export default app;
