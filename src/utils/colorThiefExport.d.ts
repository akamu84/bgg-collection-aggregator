declare module "../utils/colorThiefExport" {
  export default class ColorThief {
    getPalette(img: HTMLImageElement, colorCount?: number): number[][];
  }
}
