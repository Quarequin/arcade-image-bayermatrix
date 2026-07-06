// tests go here; this will not be compiled when this package is used as an extension.

game.stats = true;

let pics = [
    assets.image`pic0`,
    assets.image`pic1`,
    assets.image`pic2`,
    assets.image`pic3`,
    assets.image`pic4`,
    assets.image`pic5`,
    assets.image`pic6`,
    assets.image`pic7`,
];
let r = Math.random() * (pics.length - 1) | 0, cr = r; let pic = pics[r]; let t = 0;
forever(() => {
    scene.backgroundImage().drawBayerImage(pic, 0, 0, t, 0xF)
    if ((t & 0xff) > ((t + 0x1) & 0xff)) {
        // image.bayer(scene.backgroundImage(), pic, 0, 0, 0xff, 0xF);
        t = 0;
        while (r === cr) r = Math.random() * (pics.length - 1) | 0;
        cr = r;
        pic = pics[cr];
    } else t+=0x1;
})
