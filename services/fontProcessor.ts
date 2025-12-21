
import { FontProject } from '../types';

/**
 * Subsets a font by extracting only the glyphs for the given characters.
 * Note: Producing a full-featured TTF in the browser is complex.
 * This implementation uses opentype.js to filter glyphs and create a new Font object.
 */
export async function subsetFont(buffer: ArrayBuffer, text: string, originalName: string): Promise<Uint8Array> {
  const opentype = window.opentype;
  if (!opentype) throw new Error('opentype.js not loaded');

  const font = opentype.parse(buffer);
  const glyphs = [font.glyphs.get(0)]; // Always include notdef
  
  // Extract unique characters from text
  const uniqueChars = Array.from(new Set(text.split('')));
  
  for (const char of uniqueChars) {
    const glyph = font.charToGlyph(char);
    if (glyph && glyph.index !== 0) {
      glyphs.push(glyph);
    }
  }

  // Create new font with subsetted glyphs
  const subsetFont = new opentype.Font({
    familyName: font.names.fontFamily.en || 'SubsettedFont',
    styleName: font.names.fontSubfamily.en || 'Regular',
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    glyphs: glyphs
  });

  const subsetBuffer = subsetFont.toArrayBuffer();
  return new Uint8Array(subsetBuffer);
}

export function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
