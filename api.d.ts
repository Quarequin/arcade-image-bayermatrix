
declare namespace image {
    export enum BayerSize {
        //% block="bayer 4x4"
        x4 = 0x3,
        //% block="bayer 8x8"
        x8 = 0x7,
        //% block="bayer 16x16"
        x16 = 0xf,
    }
}

declare namespace helpers {

    const BAYER4X4_DATA: Buffer;
    const BAYER8X8_DATA: Buffer;
    const BAYER16X16_DATA: Buffer;
    // bayer_drawcore
    // - bayer_drawcore's init (section.data like)
    let bx: int32, by: int32, b: uint8,
        bs: int8, bn: int8, ibx: int32, iby: int32;
    let frowBuf: Buffer, trowBuf: Buffer, curBayer: Buffer;
    let bayer_drawcore_inuse: boolean;
    // - reused function (not referense from makecode arcade bulit-in function)
    const local_neg_abs: (n: number) => number;
    // end bayer_drawcore
    function bayer_drawcore(to: Image, from: Image, x: number, y: number, opacity: number, level: image.BayerSize, transparent: boolean): void;

}

declare interface Image {

    /**
     * Draw image with pseudo-opacity(0-255) into current image
     * @param source image
     * @param draw to current image
     * @param x position of dist image
     * @param y position of dist image
     * @param opacity as 0-255 for pseudo-opacity
     * @param precomputed bayer-matrix size as enum
     */
    //% blockNamespace=images inlineInputMode=inline blockId=image_draw_opacity_bayer
    //% block="%this draw matrix %from at x %x y %y opacity $opacity on %level"
    //% group="Drawing" weight=1
    //% opacity.min=0 opacity.max=255 opacity.defl="128"
    //% this.shadow=variables_get this.defl=picture
    //% from.shadow=image_picker
    //% helper=imageDrawBayerImage
    drawBayerImage(from: Image, x: number, y: number, opacity: number, level: image.BayerSize): void;

    //% helper=imageDrawOpaqueBayerImage
    drawOpaqueBayerImage(from: Image, x: number, y: number, opacity: number, level: image.BayerSize): void;
}
