
namespace image {
    export enum BayerSize {
        //% block="bayer 4x4"
        x4 = 0x3,
        //% block="bayer 8x8"
        x8 = 0x7,
        //% block="bayer 16x16"
        x16 = 0xf,
    }
}

namespace helpers {

    const BAYER_4X4: Buffer = hex`
00 88 22 AA
CC 44 EE 66
33 BB 11 99
DD 55 FF 77
`;
    const BAYER_8X8: Buffer = hex`
00 C2 33 F2 0E CE 3F FF
82 43 B2 73 8E 4F BE 7F
22 E3 12 D3 2E EF 1E DF
A2 63 92 53 AE 6F 9E 5F
0A CA 3B FB 02 C6 2F F7
8A 4B BA 7B 86 47 B6 77
2A EB 1A DB 26 E7 16 D7
AA 6A 9A 5B A6 66 96 57
`;
    const BAYER_16X16: Buffer = hex`
00 80 20 A0 08 88 28 A8 02 82 22 A2 0A 8A 2A AA
C0 40 E0 60 C8 48 E8 68 C2 42 E2 62 CA 4A EA 6A
30 B0 10 90 38 B8 18 98 32 B2 12 92 3A BA 1A 9A
F0 70 D0 50 F8 78 D8 58 F2 72 D2 52 FA 7A DA 5A
0C 8C 2C AC 04 84 24 A4 0E 8E 2E AE 06 86 26 A6
CC 4C EC 6C C4 44 E4 64 CE 4E EE 6E C6 46 E6 66
3C BC 1C 9C 34 B4 14 94 3E BE 1E 9E 36 B6 16 96
FC 7C DC 5C F4 74 D4 54 FE 7E DE 5E F6 76 D6 56
03 83 23 A3 0B 8B 2B AB 01 81 21 A1 09 89 29 A9
C3 43 E3 63 CB 4B EB 6B C1 41 E1 61 C9 49 E9 69
33 B3 13 93 3B BB 1B 9B 31 B1 11 91 39 B9 19 99
F3 73 D3 53 FB 7B DB 5B F1 71 D1 51 F9 79 D9 59
0F 8F 2F AF 07 87 27 A7 0D 8D 2D AD 05 85 25 A5
CF 4F EF 6F C7 47 E7 67 CD 4D ED 6D C5 45 E5 65
3F BF 1F 9F 37 B7 17 97 3D BD 1D 9D 35 B5 15 95
FF 7F DF 5F F7 77 D7 57 FD 7D DD 5D F5 75 D5 55
`;
    // bayer_drawcore
    // - bayer_drawcore's init (section.data like)
    let bx: int32 = 0x0, by: int32 = 0x0, b: uint8 = 0x00,
        bs: int8 = 0x00, bn: int8 = 0xff, ibx: int32 = 0x0, iby: int32 = 0x0;
    let frowBuf: Buffer = hex``, trowBuf: Buffer = hex``, curBayer: Buffer = hex``;
    let bayer_drawcore_inuse = false;
    // - reused function (not referense from makecode arcade bulit-in function)
    const local_neg_abs = (n: number) => { switch (n >= 0) { case true: return 0; default: return -n; } };
    // end bayer_drawcore
    function bayer_drawcore(to: Image, from: Image, x: number, y: number, opacity: number, level: image.BayerSize, transparent: boolean) {
        switch (bayer_drawcore_inuse) { case true: return; }
        switch (!to || !from) { case true: return; }
        switch (to) { case from: return; }
        bayer_drawcore_inuse = true;
        switch (level) {
            case image.BayerSize.x4: switch (bn) { case image.BayerSize.x4:
            break; default: curBayer = BAYER_4X4; bn = 0x3; } break;
            case image.BayerSize.x8: default: switch (bn) { case image.BayerSize.x8:
            break; default: curBayer = BAYER_8X8; bn = 0x7; } break;
            case image.BayerSize.x16: switch (bn) { case image.BayerSize.x16:
            break; default: curBayer = BAYER_16X16; bn = 0xF; } break;
        }
        x = x|0, y = y|0, opacity = opacity&0xff;
        switch (opacity) {
            case 0xff:
            switch (transparent) { case true: to.drawTransparentImage(from, x, y);
            break; default: to.drawImage(from, x, y); }
            bayer_drawcore_inuse = false; return;
            case 0x00:
            switch (transparent) { case false: to.fillRect(x, y, from.width, from.height, 0x0); }
            bayer_drawcore_inuse = false; return;
        }
        bs = bn + 1;
        switch (frowBuf.length) { case from.height: break; default: frowBuf = pins.createBuffer(from.height); }
        switch (trowBuf.length) { case to.height: break; default: trowBuf = pins.createBuffer(to.height); }
        for (ibx = local_neg_abs(x); ibx < from.width; ibx++) {
            if (ibx + x < 0) continue;
            if (ibx + x >= to.width) break;
            from.getRows(ibx, frowBuf);
            to.getRows(ibx + x, trowBuf);
            bx = ibx+x; bx = bx&bn;
            for (iby = local_neg_abs(y); iby < frowBuf.length; iby++) {
                if (iby + y < 0) continue;
                if (iby + y >= trowBuf.length) break;
                switch (transparent) { case !!frowBuf[iby]:
                switch (trowBuf[iby + y]) { case frowBuf[iby]: break; default:
                    by = iby+y; by = by&bn;
                    by = Math.imul(by,bs); by = by+bx;
                    b = curBayer[by];
                    if (opacity < b) break;
                    trowBuf[iby + y] = frowBuf[iby];
                } }
            }
            to.setRows(ibx + x, trowBuf);
        }
        bayer_drawcore_inuse = false;
    }

    export function imageDrawBayerImage(to: Image, from: Image, x: number, y: number, opacity: number, level: image.BayerSize): void {
        bayer_drawcore(to, from, x, y, opacity, level, true);
    }

    export function imageDrawOpaqueBayerImage(to: Image, from: Image, x: number, y: number, opacity: number, level: image.BayerSize): void {
        bayer_drawcore(to, from, x, y, opacity, level, false);
    }
    
}
