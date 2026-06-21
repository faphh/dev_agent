// Stub: types barrel export
export * from '../../types/message.js'
export * from '../../types/permissions.js'
export * from '../../types/tools.js'
export * from '../../types/hooks.js'
export * from '../../types/ids.js'
export * from '../../types/utils.js'
export * from '../../types/command.js'

// File persistence specific types
export const DEFAULT_UPLOAD_CONCURRENCY = 5
export const FILE_COUNT_LIMIT = 100
export const OUTPUTS_SUBDIR = 'outputs'

export type TurnStartTime = number

export interface PersistedFile {
  path: string
  fileId?: string
  error?: string
}

export interface FailedPersistence {
  path: string
  error: string
}

export interface FilesPersistedEventData {
  files: PersistedFile[]
  failed: FailedPersistence[]
  duration: number
}
