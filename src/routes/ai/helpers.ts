import { createMiddleware } from "hono/factory";
import { z } from "zod";

export const validateModel = createMiddleware(async (c, next) => {
  const aiModelsByType = {
    BaseAiTextClassificationModels: ["@cf/huggingface/distilbert-sst-2-int8"],
    BaseAiTextToImageModels: [
      "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      "@cf/runwayml/stable-diffusion-v1-5-inpainting",
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
      "@cf/lykon/dreamshaper-8-lcm",
      "@cf/bytedance/stable-diffusion-xl-lightning",
    ],
    BaseAiTextEmbeddingsModels: [
      "@cf/baai/bge-small-en-v1.5",
      "@cf/baai/bge-base-en-v1.5",
      "@cf/baai/bge-large-en-v1.5",
    ],
    BaseAiSpeechRecognitionModels: [
      "@cf/openai/whisper",
      "@cf/openai/whisper-tiny-en",
      "@cf/openai/whisper-sherpa",
    ],
    BaseAiImageClassificationModels: ["@cf/microsoft/resnet-50"],
    BaseAiObjectDetectionModels: ["@cf/facebook/detr-resnet-50"],
    BaseAiTextGenerationModels: [
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
    ],
    BaseAiTranslationModels: ["@cf/meta/m2m100-1.2b"],
    BaseAiSummarizationModels: ["@cf/facebook/bart-large-cnn"],
    BaseAiImageToTextModels: [
      "@cf/unum/uform-gen2-qwen-500m",
      "@cf/llava-hf/llava-1.5-7b-hf",
    ],
  };

  const ALL_MODELS = Object.values(aiModelsByType).flat();

  const model = c.req.query("model");
  if (!model) {
    return c.json({ message: "Missing model parameter" }, 422);
  }

  if (!ALL_MODELS.includes(model)) {
    return c.json({ message: "Invalid model", choices: ALL_MODELS }, 400);
  }

  let modelType: string;

  for (const [key, value] of Object.entries(aiModelsByType)) {
    if (value.includes(model)) {
      modelType = key;
      c.set("modelType", modelType);

      break;
    }
  }

  c.set("model", model);
  // TODO - Validate inputs

  await next();
});

export const validateInputs = createMiddleware(async (c, next) => {
  const modelType = c.get("modelType") as string;

  // FIXME - Some models require binary inputs, and some require JSON. We need to
  //         validate the inputs based on the model type.
  const inputs = await c.req.json();

  // Define schemas for the input types
  const AiTextClassificationInputSchema = z.object({
    text: z.string(),
  });

  const AiTextToImageInputSchema = z.object({
    prompt: z.string(),
    image: z.array(z.number()).optional(),
    mask: z.array(z.number()).optional(),
    num_steps: z.number().optional(),
    strength: z.number().optional(),
    guidance: z.number().optional(),
  });

  const AiTextEmbeddingsInputSchema = z.object({
    text: z.union([z.string(), z.array(z.string())]),
  });

  const AiSpeechRecognitionInputSchema = z.object({
    audio: z.array(z.number()),
  });

  const AiImageClassificationInputSchema = z.object({
    image: z.array(z.number()),
  });

  const AiObjectDetectionInputSchema = z.object({
    image: z.array(z.number()),
  });

  const AiTextGenerationInputSchema = z.object({
    prompt: z.string().optional(),
    raw: z.boolean().optional(),
    stream: z.boolean().optional(),
    max_tokens: z.number().optional(),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    top_k: z.number().optional(),
    seed: z.number().optional(),
    repetition_penalty: z.number().optional(),
    frequency_penalty: z.number().optional(),
    presence_penalty: z.number().optional(),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system", "tool"]),
          content: z.string(),
        }),
      )
      .optional(),
    tools: z
      .array(
        z.object({
          type: z.literal("function"),
          function: z.object({
            name: z.string(),
            description: z.string(),
            parameters: z
              .object({
                type: z.literal("object"),
                properties: z.record(
                  z.object({
                    type: z.string(),
                    description: z.string().optional(),
                  }),
                ),
                required: z.array(z.string()),
              })
              .optional(),
          }),
        }),
      )
      .optional(),
  });

  const AiTranslationInputSchema = z.object({
    text: z.string(),
    target_lang: z.string(),
    source_lang: z.string().optional(),
  });

  const AiSummarizationInputSchema = z.object({
    input_text: z.string(),
    max_length: z.number().optional(),
  });

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
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system", "tool"]),
          content: z.string(),
        }),
      )
      .optional(),
  });

  const getSchemaForModel = (model: string) => {
    switch (model) {
      case "BaseAiTextClassificationModels":
        return AiTextClassificationInputSchema;
      case "BaseAiTextToImageModels":
        return AiTextToImageInputSchema;
      case "BaseAiTextEmbeddingsModels":
        return AiTextEmbeddingsInputSchema;
      case "BaseAiSpeechRecognitionModels":
        return AiSpeechRecognitionInputSchema;
      case "BaseAiImageClassificationModels":
        return AiImageClassificationInputSchema;
      case "BaseAiObjectDetectionModels":
        return AiObjectDetectionInputSchema;
      case "BaseAiTextGenerationModels":
        return AiTextGenerationInputSchema;
      case "BaseAiTranslationModels":
        return AiTranslationInputSchema;
      case "BaseAiSummarizationModels":
        return AiSummarizationInputSchema;
      case "BaseAiImageToTextInputSchema":
        return AiImageToTextInputSchema;
      default:
        return z.object({});
    }
  };

  const schema = getSchemaForModel(modelType);

  const parsedInputs = schema.parse(inputs);

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
  "@cf/llava-hf/llava-1.5-7b-hf",
];

export const aiModelsByType = {
  BaseAiTextClassificationModels: ["@cf/huggingface/distilbert-sst-2-int8"],
  BaseAiTextToImageModels: [
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    "@cf/runwayml/stable-diffusion-v1-5-inpainting",
    "@cf/runwayml/stable-diffusion-v1-5-img2img",
    "@cf/lykon/dreamshaper-8-lcm",
    "@cf/bytedance/stable-diffusion-xl-lightning",
  ],
  BaseAiTextEmbeddingsModels: [
    "@cf/baai/bge-small-en-v1.5",
    "@cf/baai/bge-base-en-v1.5",
    "@cf/baai/bge-large-en-v1.5",
  ],
  BaseAiSpeechRecognitionModels: [
    "@cf/openai/whisper",
    "@cf/openai/whisper-tiny-en",
    "@cf/openai/whisper-sherpa",
  ],
  BaseAiImageClassificationModels: ["@cf/microsoft/resnet-50"],
  BaseAiObjectDetectionModels: ["@cf/facebook/detr-resnet-50"],
  BaseAiTextGenerationModels: [
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
  ],
  BaseAiTranslationModels: ["@cf/meta/m2m100-1.2b"],
  BaseAiSummarizationModels: ["@cf/facebook/bart-large-cnn"],
  BaseAiImageToTextModels: [
    "@cf/unum/uform-gen2-qwen-500m",
    "@cf/llava-hf/llava-1.5-7b-hf",
  ],
};
