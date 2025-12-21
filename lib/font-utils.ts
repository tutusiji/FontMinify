
import opentype from 'opentype.js';

export async function generateSubset(buffer: Buffer, text: string, name: string): Promise<Buffer> {
  const font = opentype.parse(new Uint8Array(buffer).buffer);
  const glyphs = [font.glyphs.get(0)]; // Always include .notdef
  
  // Unique characters
  const chars = Array.from(new Set(text.split('')));
  
  for (const char of chars) {
    const glyph = font.charToGlyph(char);
    if (glyph && glyph.index !== 0) {
      glyphs.push(glyph);
    }
  }

  const subsetFont = new opentype.Font({
    familyName: name || font.names.fontFamily.en || 'Subsetted',
    styleName: font.names.fontSubfamily.en || 'Regular',
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    glyphs: glyphs
  });

  const ab = subsetFont.toArrayBuffer();
  return Buffer.from(ab);
}
