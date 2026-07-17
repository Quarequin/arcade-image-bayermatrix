
//  declare namespace image {
//      export enum BayerSize {
//          //% block="bayer 4x4"
//          x4 = 0x3,
//          //% block="bayer 8x8"
//          x8 = 0x7,
//          //% block="bayer 16x16"
//          x16 = 0xf,
//      }
//  }

declare namespace helpers {

    // section.rodata
    const BAYER4X4_DATA:   Buffer;
    const BAYER8X8_DATA:   Buffer;
    const BAYER16X16_DATA: Buffer;
    const local_neg_abs: (n: number) => number;
    // end section.rodata
    // section.data
    // - bayer_drawcore's item
    let bx:  int32;
    let by:  int32;
    let bs:  int8;
    let bn:  int8;
    let b:   uint8;
    let ibx: int32;
    let iby: int32;
    let frowBuf:  Buffer;
    let trowBuf:  Buffer;
    let curBayer: Buffer;
    let bayer_drawcore_inuse: boolean;
    // - reused function (not referense from makecode arcade bulit-in function)
    // end section.data
    function bayer_drawcore(to: Image, from: Image, x: number, y: number, opacity: number, level: image.BayerSize, transparent: boolean): void;

}

declare interface Image {

    /**
     * Draw image with pseudo-opacity(0-255) of bayer-matrix into current image
     * @param source image
     * @param draw to current image
     * @param x position of current image
     * @param y position of current image
     * @param opacity as 0-255 for pseudo-opacity
     * @param precomputed bayer-matrix size as number of enum
     */
    //% blockNamespace=images inlineInputMode=inline blockId=image_draw_opacity_bayer
    //% block=" %this draw matrix %from at x %x y %y opacity $opacity on %level"
    //% group="Drawing" weight=1
    //% opacity.min=0 opacity.max=255 opacity.defl="128"
    //% level.defl=image.BayerSize.x8
    //% this.shadow=variables_get this.defl=picture
    //% from.shadow=image_picker
    //% helper=imageDrawBayerImage
    drawBayerImage(from: Image, x: number, y: number, opacity: number, level: image.BayerSize): void;

    //% helper=imageDrawOpaqueBayerImage
    drawOpaqueBayerImage(from: Image, x: number, y: number, opacity: number, level: image.BayerSize): void;
}
