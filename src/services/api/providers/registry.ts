/**
 * Provider Registry
 *
 * Manages provider registration and instantiation.
 */

import type {
  AIProvider,
  ProviderConfig,
  ProviderFactory,
  ProviderName,
} from './types.js'

// ============================================================================
// Provider Registry
// ============================================================================

const providerFactories = new Map<ProviderName, ProviderFactory>()

/**
 * Register a provider factory
 */
export function registerProvider(name: ProviderName, factory: ProviderFactory): void {
  providerFactories.set(name, factory)
}

/**
 * Create a provider instance
 */
export function createProvider(config: ProviderConfig): AIProvider {
  const factory = providerFactories.get(config.provider)
  if (!factory) {
    throw new Error(
      `Unknown provider: ${config.provider}. Available providers: ${Array.from(providerFactories.keys()).join(', ')}`
    )
  }
  return factory(config)
}

/**
 * Get list of registered providers
 */
export function getRegisteredProviders(): ProviderName[] {
  return Array.from(providerFactories.keys())
}

/**
 * Check if a provider is registered
 */
export function hasProvider(name: ProviderName): boolean {
  return providerFactories.has(name)
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Get provider configuration from environment variables
 */
export function getProviderConfigFromEnv(): ProviderConfig {
  const provider = (process.env.DEV_AGENT_PROVIDER?.toLowerCase() || 'anthropic') as ProviderName

  switch (provider) {
    case 'openai':
      return {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
        temperature: process.env.OPENAI_TEMPERATURE
          ? parseFloat(process.env.OPENAI_TEMPERATURE)
          : undefined,
      }

    case 'gemini':
      return {
        provider: 'gemini',
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-pro',
        maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '4096', 10),
        temperature: process.env.GEMINI_TEMPERATURE
          ? parseFloat(process.env.GEMINI_TEMPERATURE)
          : undefined,
      }

    case 'ollama':
      return {
        provider: 'ollama',
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3',
        maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '4096', 10),
        temperature: process.env.OLLAMA_TEMPERATURE
          ? parseFloat(process.env.OLLAMA_TEMPERATURE)
          : undefined,
      }

    case 'anthropic':
    default:
      return {
        provider: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '8192', 10),
      }
  }
}
