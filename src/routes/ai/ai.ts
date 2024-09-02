import { Hono } from "hono";

import type { Bindings } from "../../types";

import * as textGeneration from "./text-generation";
import * as textToImage from "./text-to-image";
import { aiModelsByType } from "./helpers";

const app = new Hono<{
  Bindings: Bindings;
  Variables: {
    inputs: unknown;
  };
}>();

// NOTE - Generic run is not as usable in the Fiberplane Studio UI
//        It's easier to separate calls by model type, since it allows us to validate inputs
//        and makes it easier to see what's going on in the Studio UI
//

app.post("/run/text-generation", textGeneration.validateModel, textGeneration.validateInputs, async (c) => {
  const model = c.req.query("model");
  const inputs = c.get("inputs");
  console.log("inputs", inputs);
  console.log("model", model);
  // @ts-expect-error - We need to do some validation here, build decoders for the possible cloudflare inputs
  const result = await c.env.AI.run(model, inputs);
  return c.json(result);
});

/**
 * Get the list of available text generation models
 */
app.get("/run/text-generation/models", async (c) => {
  return c.json(aiModelsByType.BaseAiTextGenerationModels);
});

app.post("/run/text-to-image", textToImage.validateModel, textToImage.validateInputs, async (c) => {
  const model = c.req.query("model");
  const inputs = c.get("inputs");
  console.log("inputs", inputs);
  console.log("model", model);
  // @ts-expect-error - We need to do some validation here, build decoders for the possible cloudflare inputs
  const result = await c.env.AI.run(model, inputs);

  // NOTE - I think all of the models output a png, but need to check
  c.header("Content-Type", "image/png");

  return c.body(result);
});

/**
 * Get the list of available text to image models
 */
app.get("/run/text-to-image/models", async (c) => {
  return c.json(aiModelsByType.BaseAiTextToImageModels);
});

export default app;
