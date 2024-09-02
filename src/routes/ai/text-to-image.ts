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
    // Depends on model, some need to be less than 20
    num_steps: z.number().optional(),
    strength: z.number().optional(),
    guidance: z.number().optional(),
  });

  const parsedInputs = AiTextToImageInputSchema.parse(inputs);

  c.set("inputs", parsedInputs);

  await next();
});

export const MODELS = [
  "@cf/huggingface/distilbert-sst-2-int8",
  "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  "@cf/runwayml/stable-diffusion-v1-5-inpainting",
  "@cf/runwayml/stable-diffusion-v1-5-img2img",
  "@cf/lykon/dreamshaper-8-lcm",
  "@cf/bytedance/stable-diffusion-xl-lightning",
  "@cf/baai/bge-small-en-v1.5",
  "@cf/baai/bge-base-en-v1.5",
  "@cf/baai/bge-large-en-v1.5",
  "@cf/openai/whisper",
  "@cf/openai/whisper-tiny-en",
  "@cf/openai/whisper-sherpa",
  "@cf/microsoft/resnet-50",
  "@cf/facebook/detr-resnet-50",
  "@cf/meta/llama-3.1-8b-instruct",
  "@cf/meta/llama-3-8b-instruct",
  "@cf/meta/llama-3-8b-instruct-awq",
  "@cf/meta/llama-2-7b-chat-int8",
  "@cf/mistral/mistral-7b-instruct-v0.1",
  "@cf/mistral/mistral-7b-instruct-v0.2-lora",
  "@cf/meta/llama-2-7b-chat-fp16",
  "@hf/thebloke/llama-2-13b-chat-awq",
  "@hf/thebloke/zephyr-7b-beta-awq",
  "@hf/thebloke/mistral-7b-instruct-v0.1-awq",
  "@hf/thebloke/codellama-7b-instruct-awq",
  "@hf/thebloke/openhermes-2.5-mistral-7b-awq",
  "@hf/thebloke/neural-chat-7b-v3-1-awq",
  "@hf/thebloke/llamaguard-7b-awq",
  "@hf/thebloke/deepseek-coder-6.7b-base-awq",
  "@hf/thebloke/deepseek-coder-6.7b-instruct-awq",
  "@hf/nousresearch/hermes-2-pro-mistral-7b",
  "@hf/mistral/mistral-7b-instruct-v0.2",
  "@hf/google/gemma-7b-it",
  "@hf/nexusflow/starling-lm-7b-beta",
  "@cf/deepseek-ai/deepseek-math-7b-instruct",
  "@cf/defog/sqlcoder-7b-2",
  "@cf/openchat/openchat-3.5-0106",
  "@cf/tiiuae/falcon-7b-instruct",
  "@cf/thebloke/discolm-german-7b-v1-awq",
  "@cf/qwen/qwen1.5-0.5b-chat",
  "@cf/qwen/qwen1.5-1.8b-chat",
  "@cf/qwen/qwen1.5-7b-chat-awq",
  "@cf/qwen/qwen1.5-14b-chat-awq",
  "@cf/tinyllama/tinyllama-1.1b-chat-v1.0",
  "@cf/microsoft/phi-2",
  "@cf/google/gemma-2b-it-lora",
  "@cf/google/gemma-7b-it-lora",
  "@cf/meta-llama/llama-2-7b-chat-hf-lora",
  "@cf/fblgit/una-cybertron-7b-v2-bf16",
  "@cf/fblgit/una-cybertron-7b-v2-awq",
  "@cf/meta/m2m100-1.2b",
  "@cf/facebook/bart-large-cnn",
  "@cf/unum/uform-gen2-qwen-500m",
  "@cf/llava-hf/llava-1.5-7b-hf"
];
