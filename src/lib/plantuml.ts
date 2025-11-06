import { deflateRawSync } from 'zlib';

const PLANTUML_EXTENSIONS = new Set(['.puml', '.plantuml']);

export function isPlantUmlExtension(extension: string): boolean {
  return PLANTUML_EXTENSIONS.has(extension.toLowerCase());
}

export function containsPlantUml(content: string): boolean {
  return content.trimStart().startsWith('@startuml');
}

function encode6bit(value: number): string {
  if (value < 10) return String.fromCharCode(48 + value);
  value -= 10;
  if (value < 26) return String.fromCharCode(65 + value);
  value -= 26;
  if (value < 26) return String.fromCharCode(97 + value);
  value -= 26;
  if (value === 0) return '-';
  if (value === 1) return '_';
  return '?';
}

function encodePlantUml(content: string): string {
  const deflated = deflateRawSync(Buffer.from(content, 'utf8'));
  let encoded = '';

  for (let i = 0; i < deflated.length; i += 3) {
    const b1 = deflated[i];
    const b2 = i + 1 < deflated.length ? deflated[i + 1] : 0;
    const b3 = i + 2 < deflated.length ? deflated[i + 2] : 0;

    const c1 = (b1 >> 2) & 0x3f;
    const c2 = ((b1 & 0x3) << 4) | ((b2 >> 4) & 0xf);
    const c3 = ((b2 & 0xf) << 2) | ((b3 >> 6) & 0x3);
    const c4 = b3 & 0x3f;

    encoded += encode6bit(c1);
    encoded += encode6bit(c2);
    encoded += encode6bit(c3);
    encoded += encode6bit(c4);
  }

  return encoded;
}

export function buildPlantUmlUrl(content: string): string | null {
  const source = content.trim();
  if (!source) {
    return null;
  }
  const encoded = encodePlantUml(source);
  return `https://www.plantuml.com/plantuml/svg/${encoded}`;
}
