/**
 * Ollama Provider Adapter
 *
 * Supports local models via Ollama: Llama, Mistral, Gemma, etc.
 * API Docs: https://github.com/ollama/ollama/blob/main/docs/api.md
 *
 * Ollama supports OpenAI-compatible API at /v1/chat/completions
 */

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
// Message Format Conversion (OpenAI-compatible)
// ============================================================================

interface OllamaMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | null
  tool_calls?: OllamaToolCall[]
  tool_call_id?: string
}

interface OllamaToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

interface OllamaTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

/**
 * Convert unified messages to Ollama format (OpenAI-compatible)
 */
function convertMessagesToOllama(messages: UnifiedMessage[]): OllamaMessage[] {
  const result: OllamaMessage[] = []

  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      result.push({
        role: msg.role,
        content: msg.content,
      })
    } else {
      const textParts: string[] = []
      const toolCalls: OllamaToolCall[] = []
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
        }
      }

      if (toolResult) {
        result.push({
          role: 'tool',
          tool_call_id: toolResult.tool_call_id,
          content: toolResult.content,
        })
      } else if (toolCalls.length > 0 && msg.role === 'assistant') {
        result.push({
          role: 'assistant',
          content: textParts.join('\n') || null,
          tool_calls: toolCalls,
        })
      } else {
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
 * Convert unified tool definitions to Ollama format
 */
function convertToolsToOllama(tools: UnifiedToolDefinition[]): OllamaTool[] {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))
}

// ============================================================================
// Ollama Provider Implementation
// ============================================================================

class OllamaProvider implements AIProvider {
  name = 'ollama' as const
  private baseUrl: string
  private config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'http://localhost:11434'
  }

  async createMessage(params: ProviderParams): Promise<UnifiedResponse> {
    const ollamaMessages = convertMessagesToOllama(params.messages)
    const ollamaTools = params.tools ? convertToolsToOllama(params.tools) : undefined

    // Add system message if provided
    if (params.system && params.system.length > 0) {
      ollamaMessages.unshift({
        role: 'system',
        content: params.system.join('\n'),
      })
    }

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: ollamaMessages,
        tools: ollamaTools,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ollama API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return this.convertResponse(data, params.model)
  }

  async *createStreamingMessage(
    params: ProviderParams
  ): AsyncGenerator<UnifiedStreamEvent> {
    const ollamaMessages = convertMessagesToOllama(params.messages)
    const ollamaTools = params.tools ? convertToolsToOllama(params.tools) : undefined

    // Add system message if provided
    if (params.system && params.system.length > 0) {
      ollamaMessages.unshift({
        role: 'system',
        content: params.system.join('\n'),
      })
    }

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: ollamaMessages,
        tools: ollamaTools,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ollama API error: ${response.status} - ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let contentBlockIndex = 0

    // Emit message_start
    yield {
      type: 'message_start',
      message: {
        id: 'ollama-stream',
        model: params.model,
        content: [],
        usage: { input_tokens: 0, output_tokens: 0 },
        stop_reason: 'end_turn',
      },
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            yield { type: 'message_stop' }
            return
          }

          try {
            const chunk = JSON.parse(data)
            const delta = chunk.choices?.[0]?.delta
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
                  yield {
                    type: 'content_block_start',
                    index: contentBlockIndex,
                    content_block: {
                      type: 'tool_use',
                      id: toolCall.id,
                      name: toolCall.function?.name || '',
                      input: {},
                    },
                  }
                }
                if (toolCall.function?.arguments) {
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

            // Handle finish reason
            if (chunk.choices?.[0]?.finish_reason) {
              yield {
                type: 'content_block_stop',
                index: contentBlockIndex,
              }
              yield {
                type: 'message_delta',
                delta: {
                  stop_reason: chunk.choices[0].finish_reason === 'tool_calls'
                    ? 'tool_use'
                    : chunk.choices[0].finish_reason === 'length'
                      ? 'max_tokens'
                      : 'end_turn',
                },
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    yield { type: 'message_stop' }
  }

  supportsTools(): boolean {
    // Ollama supports tools for some models (e.g., llama3.1, mistral)
    return true
  }

  supportsVision(): boolean {
    // Some Ollama models support vision (e.g., llava)
    const model = this.config.model.toLowerCase()
    return model.includes('llava') || model.includes('vision')
  }

  getMaxContextTokens(): number {
    // Most Ollama models support 4k-32k context
    const model = this.config.model.toLowerCase()
    if (model.includes('llama3.1') || model.includes('llama3.2')) {
      return 128000
    }
    if (model.includes('mistral') || model.includes('mixtral')) {
      return 32000
    }
    return 4096
  }

  getMaxOutputTokens(): number {
    return this.config.maxTokens
  }

  calculateCost(_usage: UnifiedUsage): number {
    // Local models are free!
    return 0
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) {
        return []
      }
      const data = await response.json()
      return data.models?.map((m: { name: string }) => m.name) || []
    } catch {
      return []
    }
  }

  private convertResponse(data: Record<string, unknown>, model: string): UnifiedResponse {
    const choice = (data.choices as Array<Record<string, unknown>>)?.[0]
    if (!choice) {
      throw new Error('No choices in Ollama response')
    }

    const message = choice.message as Record<string, unknown>
    const content: UnifiedContentBlock[] = []

    if (message?.content) {
      content.push({
        type: 'text',
        text: message.content as string,
      })
    }

    if (message?.tool_calls) {
      for (const toolCall of message.tool_calls as Array<Record<string, unknown>>) {
        const func = toolCall.function as Record<string, unknown>
        content.push({
          type: 'tool_use',
          id: toolCall.id as string,
          name: func.name as string,
          input: JSON.parse(func.arguments as string),
        })
      }
    }

    let stopReason: UnifiedResponse['stop_reason'] = 'end_turn'
    if (choice.finish_reason === 'tool_calls') {
      stopReason = 'tool_use'
    } else if (choice.finish_reason === 'length') {
      stopReason = 'max_tokens'
    } else if (choice.finish_reason === 'stop') {
      stopReason = 'stop'
    }

    const usage = data.usage as Record<string, number> | undefined
    return {
      id: (data.id as string) || 'ollama-response',
      model: model,
      content,
      usage: {
        input_tokens: usage?.prompt_tokens || 0,
        output_tokens: usage?.completion_tokens || 0,
        total_tokens: usage?.total_tokens || 0,
      },
      stop_reason: stopReason,
    }
  }
}

// ============================================================================
// Register Provider
// ============================================================================

export const ollamaProviderFactory: ProviderFactory = (config) => {
  return new OllamaProvider(config)
}

// Auto-register when imported
registerProvider('ollama', ollamaProviderFactory)
