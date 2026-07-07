// tests go here; this will not be compiled when this package is used as an extension.

let paused = 0;

controller.anyButton.onEvent(ControllerButtonEvent.Pressed, () => {
    if (!controller.menu.isPressed()) return;
    paused = 1 - paused;
})

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
let bpals = [
    image.BayerSize.x4, 8,
    image.BayerSize.x8, 4,
    image.BayerSize.x16, 1,
];
let r = randint(0, pics.length - 1), cr = r;
let pic = pics[r], t = 0, bpi = Math.imul(randint(0, 2), 2)
    , bpal = bpals[bpi]; bpi = bpals[bpi + 1], t = 0;
forever(() => {
    switch (paused) {
        case 0:
            if ((t & 0xff) > ((t + bpi) & 0xff)) {
                scene.backgroundImage().drawBayerImage(pic, 0, 0, 0xff, bpal);
                pause(512);
                while (r === cr) r = randint(0, pics.length - 1);
                cr = r; bpi = Math.imul(randint(0, 2), 2);
                bpal = bpals[bpi]; bpi = bpals[bpi + 1]; t = 0;
                pic = pics[cr];
            } else scene.backgroundImage().drawBayerImage(pic, 0, 0, t, bpal), t += bpi;
    }
})

// end test