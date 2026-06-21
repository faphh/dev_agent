// Stub: @anthropic-ai/bedrock-sdk
export class BedrockClient {
  constructor(_config?: Record<string, unknown>) {}
  async send(_command: unknown): Promise<unknown> {
    return {}
  }
}

export class AnthropicBedrock {
  constructor(_config?: Record<string, unknown>) {}
  messages = {
    create: async (_params: unknown) => ({
      id: 'stub',
      content: [{ type: 'text', text: 'Stub response' }],
      model: 'stub',
      role: 'assistant' as const,
      type: 'message' as const,
      usage: { input_tokens: 0, output_tokens: 0 },
    }),
  }
}
