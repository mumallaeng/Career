export type ColorScheme = 'light' | 'dark';

export const COLOR_SCHEME_STORAGE_KEY = 'career-color-scheme';
export const COLOR_SCHEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';
export const DEFAULT_COLOR_SCHEME: ColorScheme = 'light';

export function isColorScheme(value: string | null): value is ColorScheme {
  return value === 'light' || value === 'dark';
}
