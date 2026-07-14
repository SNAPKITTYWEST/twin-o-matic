#!/usr/bin/env python3
"""
TOM — Twin-O-Matic: Recursive Self-Improvement Loop
Outer Loop rewrites Inner Loop's prompt/hyperparams based on telemetry.
Inner Loop executes tasks under gate constraints.
WORM chain seals every generation.

Usage:
    python tom.py --task "write a Python bubble sort" --generations 5
    python tom.py --task "prove x^2 >= 0 in Lean 4" --generations 10
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

BASE = Path(__file__).parent
STATE = BASE / "state"
WORM = BASE / "worm"

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OUTER_MODEL = os.environ.get("TOM_OUTER_MODEL", "nemotron")
INNER_MODEL = os.environ.get("TOM_INNER_MODEL", "nemotron")


def ensure_dirs():
    for d in [STATE, WORM]:
        d.mkdir(exist_ok=True)
    if not (STATE / "hyperparams.json").exists():
        (STATE / "hyperparams.json").write_text(json.dumps({
            "temperature": 0.7, "top_p": 0.9, "logit_bias": {}, "max_tokens": 2048
        }, indent=2))
    if not (STATE / "telemetry.jsonl").exists():
        (STATE / "telemetry.jsonl").write_text("")
    if not (STATE / "lesson_register.json").exists():
        (STATE / "lesson_register.json").write_text(json.dumps({"lessons": [], "generation": 0}))


def load_state():
    inner_prompt = (BASE / "prompts" / "inner_loop.txt").read_text()
    if (STATE / "inner_prompt.txt").exists():
        inner_prompt = (STATE / "inner_prompt.txt").read_text()
    hyperparams = json.loads((STATE / "hyperparams.json").read_text())
    telemetry_lines = (STATE / "telemetry.jsonl").read_text().strip().splitlines()
    telemetry = [json.loads(l) for l in telemetry_lines[-20:] if l.strip()]
    lessons = json.loads((STATE / "lesson_register.json").read_text())
    return inner_prompt, hyperparams, telemetry, lessons


def call_ollama(model, system_prompt, user_prompt, temperature=0.7, top_p=0.9):
    import urllib.request
    payload = {
        "model": model,
        "system": system_prompt,
        "prompt": user_prompt,
        "stream": False,
        "options": {"temperature": temperature, "top_p": top_p}
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())
        return result.get("response", "")


def run_inner(task, inner_prompt, hyperparams, generation):
    print(f"  [inner] running generation {generation}...")
    response = call_ollama(
        INNER_MODEL,
        inner_prompt,
        task,
        temperature=hyperparams.get("temperature", 0.7),
        top_p=hyperparams.get("top_p", 0.9),
    )
    success = "FAIL:" not in response
    lesson = ""
    for line in response.splitlines():
        if line.startswith("LESSON:"):
            lesson = line[7:].strip()
    entry = {
        "generation": generation,
        "task": task[:100],
        "success": success,
        "tokens": len(response.split()),
        "lesson": lesson,
        "ts": int(time.time()),
    }
    with open(STATE / "telemetry.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")
    return response, entry


def assert_gate(patch_text):
    """Basic syntactic checks before promoting a patch."""
    try:
        data = json.loads(patch_text)
        required = {"generation", "failure_class", "analysis", "inner_prompt_patch", "hyperparams", "worm_note"}
        if not required.issubset(data.keys()):
            return False, f"missing keys: {required - data.keys()}"
        fc = data.get("failure_class", "")
        if fc not in ("A", "B", "C", "D", "PASS"):
            return False, f"invalid failure_class: {fc}"
        hp = data.get("hyperparams", {})
        t = hp.get("temperature", -1)
        if not (0.0 <= t <= 2.0):
            return False, f"temperature out of range: {t}"
        return True, data
    except json.JSONDecodeError as e:
        return False, f"json parse error: {e}"


def run_outer(task, inner_prompt, hyperparams, telemetry, lessons, generation):
    outer_system = (BASE / "prompts" / "outer_loop.txt").read_text()
    schema = json.loads((BASE / "schemas" / "outer_output_schema.json").read_text())

    user_msg = json.dumps({
        "task": task,
        "generation": generation,
        "current_inner_prompt": inner_prompt[:500],
        "current_hyperparams": hyperparams,
        "recent_telemetry": telemetry[-5:],
        "lessons": lessons.get("lessons", [])[-10:],
        "instruction": "Analyze failures. Output JSON matching the schema exactly.",
        "schema": schema,
    }, indent=2)

    print(f"  [outer] analyzing generation {generation}...")
    raw = call_ollama(OUTER_MODEL, outer_system, user_msg, temperature=0.3, top_p=0.9)

    # extract JSON from response
    json_start = raw.find("{")
    json_end = raw.rfind("}") + 1
    if json_start == -1:
        return None, f"no JSON in outer response"
    patch_text = raw[json_start:json_end]

    ok, result = assert_gate(patch_text)
    if not ok:
        return None, f"assert gate failed: {result}"
    return result, None


def apply_patch(patch):
    """Promote outer loop output to state."""
    new_prompt = patch.get("inner_prompt_patch", "").strip()
    if new_prompt and len(new_prompt) > 20:
        (STATE / "inner_prompt.txt").write_text(new_prompt)

    new_hp = patch.get("hyperparams", {})
    if new_hp:
        (STATE / "hyperparams.json").write_text(json.dumps(new_hp, indent=2))

    lessons = json.loads((STATE / "lesson_register.json").read_text())
    note = patch.get("worm_note", "")
    if note:
        lessons["lessons"].append({"gen": patch["generation"], "note": note})
        lessons["lessons"] = lessons["lessons"][-50:]  # keep last 50
    lessons["generation"] = patch["generation"]
    (STATE / "lesson_register.json").write_text(json.dumps(lessons, indent=2))


def worm_seal(generation, patch, inner_output):
    """Append immutable generation record to WORM chain."""
    record = {
        "generation": generation,
        "worm_note": patch.get("worm_note", "") if patch else "inner_only",
        "failure_class": patch.get("failure_class", "?") if patch else "?",
        "inner_tokens": len(inner_output.split()),
        "ts": int(time.time()),
    }
    content = json.dumps(record, sort_keys=True)
    seal = hashlib.sha256(content.encode()).hexdigest()
    record["seal"] = seal
    with open(WORM / "chain.jsonl", "a") as f:
        f.write(json.dumps(record) + "\n")
    print(f"  [worm] gen {generation} sealed: {seal[:16]}…")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", required=True, help="Task for inner loop")
    parser.add_argument("--generations", type=int, default=5)
    parser.add_argument("--inner-only", action="store_true", help="Skip outer loop (debug)")
    args = parser.parse_args()

    ensure_dirs()

    print(f"\nTOM — Twin-O-Matic")
    print(f"Task: {args.task}")
    print(f"Generations: {args.generations}")
    print(f"Outer: {OUTER_MODEL} | Inner: {INNER_MODEL}\n")

    for gen in range(1, args.generations + 1):
        print(f"Generation {gen}/{args.generations}")
        inner_prompt, hyperparams, telemetry, lessons = load_state()

        inner_output, telem = run_inner(args.task, inner_prompt, hyperparams, gen)
        print(f"  [inner] success={telem['success']} tokens={telem['tokens']}")
        if telem.get("lesson"):
            print(f"  [inner] lesson: {telem['lesson']}")

        patch = None
        if not args.inner_only and gen < args.generations:
            patch, err = run_outer(args.task, inner_prompt, hyperparams, telemetry, lessons, gen)
            if err:
                print(f"  [outer] error: {err} — skipping patch")
            else:
                print(f"  [outer] failure_class={patch['failure_class']}")
                apply_patch(patch)

        worm_seal(gen, patch, inner_output)

        if telem["success"] and gen > 1:
            print(f"  [tom] success streak — continuing\n")
        print()

    print("TOM complete. WORM chain sealed.")
    chain = list(open(WORM / "chain.jsonl"))
    print(f"Generations sealed: {len(chain)}")


if __name__ == "__main__":
    main()
