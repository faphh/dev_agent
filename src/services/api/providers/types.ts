/**
 * Multi-Provider API Types
 *
 * Unified type definitions for supporting multiple AI providers:
 * - Anthropic (Claude)
 * - OpenAI (GPT-4, GPT-4o)
 * - Google Gemini
 * - Ollama (local models)
 */

// ============================================================================
// Unified Message Types
// ============================================================================

export type UnifiedMessageRole = 'user' | 'assistant' | 'system'

export interface UnifiedTextBlock {
  type: 'text'
  text: string
}

export interface UnifiedImageBlock {
  type: 'image'
  source: {
    type: 'base64'
    media_type: string
    data: string
  }
}

export interface UnifiedToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface UnifiedToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: string | UnifiedContentBlock[]
  is_error?: boolean
}

export type UnifiedContentBlock =
  | UnifiedTextBlock
  | UnifiedImageBlock
  | UnifiedToolUseBlock
  | UnifiedToolResultBlock

export interface UnifiedMessage {
  role: UnifiedMessageRole
  content: string | UnifiedContentBlock[]
}

// ============================================================================
// Unified Tool Definition
// ============================================================================

export interface UnifiedToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>  // JSON Schema format
}

// ============================================================================
// Unified Response Types
// ============================================================================

export type UnifiedStopReason = 'end_turn' | 'tool_use' | 'max_tokens' | 'stop'

export interface UnifiedUsage {
  input_tokens: number
  output_tokens: number
  total_tokens?: number
}

export interface UnifiedResponse {
  id: string
  model: string
  content: UnifiedContentBlock[]
  usage: UnifiedUsage
  stop_reason: UnifiedStopReason
}

// ============================================================================
// Streaming Types
// ============================================================================

export type UnifiedStreamEventType =
  | 'message_start'
  | 'content_block_start'
  | 'content_block_delta'
  | 'content_block_stop'
  | 'message_delta'
  | 'message_stop'

export interface UnifiedStreamEvent {
  type: UnifiedStreamEventType
  // Message start
  message?: Partial<UnifiedResponse>
  // Content block
  index?: number
  content_block?: UnifiedContentBlock
  // Delta
  delta?: {
    type?: string
    text?: string
    partial_json?: string
    stop_reason?: UnifiedStopReason
  }
  // Usage
  usage?: Partial<UnifiedUsage>
}

// ============================================================================
// Provider Configuration
// ============================================================================

export type ProviderName = 'anthropic' | 'openai' | 'gemini' | 'ollama'

export interface ProviderConfig {
  provider: ProviderName
  apiKey?: string
  baseUrl?: string
  model: string
  maxTokens: number
  temperature?: number
  // Provider-specific options
  options?: Record<string, unknown>
}

// ============================================================================
// Provider Interface
// ============================================================================

export interface AIProvider {
  /** Provider name */
  name: ProviderName

  /** Create a message (non-streaming) */
  createMessage(params: ProviderParams): Promise<UnifiedResponse>

  /** Create a streaming message */
  createStreamingMessage(params: ProviderParams): AsyncGenerator<UnifiedStreamEvent>

  /** Check if provider supports tool calling */
  supportsTools(): boolean

  /** Check if provider supports vision (image input) */
  supportsVision(): boolean

  /** Get maximum context window size */
  getMaxContextTokens(): number

  /** Get maximum output tokens */
  getMaxOutputTokens(): number

  /** Calculate cost for given usage */
  calculateCost(usage: UnifiedUsage): number

  /** List available models */
  listModels?(): Promise<string[]>
}

export interface ProviderParams {
  model: string
  messages: UnifiedMessage[]
  system?: string[]
  tools?: UnifiedToolDefinition[]
  maxTokens: number
  temperature?: number
  stream?: boolean
  // Provider-specific options
  options?: Record<string, unknown>
}

// ============================================================================
// Provider Factory
// ============================================================================

export type ProviderFactory = (config: ProviderConfig) => AIProvider
