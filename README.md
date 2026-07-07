<p align="center">
  <img src="https://quarequin.github.io/arcade-image-bayermatrix/icon.png" alt="arcade-image-bayermatrix icon" width="80" onerror="this.style.display='none'">
</p>

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
  <a href="https://quarequin.github.io/arcade-image-bayermatrix"><b>▶ Live demo</b></a> | <a href="LAYOUT.md"><b>LAYOUT.md</b></a>
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

## Design decisions

<details>
<summary><b>Why register-based, not object-based?</b> (click to expand)</summary>
<br>

This extension is deliberately **register-based**: all state lives in flat, pre-declared variables (like CPU registers/stack slots reserved once at startup) instead of being wrapped in objects/classes that get allocated and garbage-collected during runtime.

This choice comes from a costly earlier lesson with **arcade-polymesh** (a MakeCode Arcade 3D-engine extension forked from brohann3d) — an object-heavy, AI-assisted approach there ended up causing real problems for the MakeCode community once it was actually used in projects, and made review much harder for human maintainers. That extension has since been archived as a case study.

For `arcade-image-bayermatrix`, the register-based approach avoids repeating that mistake:

- No runtime object allocation → no GC pressure → stable FPS
- Flat variables are trivial for a human reviewer to trace end-to-end
- Matches the reality that PXT/Arcade extensions have no OOP layer to begin with, so fighting for object semantics only adds overhead without adding safety

</details>

## Demo

The repository ships two separate demos, kept apart so benchmarking and showcasing don't interfere with each other:

| | Main demo | `testFile` |
|---|---|---|
| Purpose | Visual showcase | Performance benchmark |
| Behavior | Randomly picks a new background (never repeating the one currently shown), selects a Bayer matrix sheet, and fades between old and new background using the extension's own pseudo-opacity mechanism | Randomizes `bayerMatrixSize` at runtime and measures the resulting fps, to find which matrix sizes cause a measurable frame-rate drop |
| What it proves | The dithering effect looks right in a real use case (a fade transition), not just as a static overlay | The performance claims in [Performance notes](#performance-notes) and [LAYOUT.md](LAYOUT.md) are measured, not assumed |

The main demo also pauses the engine's own processing while the pause menu is open — a `run on any button pressed` handler that returns immediately unless the **menu** button specifically was pressed, so the dithering loop doesn't keep running uselessly while the game is paused.

## Performance notes

MakeCode Arcade extensions have no classes/OOP layer at the interpreter level, so this extension avoids the overhead that would come from object-oriented patterns:

- **Assembly-style variable declaration** — all working variables are declared once up front at init time (analogous to reserving registers/stack slots at the start of a routine), rather than allocated dynamically inside the render loop.
- **No dynamic code generation** — no `eval`-like patterns or runtime-constructed functions; every code path is static so the Arcade JIT/interpreter can execute it predictably.
- **Precomputed Buffer, not recomputed matrix** — the Bayer matrix is stored once as a flat `Buffer` and indexed, never rebuilt per frame.

Together these keep the pseudo-opacity effect close to zero-allocation per frame, which matters on Arcade's constrained hardware where every dropped frame is visible.

For the full breakdown of every optimization layer (register allocation, call stack depth, switch-case dispatch, type representation, expression splitting, variable recycling, the reentrancy guard, and the `testFile` benchmark harness that validates all of it), see **[LAYOUT.md](LAYOUT.md)**.

## Usage

```typescript
let picture = image.create(80,60).fill(1)
// example: draw a picture with ~50% pseudo-opacity to background
scene.backgroundImage().drawBayerImage(picture, 40, 30, 128, image.bayerLevel.x8) // 0 = fully transparent, 255 = fully opaque
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

See [LICENSE](LICENSE).

## Supported targets

* for PXT/arcade
