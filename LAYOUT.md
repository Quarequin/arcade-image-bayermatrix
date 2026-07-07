<h1 align="center">LAYOUT.md</h1>

<p align="center">
  <i>Engineering principles behind the registerBased design of arcade-image-bayermatrix.</i>
</p>

<p align="center">
  See also: <a href="LESSONS/FROM/ARCADE/POLYMESH.md">LESSONS/FROM/ARCADE/POLYMESH.md</a> for why this approach was chosen over class-based design.
</p>

---

## Overview

This extension treats performance as a layered problem — each layer below builds on the one above it. The guiding rule throughout: **name a register once, reuse it forever; never let the runtime guess what you meant.**

```
1. Allocation           -> registers declared once at init
2. Call stack depth     -> max 2 nested function calls
3. Branch dispatch      -> switch-case with clamped/mod-narrowed ranges or true/false check
4. Type representation  -> explicit integer typing
5. Expression stack     -> one operation per statement
6. Memory footprint     -> variable recycling for short-lived roles
7. Correctness          -> reentrancy guard for shared state
```

---

## 1. Allocation — registers declared once

All working variables (including the two axis index variables, `ibx` and `iby`) are declared a single time at init, then read/written in place for the lifetime of the program. No `new`, no per-frame object creation.

**Why it matters:** every allocation is a potential garbage-collection pause later. On Arcade's microcontroller-class hardware, a GC pass is expensive and visible as a frame stutter. Zero allocation in the render loop means zero GC pressure from this extension.

## 2. Call stack depth — max 2 nested calls

Function calls are kept to at most two levels deep (a function calling a function, not a function calling a function calling a function).

**Why it matters:** every nested call means the interpreter has to push a new stack frame and keep the outer one alive. Capping depth at 2 keeps the call stack shallow and predictable — cheap to push/pop, and easy for a human reviewer to trace in one pass.

## 3. Branch dispatch — switch-case on narrowed ranges

`if/else` chains are replaced with `switch/case` **specifically for conditions whose range has already been narrowed** (via `clamp()` or `mod 2^n`) and for true/false comparisons unrelated to loop breaking.

**Why it matters:** an `if/else` chain costs O(n) in the worst case — the interpreter checks conditions one at a time until one matches. A `switch/case` over a narrow, known range can compile down to a **jump table**: an O(1) direct jump to the right branch. Loop-breaking conditions are deliberately left as plain `if` statements, since they're single boolean checks with no branch fan-out for a jump table to help with.

## 4. Type representation — explicit integers

Numeric registers are explicitly typed as integers rather than left to infer a generic/float representation.

**Why it matters:** an explicitly-typed integer is more likely to be kept as a fast "smallint" internally, rather than boxed or tagged as a generic number that needs runtime type-checking on every operation.

## 5. Expression stack — one operation per statement

Complex expressions (e.g. `a*b + c*d`) are split into individual statements, each writing its intermediate result into a named register, instead of being evaluated as one compound expression.

**Why it matters:** a stack-based VM evaluating a compound expression has to push multiple intermediate operands onto an anonymous operand stack before combining them — the more complex the expression, the deeper that stack gets. Splitting the computation moves that burden from the anonymous operand stack onto named, controlled registers, which is both cheaper and easier to reason about.

## 6. Memory footprint — variable recycling

Variables with a minor role, or that are only read/written briefly before going unused, are recycled and reused rather than left declared as dead weight.

**Why it matters:** fewer total registers means a smaller memory footprint for the whole register set — directly relevant on hardware with limited RAM.

## 7. Correctness — reentrancy guard

`bayer_drawcore_inuse` is a manual reentrancy guard (a lightweight mutex) around the `bayer_drawcore` function. If the function is already in use, callers are forced to return early instead of proceeding; once the function finishes and is free, the flag clears and another state can use it.

**Why it matters:** a class-based design gets per-instance state isolation for free, so concurrent calls don't collide. A shared register set doesn't have that safety net — if two states called `bayer_drawcore` at the same time, they'd overwrite each other's in-progress values. The alternative fix (duplicating the register set per state) would undo the whole point of registerBased design. A single boolean check is the cheapest way to keep correctness without paying that cost.

---

## Summary

| Layer | Problem it solves | Cost avoided |
|---|---|---|
| Register declaration | Per-frame allocation | GC pauses |
| Call depth ≤ 2 | Deep call stacks | Stack frame overhead |
| Switch-case (narrowed) | Linear condition checking | O(n) branch evaluation |
| Explicit integer typing | Ambiguous numeric representation | Runtime type coercion |
| Per-statement expressions | Deep operand stacks | Anonymous stack pressure |
| Variable recycling | Redundant registers | Memory footprint |
| Reentrancy guard | Shared-state collisions | Duplicated register sets |

This is systematic, not incidental — each layer is a deliberate, named target, applied in the order that made sense as the extension grew. It's the same discipline demoscene and embedded game developers apply at the assembly level (register allocation, stack pressure, jump tables), carried over into a MakeCode Arcade extension that also has to stay reviewable by a human — the lesson carried forward from [arcade-polymesh](LESSONS/FROM/ARCADE/POLYMESH.md).
