import { createMiddleware } from "hono/factory";
import { z } from "zod";

export const validateModel = createMiddleware(async (c, next) => {
  const MODELS = [
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

  const AiTextGenerationInputSchema = z.object({
    // NOTE - Do NOT use prompt, use messages instead
    // prompt: z.string().optional(),
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

  const parsedInputs = AiTextGenerationInputSchema.parse(inputs);

  c.set("inputs", parsedInputs);

  await next();
});
