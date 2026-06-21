/**
 * OpenAI Provider Adapter
 *
 * Supports: GPT-4, GPT-4o, GPT-4-turbo, GPT-3.5-turbo
 * API Docs: https://platform.openai.com/docs/api-reference
 */

import OpenAI from 'openai'
import type {
  AIProvider,
  ProviderConfig,
  ProviderFactory,
  ProviderParams,
  UnifiedContentBlock,
  UnifiedMessage,
  UnifiedResponse,
  UnifiedStreamEvent,
  UnifiedToolDefinition,
  UnifiedUsage,
} from './types.js'
import { registerProvider } from './registry.js'

// ============================================================================
// Message Format Conversion
// ============================================================================

type OpenAIMessageRole = 'user' | 'assistant' | 'system' | 'tool'

interface OpenAIMessage {
  role: OpenAIMessageRole
  content: string | null
  tool_calls?: OpenAIToolCall[]
  tool_call_id?: string
  name?: string
}

interface OpenAIToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

interface OpenAITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

/**
 * Convert unified messages to OpenAI format
 */
function convertMessagesToOpenAI(messages: UnifiedMessage[]): OpenAIMessage[] {
  const result: OpenAIMessage[] = []

  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      // Simple text message
      result.push({
        role: msg.role,
        content: msg.content,
      })
    } else {
      // Complex content blocks
      const textParts: string[] = []
      const toolCalls: OpenAIToolCall[] = []
      let toolResult: { tool_call_id: string; content: string } | null = null

      for (const block of msg.content) {
        switch (block.type) {
          case 'text':
            textParts.push(block.text)
            break

          case 'tool_use':
            toolCalls.push({
              id: block.id,
              type: 'function',
              function: {
                name: block.name,
                arguments: JSON.stringify(block.input),
              },
            })
            break

          case 'tool_result':
            toolResult = {
              tool_call_id: block.tool_use_id,
              content: typeof block.content === 'string'
                ? block.content
                : block.content
                    .filter((b) => b.type === 'text')
                    .map((b) => (b as { type: 'text'; text: string }).text)
                    .join('\n'),
            }
            break

          case 'image':
            // OpenAI supports image URLs but not base64 in the same way
            // For now, we'll skip images
            break
        }
      }

      if (toolResult) {
        // Tool result message
        result.push({
          role: 'tool',
          tool_call_id: toolResult.tool_call_id,
          content: toolResult.content,
        })
      } else if (toolCalls.length > 0 && msg.role === 'assistant') {
        // Assistant message with tool calls
        result.push({
          role: 'assistant',
          content: textParts.join('\n') || null,
          tool_calls: toolCalls,
        })
      } else {
        // Regular message
        result.push({
          role: msg.role,
          content: textParts.join('\n'),
        })
      }
    }
  }

  return result
}

/**
 * Convert unified tool definitions to OpenAI format
 */
function convertToolsToOpenAI(tools: UnifiedToolDefinition[]): OpenAITool[] {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))
}

/**
 * Convert OpenAI response to unified format
 */
function convertResponseFromOpenAI(
  response: OpenAI.Chat.Completion,
  model: string
): UnifiedResponse {
  const choice = response.choices[0]
  if (!choice) {
    throw new Error('No choices in OpenAI response')
  }

  const content: UnifiedContentBlock[] = []

  // Add text content
  if (choice.message.content) {
    content.push({
      type: 'text',
      text: choice.message.content,
    })
  }

  // Add tool calls
  if (choice.message.tool_calls) {
    for (const toolCall of choice.message.tool_calls) {
      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.function.name,
        input: JSON.parse(toolCall.function.arguments),
      })
    }
  }

  // Determine stop reason
  let stopReason: UnifiedResponse['stop_reason'] = 'end_turn'
  if (choice.finish_reason === 'tool_calls') {
    stopReason = 'tool_use'
  } else if (choice.finish_reason === 'length') {
    stopReason = 'max_tokens'
  } else if (choice.finish_reason === 'stop') {
    stopReason = 'stop'
  }

  // Build usage
  const usage: UnifiedUsage = {
    input_tokens: response.usage?.prompt_tokens || 0,
    output_tokens: response.usage?.completion_tokens || 0,
    total_tokens: response.usage?.total_tokens || 0,
  }

  return {
    id: response.id,
    model: model,
    content,
    usage,
    stop_reason: stopReason,
  }
}

// ============================================================================
// OpenAI Provider Implementation
// ============================================================================

class OpenAIProvider implements AIProvider {
  name = 'openai' as const
  private client: OpenAI
  private config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    })
  }

  async createMessage(params: ProviderParams): Promise<UnifiedResponse> {
    const openaiMessages = convertMessagesToOpenAI(params.messages)
    const openaiTools = params.tools ? convertToolsToOpenAI(params.tools) : undefined

    // Add system message if provided
    if (params.system && params.system.length > 0) {
      openaiMessages.unshift({
        role: 'system',
        content: params.system.join('\n'),
      })
    }

    const response = await this.client.chat.completions.create({
      model: params.model,
      messages: openaiMessages,
      tools: openaiTools,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      stream: false,
    })

    return convertResponseFromOpenAI(response, params.model)
  }

  async *createStreamingMessage(
    params: ProviderParams
  ): AsyncGenerator<UnifiedStreamEvent> {
    const openaiMessages = convertMessagesToOpenAI(params.messages)
    const openaiTools = params.tools ? convertToolsToOpenAI(params.tools) : undefined

    // Add system message if provided
    if (params.system && params.system.length > 0) {
      openaiMessages.unshift({
        role: 'system',
        content: params.system.join('\n'),
      })
    }

    const stream = await this.client.chat.completions.create({
      model: params.model,
      messages: openaiMessages,
      tools: openaiTools,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      stream: true,
    })

    // Track current tool call
    let currentToolCall: { id: string; name: string; arguments: string } | null = null
    let contentBlockIndex = 0

    // Emit message_start
    yield {
      type: 'message_start',
      message: {
        id: 'chatcmpl-stream',
        model: params.model,
        content: [],
        usage: { input_tokens: 0, output_tokens: 0 },
        stop_reason: 'end_turn',
      },
    }

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (!delta) continue

      // Handle text content
      if (delta.content) {
        yield {
          type: 'content_block_delta',
          index: contentBlockIndex,
          delta: {
            type: 'text_delta',
            text: delta.content,
          },
        }
      }

      // Handle tool calls
      if (delta.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (toolCall.id) {
            // New tool call starting
            if (currentToolCall) {
              // Finish previous tool call
              yield {
                type: 'content_block_stop',
                index: contentBlockIndex,
              }
              contentBlockIndex++
            }

            currentToolCall = {
              id: toolCall.id,
              name: toolCall.function?.name || '',
              arguments: toolCall.function?.arguments || '',
            }

            // Emit content_block_start for tool use
            yield {
              type: 'content_block_start',
              index: contentBlockIndex,
              content_block: {
                type: 'tool_use',
                id: currentToolCall.id,
                name: currentToolCall.name,
                input: {},
              },
            }
          } else if (toolCall.function?.arguments && currentToolCall) {
            // Continue building tool call arguments
            currentToolCall.arguments += toolCall.function.arguments
            yield {
              type: 'content_block_delta',
              index: contentBlockIndex,
              delta: {
                type: 'input_json_delta',
                partial_json: toolCall.function.arguments,
              },
            }
          }
        }
      }
    }

    // Finish any pending tool call
    if (currentToolCall) {
      yield {
        type: 'content_block_stop',
        index: contentBlockIndex,
      }
    }

    // Emit message_stop
    yield {
      type: 'message_stop',
    }
  }

  supportsTools(): boolean {
    return true
  }

  supportsVision(): boolean {
    return true
  }

  getMaxContextTokens(): number {
    // GPT-4o has 128k context
    const model = this.config.model.toLowerCase()
    if (model.includes('gpt-4o') || model.includes('gpt-4-turbo')) {
      return 128000
    }
    if (model.includes('gpt-4')) {
      return 8192
    }
    if (model.includes('gpt-3.5-turbo')) {
      return 16385
    }
    return 4096
  }

  getMaxOutputTokens(): number {
    return this.config.maxTokens
  }

  calculateCost(usage: UnifiedUsage): number {
    // GPT-4o pricing (as of 2024)
    const model = this.config.model.toLowerCase()
    let inputPrice = 0.005 / 1000  // $5 per 1M tokens
    let outputPrice = 0.015 / 1000  // $15 per 1M tokens

    if (model.includes('gpt-4-turbo')) {
      inputPrice = 0.01 / 1000
      outputPrice = 0.03 / 1000
    } else if (model.includes('gpt-4')) {
      inputPrice = 0.03 / 1000
      outputPrice = 0.06 / 1000
    } else if (model.includes('gpt-3.5-turbo')) {
      inputPrice = 0.0005 / 1000
      outputPrice = 0.0015 / 1000
    }

    return usage.input_tokens * inputPrice + usage.output_tokens * outputPrice
  }

  async listModels(): Promise<string[]> {
    const models = await this.client.models.list()
    return models.data
      .map((m) => m.id)
      .filter((id) => id.startsWith('gpt-'))
      .sort()
  }
}

// ============================================================================
// Register Provider
// ============================================================================

export const openaiProviderFactory: ProviderFactory = (config) => {
  return new OpenAIProvider(config)
}

// Auto-register when imported
registerProvider('openai', openaiProviderFactory)
