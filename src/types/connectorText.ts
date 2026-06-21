// Stub: connectorText types
export type ConnectorTextBlock = {
  type: 'connector_text'
  text: string
  connector?: string
}

export function isConnectorTextBlock(block: unknown): block is ConnectorTextBlock {
  return typeof block === 'object' && block !== null && 'type' in block && (block as ConnectorTextBlock).type === 'connector_text'
}
