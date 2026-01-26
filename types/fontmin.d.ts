declare module "fontmin" {
  interface FontminFile {
    path: string
    contents: Buffer
    relative: string
    base: string
    basename: string
    extname: string
  }

  interface GlyphOptions {
    text: string
    hinting?: boolean
  }

  type FontminPlugin = (file: FontminFile) => FontminFile

  interface FontminStatic {
    glyph(options: GlyphOptions): FontminPlugin
    ttf2woff(): FontminPlugin
    ttf2woff2(): FontminPlugin
    ttf2eot(): FontminPlugin
    ttf2svg(): FontminPlugin
    otf2ttf(): FontminPlugin
    svgs2ttf(): FontminPlugin
    css(): FontminPlugin
  }

  class Fontmin {
    static glyph(options: GlyphOptions): FontminPlugin
    static ttf2woff(): FontminPlugin
    static ttf2woff2(): FontminPlugin
    static ttf2eot(): FontminPlugin
    static ttf2svg(): FontminPlugin
    static otf2ttf(): FontminPlugin
    static svgs2ttf(): FontminPlugin
    static css(): FontminPlugin

    src(path: string | string[]): this
    dest(path: string): this
    use(plugin: FontminPlugin): this
    run(
      callback: (err: Error | null, files: FontminFile[]) => void
    ): void
  }

  namespace Fontmin {
    type File = FontminFile
  }

  export = Fontmin
}
