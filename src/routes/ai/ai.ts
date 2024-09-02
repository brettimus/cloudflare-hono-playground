import { Hono } from "hono";

import type { Bindings } from "../../types";

import { aiModelsByType } from "./helpers";
import * as imageToText from "./image-to-text";
import * as textGeneration from "./text-generation";
import * as textToImage from "./text-to-image";
import * as translation from "./translation";

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

app.post(
  "/text-generation",
  textGeneration.validateModel,
  textGeneration.validateInputs,
  async (c) => {
    const model = c.req.query("model");
    const inputs = c.get("inputs");
    console.log("inputs", inputs);
    console.log("model", model);
    // @ts-expect-error - We need to do some validation here, build decoders for the possible cloudflare inputs
    const result = await c.env.AI.run(model, inputs);
    return c.json(result);
  },
);

/**
 * Get the list of available text generation models
 */
app.get("/text-generation/models", async (c) => {
  return c.json(aiModelsByType.BaseAiTextGenerationModels);
});

app.post(
  "/text-to-image",
  textToImage.validateModel,
  textToImage.validateInputs,
  async (c) => {
    const model = c.req.query("model");
    const inputs = c.get("inputs");
    console.log("inputs", inputs);
    console.log("model", model);
    // @ts-expect-error - We need to do some validation here, build decoders for the possible cloudflare inputs
    const result = await c.env.AI.run(model, inputs);

    // NOTE - I think all of the models output a png, but need to check
    c.header("Content-Type", "image/png");

    return c.body(result);
  },
);

/**
 * Get the list of available text to image models
 */
app.get("/text-to-image/models", async (c) => {
  return c.json(aiModelsByType.BaseAiTextToImageModels);
});

/**
 * Get text from an image
 */
app.post(
  "/image-to-text",
  imageToText.validateModel,
  imageToText.validateInputs,
  async (c) => {
    const model = c.req.query("model");
    const inputs = c.get("inputs");
    console.log("inputs", inputs);
    console.log("model", model);
    // @ts-expect-error - We need to do some validation here, build decoders for the possible cloudflare inputs
    const result = await c.env.AI.run(model, inputs);
    return c.json(result);
  },
);

/**
 * Get the list of available image to text models
 */
app.get("/image-to-text/models", async (c) => {
  return c.json(imageToText.BaseAiImageToTextModels);
});

app.post(
  "/translation",
  translation.validateModel,
  translation.validateInputs,
  async (c) => {
    const model = c.req.query("model");
    const inputs = c.get("inputs");
    console.log("inputs", inputs);
    console.log("model", model);
    // @ts-expect-error - We need to do some validation here, build decoders for the possible cloudflare inputs
    const result = await c.env.AI.run(model, inputs);
    return c.json(result);
  },
);

/**
 * Get the list of available translation models
 */
app.get("/translation/models", async (c) => {
  return c.json(translation.BaseAiTranslationModels);
});

export default app;
