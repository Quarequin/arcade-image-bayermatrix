
namespace image {

    const BAYER4X4_DATA: Buffer = hex`
00 88 22 AA
CC 44 EE 66
33 BB 11 99
DD 55 FF 77
`

    const BAYER8X8_DATA: Buffer = hex`
00 C2 33 F2 0E CE 3F FF
82 43 B2 73 8E 4F BE 7F
22 E3 12 D3 2E EF 1E DF
A2 63 92 53 AE 6F 9E 5F
0A CA 3B FB 02 C6 2F F7
8A 4B BA 7B 86 47 B6 77
2A EB 1A DB 26 E7 16 D7
AA 6A 9A 5B A6 66 96 57
`;

    const BAYER16X16_DATA: Buffer = hex`
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
`

    function bayerDraw(from: Image, to: Image, x: number, y: number, opacity: number, bayer: Buffer, bn: number) {
        if (!from) return;
        if (opacity >= 0xff) {
            to.drawTransparentImage(from, x, y);
            return;
        } else if (opacity <= 0x00) return;
        opacity = Math.clamp(0x00, 0xff, opacity);
        let frowBuf = pins.createBuffer(from.height);
        let trowBuf = pins.createBuffer(to.height);
        let bx = 0x0, by = 0x0, b = 0x0;
        for (let ix = 0;ix < from.width; ix++) {
            if (ix + x < 0) continue;
            if (ix + x >= to.width) break;
            from.getRows(ix, frowBuf);
            to.getRows(ix + x, trowBuf);
            bx = (ix + x) & (bn - 1);
            for (let iy = 0;iy < frowBuf.length; iy++) {
                if (iy + y < 0) continue;
                if (iy + y >= trowBuf.length) break;
                if (!frowBuf[iy]) continue;
                by = (iy + y) & (bn - 1);
                b = bayer[bx + (by * bn)];
                if (opacity >= b) trowBuf[iy + y] = frowBuf[iy];
            }
            to.setRows(ix + x, trowBuf);
        }
    }

    export function bayerDraw4(from: Image, to: Image, x: number, y: number, opacity: number) {
        bayerDraw(from, to, x, y, opacity, BAYER4X4_DATA, 0x4);
    }

    export function bayerDraw8(from: Image, to: Image, x: number, y: number, opacity: number) {
        bayerDraw(from, to, x, y, opacity, BAYER8X8_DATA, 0x8);
    }

    export function bayerDraw16(from: Image, to: Image, x: number, y: number, opacity: number) {
        bayerDraw(from, to, x, y, opacity, BAYER16X16_DATA, 0x10);
    }
    
}
