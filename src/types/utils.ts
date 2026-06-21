// Stub: utility types
export type DeepImmutable<T> = {
  readonly [P in keyof T]: DeepImmutable<T[P]>
}

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type Nullable<T> = T | null

export type Optional<T> = T | undefined
