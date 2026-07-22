---
name: higgsfield-ai-video
description: >-
  Produce cinematic, high-retention AI videos and faceless-channel content in
  the Higgsfield AI style — the same pipeline behind channels like @higgsfieldai.
  Use this whenever the user wants to make an AI short film, faceless YouTube
  video, cinematic AI clip, AI music video, UGC-style ad, trailer, or AI Short,
  or mentions Higgsfield, Cinema Studio, Seedance, Kling, Veo, Sora, Soul, Nano
  Banana, camera-motion presets (crash zoom, bullet time, robo arm, FPV, 360
  orbit), character consistency across shots, or turning a script/idea into a
  finished cinematic video. Also trigger when the user says "make it look like
  it was actually filmed," wants shot lists, image-to-video, or a repeatable
  video-production workflow — even if they don't name Higgsfield explicitly.
---

# Higgsfield AI Cinematic Video Production

This skill turns an idea into a finished cinematic video using the Higgsfield
platform (accessed through the Higgsfield MCP server) plus a disciplined
prompting and editing workflow. It is modeled on how high-output creators — the
@higgsfieldai channel and the faceless-channel operators Higgsfield showcases —
actually work: **generate a canonical still, animate it with a named camera
move, hold character identity across shots, then assemble with voice, music, and
captions.**

## Honest expectations (read once, then set them with the user)

The *visual quality* comes from Higgsfield's paid models (Kling 3.0, Veo 3.1,
Seedance 2.0, Soul, etc.), not from this skill. What this skill contributes is
the **methodology** that separates amateur AI clips from ones that look filmed:
model selection, the MCSLA prompt formula, camera-preset discipline, character
consistency, and a real edit. Matching a specific channel's look is achievable
in *style and craft*, but exact shots depend on seeds, credits, and iteration —
so plan for 2–4 takes per hero shot. Say this plainly to the user rather than
promising identical output.

## Prerequisites — check before generating

Higgsfield generation runs through its MCP server. Before any paid call:

1. Confirm the Higgsfield MCP tools are connected (look for tools like
   `generate_image`, `generate_video`, `create_character`,
   `get_generation_status`, `list_characters`). If they are missing, walk the
   user through setup — see `references/mcp-setup.md`.
2. Confirm the user has an active Higgsfield subscription/credits. These models
   cost money per generation; **never fire a paid generation without the user's
   go-ahead on the plan.** Surface an estimated shot count first.
3. If the MCP is not yet connected, you can still do everything up to
   generation: concept, script, shot list, and fully-written prompts. Deliver
   those and let the user run them, or wait for the connection.

## The production pipeline

Work through these stages in order. Each links to a reference file — read it
when you reach that stage rather than loading everything at once.

1. **Brief → Concept.** Nail the premise, audience, platform (YouTube long /
   Shorts / TikTok / Reels), aspect ratio, duration, and tone. A vertical
   60-second Short and a 16:9 three-minute mini-film are built differently.

2. **Script & narration.** Write a tight, hook-first script. For faceless
   channels, the first 3 seconds decide retention. See
   `references/pipeline.md` (Script section) for the hook formulas and pacing.

3. **Shot list.** Break the script into shots. Each shot gets a subject, a
   setting, ONE camera move, a lighting/mood note, and a duration. Use
   `assets/shot-list-template.md`. This is where a film is won or lost — a good
   shot list makes every later prompt trivial.

4. **Style bible & character anchors.** Lock the look (palette, lens, grain,
   era) and generate one canonical still per recurring character/location so
   identity holds across shots. See `references/character-consistency.md`.

5. **Image generation (the seed frames).** Generate the first frame of each
   shot as a still, using an image model. Getting a strong still is cheaper and
   faster to iterate than re-rolling video. See `references/models.md` for which
   image model to pick.

6. **Image-to-video.** Animate each still with the right video model and a named
   camera preset. This is Higgsfield's core strength. See
   `references/camera-presets.md` and `references/models.md`.

7. **Audio.** Voiceover (custom voice preset for a consistent channel voice),
   music bed, and SFX. See `references/pipeline.md` (Audio section).

8. **Assembly & finish.** Edit shots to the voiceover, add captions, color, and
   a grain/finish pass. Then cut Shorts from the long video.

9. **Packaging.** Titles + thumbnails designed for click-through. See
   `references/pipeline.md` (Packaging section).

You do not always run all nine. A single hero clip is stages 4–6. A full
faceless episode is all nine.

## The one prompt formula to internalize: MCSLA

Every Higgsfield generation prompt is built from five layers. Naming each layer
explicitly stops the model from guessing and is the single biggest lever on
quality.

| Layer | Controls | Example |
|-------|----------|---------|
| **M** — Model | Which engine | `Kling 3.0` (i2v, best identity hold) |
| **C** — Camera | The one move | `Slow dolly-in, eye level` |
| **S** — Subject | Who/what + action | `A lone cowboy, standing still then turning his head to camera` |
| **L** — Look | Lens, light, palette, grain, ratio | `Anamorphic 40mm, golden-hour side light, warm teal shadows, 35mm grain, 16:9` |
| **A** — Action | Motion beat over the clip | `He exhales; dust drifts across frame` |

Write prompts as prose that covers all five, in that order. Full guidance,
including the DISCIPLINE rules (one move per shot, photographic vocabulary,
negative space, etc.), is in `references/prompt-frameworks.md`. **Read that file
before writing any generation prompt** — it is the core craft of the skill.

## Model selection at a glance

Full detail and current roster in `references/models.md`. Quick defaults:

- **Character stills / identity:** Soul (Soul ID) or Nano Banana Pro.
- **General / photoreal stills:** GPT Image 2 or Nano Banana Pro.
- **Stylized / illustrative stills:** Flux 2.
- **Image-to-video with tight identity hold:** Kling 3.0.
- **Multi-shot narrative continuity:** Seedance 2.0.
- **Native audio / dialogue-driven shots:** Veo 3.1.
- **Maximum camera-move control / optics:** Cinema Studio.

Model availability changes; at runtime, call `list`-style MCP tools or check the
platform rather than trusting a hardcoded list. If a named model is gone, pick
the closest match by capability from `references/models.md`.

## Camera presets are the signature

Higgsfield's look comes from *named* camera moves (Crash Zoom, Bullet Time, Robo
Arm, FPV Drone, 360 Orbit, Dolly Zoom, Snorricam, and 50+ more). The discipline:
**one deliberate move per shot, matched to the emotional beat.** A contemplative
line gets a slow dolly-in; a reveal gets a crash zoom; energy gets FPV. The full
catalog with when-to-use notes is in `references/camera-presets.md`.

## Working style

- **Plan before you spend.** Present the concept, shot list, and per-shot prompts
  for approval *before* firing paid generations. Show an estimated shot/credit
  count.
- **Stills before motion.** Iterate the frame as an image first; only animate a
  still you're happy with.
- **Poll, don't block.** Video generation takes minutes. Use
  `get_generation_status` to check; batch shots so you're not idling.
- **Keep an asset ledger.** Track which still seeds which shot and which
  character anchor is canonical, so the film stays consistent and reproducible.
- **Deliver something even without the MCP.** A complete script + shot list +
  copy-paste-ready prompts is a real deliverable on its own.

When the user gives you their video brief, start at stage 1, confirm the plan,
then move through the pipeline — reading the relevant reference file at each
stage.
