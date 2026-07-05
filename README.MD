
<h1 align="center">arcade-image-bayermatrix</h1>

<p align="center">
  Bayer-matrix ordered dithering for <b>MakeCode Arcade</b> — fake per-pixel opacity ("pseudo-opacity") on hardware that has no real alpha blending.
</p>

<p align="center">
  <a href="https://github.com/Quarequin/arcade-image-bayermatrix/releases"><img src="https://img.shields.io/github/v/release/Quarequin/arcade-image-bayermatrix?style=flat-square" alt="release"></a>
  <a href="https://github.com/Quarequin/arcade-image-bayermatrix/blob/master/LICENSE"><img src="https://img.shields.io/github/license/Quarequin/arcade-image-bayermatrix?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/language-TypeScript-blue?style=flat-square" alt="typescript">
</p>

<p align="center">
  <a href="https://quarequin.github.io/arcade-image-bayermatrix"><b>▶ Live demo</b></a>
</p>

---

## What is this?

MakeCode Arcade images don't support real alpha transparency — a pixel is either drawn or it isn't. This extension fakes partial transparency by using an **ordered (Bayer) dithering pattern**: instead of blending a pixel 50% with the background, it draws the pixel on roughly half of the frames/positions according to a fixed threshold matrix, and skips it on the rest. The eye perceives this as a grey/translucent blend.

<details>
<summary><b>Why Bayer dithering instead of random noise?</b> (click to expand)</summary>
<br>

Random dithering is cheap to generate but produces visual noise that shifts every frame, which is distracting at Arcade's low resolution. A **Bayer matrix** is a fixed, precomputed threshold table (4×4 or 8×8) arranged so the dither pattern stays visually stable and evenly distributed instead of flickering. Since the matrix never changes at runtime, it can be baked into a `Buffer` once and reused for every draw call — no trigonometry, no `Math.random()`, no per-frame recomputation.

</details>

## How it's built

| Part | Origin |
|---|---|
| Bayer matrix constants | Generated with an LLM (Gemini), used purely as a reference table for the threshold values |
| Buffer packing, pseudo-opacity algorithm, blending logic | Written by hand |
| Performance optimizations | Written and tuned by hand |

The matrix itself is just a lookup table — there's only one correct set of numbers for a given matrix size, so asking an LLM for the reference values was a shortcut on the *data*, not the *logic*. Everything that actually decides how a sprite gets drawn — buffer layout, threshold comparison, variable init order — was written and profiled manually. This split keeps the extension auditable: reviewers only need to sanity-check a table of constants, not trust generated control flow.

## Performance notes

MakeCode Arcade extensions have no classes/OOP layer at the interpreter level, so this extension avoids the overhead that would come from object-oriented patterns:

- **Assembly-style variable declaration** — all working variables are declared once up front at init time (analogous to reserving registers/stack slots at the start of a routine), rather than allocated dynamically inside the render loop.
- **No dynamic code generation** — no `eval`-like patterns or runtime-constructed functions; every code path is static so the Arcade JIT/interpreter can execute it predictably.
- **Precomputed Buffer, not recomputed matrix** — the Bayer matrix is stored once as a flat `Buffer` and indexed, never rebuilt per frame.

Together these keep the pseudo-opacity effect close to zero-allocation per frame, which matters on Arcade's constrained hardware where every dropped frame is visible.

## Usage

```typescript
// example: draw a sprite with ~50% pseudo-opacity
bayermatrix.setOpacity(mySprite, 128) // 0 = fully transparent, 255 = fully opaque
```

> Add real usage snippets here once the public API in `api.ts` is finalized.

## Install

Open this project in MakeCode Arcade → **Extensions** → search for:

```
https://github.com/Quarequin/arcade-image-bayermatrix
```

## Edit / Build locally

This repository can be edited in MakeCode.

- Open [https://arcade.makecode.com/](https://arcade.makecode.com/)
- Click **Import** → **Import URL**
- Paste **https://github.com/Quarequin/arcade-image-bayermatrix** and click import

## License

See [LICENSE](LICENSE.TXT).

## Supported targets

* for PXT/arcade
