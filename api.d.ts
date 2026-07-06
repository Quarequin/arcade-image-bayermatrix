// Add your code here

interface Image {

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
    //% block="%this=variables_get draw matrix %from=image_picker at x %x y %y opacity $opacity|| from %level"
    //% group=Drawing weight=80
    //% opacity.min=0 opacity.max=255 opacity.defl="128"
    //% this.defl=picture
    //% helper=imageDrawBayerImage
    drawBayerImage(from: Image, x: number, y: number, opacity: number, level?: image.BayerSize): void;

    //% helper=imageDrawOpaqueBayerImage
    drawOpaqueBayerImage(from: Image, x: number, y: number, opacity: number, level?: image.BayerSize): void;
}
