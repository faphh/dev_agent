// Global type declarations
declare const MACRO: {
  VERSION: string
  ISSUES_EXPLAINER: string
  PACKAGE_URL: string
  NATIVE_PACKAGE_URL: string
  VERSION_CHANGELOG: string
}

declare module 'bun:bundle' {
  export function feature(name: string): boolean
  export function isProd(): boolean
  export function isDev(): boolean
}
