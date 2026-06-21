/**
 * Multi-Provider API Module
 *
 * This module provides a unified interface for multiple AI providers:
 * - Anthropic (Claude)
 * - OpenAI (GPT-4, GPT-4o)
 * - Google Gemini
 * - Ollama (local models)
 */

// Export types
export type {
  AIProvider,
  ProviderConfig,
  ProviderFactory,
  ProviderName,
  ProviderParams,
  UnifiedContentBlock,
  UnifiedImageBlock,
  UnifiedMessage,
  UnifiedMessageRole,
  UnifiedResponse,
  UnifiedStopReason,
  UnifiedStreamEvent,
  UnifiedStreamEventType,
  UnifiedTextBlock,
  UnifiedToolDefinition,
  UnifiedToolResultBlock,
  UnifiedToolUseBlock,
  UnifiedUsage,
} from './types.js'

// Export registry functions
export {
  createProvider,
  getProviderConfigFromEnv,
  getRegisteredProviders,
  hasProvider,
  registerProvider,
} from './registry.js'

// Import providers to trigger auto-registration
import './openai.js'
import './ollama.js'
// TODO: import './gemini.js' when implemented
