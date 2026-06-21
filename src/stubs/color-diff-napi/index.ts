// Stub: color-diff-napi
export function colorDiff(_color1: string, _color2: string): number {
  return 0
}

export function nearestColor(_target: string, _palette: string[]): string {
  return _palette[0] || '#000000'
}

export class ColorFile {
  path: string
  content: string
  language?: string

  constructor(path: string, content: string, language?: string) {
    this.path = path
    this.content = content
    this.language = language
  }
}

export interface SyntaxTheme {
  [key: string]: string
}

export class ColorDiff {
  constructor(_options?: Record<string, unknown>) {}
  colorize(_text: string): string {
    return _text
  }
}

export function getSyntaxTheme(): SyntaxTheme {
  return {}
}

export function colorizeDiff(_diff: string): string {
  return _diff
}


