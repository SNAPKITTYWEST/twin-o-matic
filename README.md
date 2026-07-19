# Twin-O-Matic

**JIT Browser LLM + Live 3D Engine — No Server, No API Keys, No Install**

[![License](https://img.shields.io/badge/License-Sovereign%20Source-blue.svg)](LICENSE)
[![Pages](https://img.shields.io/badge/Live-GitHub%20Pages-brightgreen.svg)](https://snapkittywest.github.io/twin-o-matic/)

---

## What Is This

Twin-O-Matic is a browser-based AI agent with tool use. It runs **Llama 3.2 1B** entirely in your GPU via WebLLM/WebGPU and gives the model tools to create **live animated 3D scenes** in real-time.

Open the page. Model loads into VRAM. Type "create a solar system" and watch it appear.

**No server. No API keys. No npm. No install. Just a URL.**

**Live:** https://snapkittywest.github.io/twin-o-matic/

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                   │
├─────────────────────┬───────────────────────────────────────────┤
│   THREE.JS VIEWPORT │   LLM TERMINAL                            │
│                     │                                           │
│   ┌─────────────┐  │   ┌─────────────────────────────────────┐ │
│   │  WebGL 3D   │  │   │  WebLLM (MLC)                       │ │
│   │  Renderer   │  │   │  Llama 3.2 1B q4f16                 │ │
│   │  + Orbit    │  │   │  WebGPU compute shaders             │ │
│   │  Controls   │  │   │                                     │ │
│   └──────┬──────┘  │   └──────────────┬──────────────────────┘ │
│          │         │                  │                         │
│          ▼         │                  ▼                         │
│   Scene Engine     │          Tool Parser                       │
│   (primitives,     │          (TOOL: lines → 3D objects)        │
│    particles,      │                  │                         │
│    lights,         │                  ▼                         │
│    animation)      │          Template Fallback                  │
│                    │          (scene detection if model           │
│                    │           doesn't output tools)              │
└─────────────────────┴───────────────────────────────────────────┘
```

---

## Features

### Browser LLM (WebGPU)
- **Llama 3.2 1B Instruct** quantized to q4f16 — runs entirely client-side
- Model weights download once, cached by browser (~700MB)
- Streaming inference with live tok/s counter
- ~25-120 tok/s depending on GPU
- Zero external API calls — all computation is local

### 3D Tool Use
The LLM has tools to create and manipulate a live Three.js scene:

| Tool | Description |
|------|-------------|
| `add_box` | Rectangular prism with position, size, color |
| `add_sphere` | Sphere with radius, position, color |
| `add_cylinder` | Cylinder with radius, height, position, color |
| `add_torus` | Torus (ring) with radius, tube thickness, color |
| `add_cone` | Cone with radius, height, position, color |
| `add_particles` | Particle system (count, spread, color) |
| `add_light` | Dynamic point light with position, color, intensity |
| `set_background` | Change scene background color |
| `reset_scene` | Clear all objects |

### Scene Templates
When the model doesn't output tools (1B models are unreliable at structured output), the engine detects scene intent and fires templates:

| Keyword | Scene |
|---------|-------|
| solar, planet, sun | Solar system with planets, rings, star field |
| city, skyline, tower, building | Neon city with varying height towers |
| forest, tree, wood, jungle | Trees (cylinder trunks + cone canopies), berries, fireflies |
| ocean, sea, water, fish | Ocean plane, fish, sailboat, jellyfish |
| space, galaxy, nebula, star | Deep space with nebula particles, planets, rings |
| abstract, art, geometric, shape | Nested tori, cones, cylinders, particle clouds |

Any prompt containing "create", "build", "make", "show", "generate", or "draw" also triggers a template if no tools are output.

### 3D Viewport Controls
- **Orbit** — click and drag to rotate camera
- **Zoom** — scroll wheel
- **Pan** — right-click drag
- **Reset Scene** — clear all objects
- **Toggle Spin** — stop/start object animation
- **Wireframe** — toggle wireframe rendering
- **Explode** — fling all objects outward
- **Screenshot** — save current frame as PNG

### Animation
All objects float and spin automatically:
- Y-axis rotation at varying speeds
- Sinusoidal hover (bob up and down)
- Each object offset in phase for organic movement

---

## How It Works

1. Page loads → WebGPU adapter detected → model weights stream into GPU
2. User types prompt → sent to Llama 3.2 1B with tool-use system prompt
3. Model outputs `TOOL:` lines → parsed and executed against Three.js scene
4. If model outputs only text → scene detection fires template as fallback
5. Objects appear in viewport with animation

The system prompt includes few-shot examples so the model knows the exact format. The template fallback ensures visuals always appear for scene-creation requests regardless of model output quality.

---

## Requirements

- **Chrome 113+** or **Edge 113+** (WebGPU required)
- **GPU with 2GB+ VRAM** (model is ~700MB quantized)
- That's it. No Node.js. No Python. No server.

---

## Run Locally (Optional)

If you want to serve it locally instead of GitHub Pages:

```bash
git clone https://github.com/SNAPKITTYWEST/twin-o-matic.git
cd twin-o-matic
node server.js
# Open http://localhost:8080
```

The server is only needed for local development. GitHub Pages serves it statically.

---

## TOM: The Recursive Self-Improvement Engine

The Python backend (`tom.py`) is a separate system — a recursive self-improvement loop that uses Ollama for local inference:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  OUTER LOOP  │────▶│  INNER LOOP  │────▶│  WORM CHAIN  │
│  (analyzes   │     │  (executes   │     │  (seals each │
│   failures)  │◀────│   tasks)     │     │   generation)│
└──────────────┘     └──────────────┘     └──────────────┘
```

- **Inner Loop** executes tasks with a tunable prompt + hyperparams
- **Outer Loop** analyzes telemetry, classifies failures (A/B/C/D), patches the inner prompt
- **WORM Chain** seals every generation with SHA-256 (append-only, immutable)
- **Assert Gate** validates outer loop patches before promotion (JSON schema, temperature bounds, failure class)

```bash
# Requires Ollama running locally
python tom.py --task "write a Python bubble sort" --generations 5
python tom.py --task "prove x^2 >= 0 in Lean 4" --generations 10
```

---

## Project Structure

```
twin-o-matic/
├── index.html                    # Root redirect → frontend
├── frontend/
│   ├── index.html                # Main app (LLM + 3D + tools)
│   └── src/
│       └── engine.mjs            # Goldilocks field, SHA-256, WORM chain, Lean verifier
├── tom.py                        # TOM recursive loop (Python + Ollama)
├── prompts/
│   ├── inner_loop.txt            # Inner loop system prompt
│   └── outer_loop.txt            # Outer loop analysis prompt
├── schemas/
│   ├── outer_output_schema.json  # Outer loop output validation schema
│   └── hyperparams_schema.json   # Hyperparameter bounds
├── server.js                     # Optional local server (WebSocket mesh)
├── .github/workflows/
│   └── deploy.yml                # GitHub Pages auto-deploy
├── LICENSE                       # Sovereign Source License
└── README.md                     # This file
```

---

## Engine Module (engine.mjs)

The frontend includes a pure-JS compute engine with no dependencies:

### Goldilocks Field Arithmetic
All operations mod `p = 2^64 - 2^32 + 1` (the Goldilocks prime used in Plonky2/Miden ZK systems):
- `gfAdd(a, b)` — addition mod p
- `gfSub(a, b)` — subtraction mod p
- `gfMul(a, b)` — multiplication mod p
- `gfPow(a, exp)` — exponentiation via square-and-multiply
- `gfInv(a)` — inverse via Fermat's little theorem (a^(p-2))

### SHA-256
Complete pure-JS implementation. No WebCrypto dependency. Used for WORM sealing.

### WORM Chain
Append-only sealed ledger:
- `wormSeal(data)` — hash data + previous seal, append to chain
- `wormChain()` — return full chain
- `wormVerify()` — verify chain integrity

### Lean Buffer Verifier
Static analysis of Lean 4 buffers:
- Sorry count detection
- Theorem/lemma declaration detection
- Tactic usage analysis (intro, exact, simp, apply, rfl, cases, induction, constructor, rw)

---

## Sovereign Stack Integration

Twin-O-Matic connects to the broader SnapKitty sovereign compute constellation:

```
sov-kernel-monster      ← Fortran 2018 quantum density matrix evolution
foundry-intel           ← WASM proof lab + JIT verification
bob-orchestrator        ← Lean 4 + Ada + Mamba + Prolog reasoning
claudes-harness         ← Prolog identity kernel
errant                  ← Linear Forth ISA with QTT
sovereign-transformer   ← Datalog corpus gate
j-matrix-twin           ← SUBLEQ attention + J tacit engine
twin-o-matic            ← THIS — browser LLM + 3D tool use
```

---

## Examples

Try these prompts:

```
create a solar system
build a neon city at night
make a forest with glowing particles
show me deep space with a nebula
create abstract geometric art
build a tower made of rings
make something beautiful
```

Or just chat — the model answers questions normally when no scene is detected.

---

## Performance

| GPU | Model Load | Inference |
|-----|-----------|-----------|
| RTX 3080 | ~15s | 80-120 tok/s |
| RTX 3060 | ~20s | 50-80 tok/s |
| M1 Mac | ~25s | 40-60 tok/s |
| Intel Arc | ~30s | 30-50 tok/s |
| Integrated | May not work | — |

First load downloads ~700MB of model weights (cached after).

---

## License

```
SOVEREIGN SOURCE LICENSE — Apache 2.0

Copyright 2026 Jessica (SNAPKITTYWEST)
All IP belongs to Jessica (jessicalw34@gmail.com)

Licensed under the Apache License, Version 2.0
http://www.apache.org/licenses/LICENSE-2.0
```

---

Built with WebLLM + Three.js + WebGPU. No cloud. No telemetry. Sovereign inference.
