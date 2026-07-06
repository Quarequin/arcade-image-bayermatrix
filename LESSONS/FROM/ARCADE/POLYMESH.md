<h1 align="center">Lessons from arcade-polymesh</h1>

<p align="center">
  <i>Why arcade-image-bayermatrix uses a register-based design instead of a class/OOP-based one.</i>
</p>

---

## Background: arcade-polymesh

Before this extension, Quarequin (then posting as **Phatiski**) maintained [arcade-polymesh](https://forum.makecode.com/t/arcadepolymesh-cradit-brohann-brohann3d/38201) — a remix of a MakeCode Arcade 3D engine originally forked from **Brohann3d**'s work. Polymesh introduced a `class`-based mesh system to manage points, grids, and faces, which made the API feel familiar to anyone used to OOP-style 3D engines.

<details>
<summary><b>What went wrong</b> (click to expand)</summary>
<br>

The class-based mesh abstraction grew hard to reason about as more AI-assisted contributions were layered onto it. Each new class, inheritance layer, and dynamically-constructed mesh object added surface area that a human reviewer had to trace through by hand. Eventually the extension was archived under the header **"End Of Extension"**, documented explicitly as a case study: AI-heavy, OOP-heavy extension code becomes **unmanageable, unoptimizable, and effectively unreviewable by a human maintainer**.

The failure wasn't that AI was used — it was that AI was used to generate *control flow and structure*, the part that's hardest for a human to audit and easiest for a repo to quietly rot around.

</details>

## The takeaway

> Use AI for **data**, not for **structure**.

For arcade-image-bayermatrix, the Bayer matrix constants were sourced from LLM (Gemini) <del>like ai-generated constant</del> — a lookup table has exactly one correct answer for a given matrix size, so there's nothing to "review" beyond checking the numbers. Every part of the extension that decides *how a sprite gets drawn* — buffer layout, threshold comparisons, draw-order — was written and optimized by hand.

But polymesh's failure wasn't only about *where* the AI code came from — it was about the **shape** the code took once it existed: classes, instances, inheritance. So the second decision follows from the first: don't just keep structure human-written, keep the structure itself simple enough that a human *can* review it in one pass.

## Why register-based instead of class-based

MakeCode Arcade extensions run in an environment with no OOP layer at the interpreter level, so a class-based mesh (like polymesh's) is already fighting the runtime it sits on top of. `register-based` design takes the opposite approach:

<table>
<tr><th>Class-based (polymesh)</th><th>register-based (bayermatrix)</th></tr>
<tr>
<td>

- Objects/instances created to hold per-sprite or per-mesh state
- State scattered across instance fields, inheritance chains
- New allocations possible every frame or every mesh operation
- Reviewing a change means tracing class hierarchy and method overrides

</td>
<td>

- A fixed set of variables ("registers") declared **once**, at init
- All draw calls read/write the same flat register set — no new objects
- Zero allocation inside the render loop
- Reviewing a change means checking register reads/writes in a flat, linear flow

</td>
</tr>
</table>

This is the same idea as reserving registers/stack slots at the start of an assembly routine instead of allocating memory dynamically mid-execution: declare what you need up front, reuse it for the life of the program.

### What this buys the project

1. **Stable FPS** — no per-frame allocation means no GC-driven frame drops, which matters most on Arcade's constrained hardware (SAMD51/STM32-class boards).
2. **No dynamic code generation** — every code path is static, so there's nothing an interpreter has to construct or JIT on the fly.
3. **A narrow, auditable surface** — a reviewer only needs to check a flat set of register variables and how they're mutated, not an inheritance tree. This directly avoids the "unmanageable, unoptimizable" outcome that ended arcade-polymesh.

## Summary

| | arcade-polymesh | arcade-image-bayermatrix |
|---|---|---|
| AI's role | Generated structure and logic | Supplied one reference data table (Bayer constants) only |
| State model | Class instances, inheritance | Flat registers, declared once at init |
| Runtime cost | New allocations per mesh op | Zero allocation in the render loop |
| Reviewability | Degraded over time → archived | Kept intentionally narrow from the start |
| Outcome | Archived as a cautionary case study | Built *because of* that case study |
