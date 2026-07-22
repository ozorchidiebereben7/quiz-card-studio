# Prompt Frameworks Reference

This is the craft core of the skill. Read it before writing any generation
prompt. The goal: give each engine an unambiguous, filmable instruction so it
never has to guess — which is what separates a clean cinematic shot from mush.

## MCSLA — the five-layer formula

Build every prompt from these layers, in this order, as flowing prose (not a
bulleted list the model has to parse):

1. **M — Model.** Decide the engine first (see `models.md`); it changes how you
   phrase everything else.
2. **C — Camera.** ONE named move + its qualities (speed, height, rig feel). See
   `camera-presets.md`.
3. **S — Subject.** Who/what, plus a clear physical action and eyeline. Give the
   subject something specific to *do*.
4. **L — Look.** Lens (focal length + type), lighting (direction + quality),
   palette, grain/texture, era, and aspect ratio.
5. **A — Action.** The motion beat that unfolds across the clip — one clean
   change, not five. Video clips are short; one beat reads, five smears.

### Worked example

> **Prompt:** A lone cowboy stands motionless in a wide desert at dusk, then
> slowly turns his head toward camera. Shot on an anamorphic 40mm prime, shallow
> depth of field, warm golden-hour side light raking from frame left, teal
> shadows, fine 35mm film grain and gentle halation, 16:9. The camera performs a
> slow dolly-in at eye level, locked-off. Over the shot, dust drifts across the
> foreground and he exhales. Tense, contemplative mood.

Every MCSLA layer is present: model chosen separately (Kling 3.0), camera (slow
dolly-in), subject (cowboy turning head), look (anamorphic 40mm, golden hour,
grain, 16:9), action (dust drifts, exhale).

## DISCIPLINE — nine rules that keep quality high

Think of these as the difference between someone who owns a camera and someone
who can shoot. Each has a *why* — follow the reasoning, not the letter.

**Prompt construction**
1. **One move per shot.** Multiple camera moves in one clip fight each other and
   smear. Pick the move that serves the beat; cut to a new shot for a new move.
2. **Photographic vocabulary, not vibes.** Say `anamorphic 85mm, T2.0, halation,
   film grain, practical neon` — the models learned from real photography and
   respond to real terms far better than "cinematic" or "epic."
3. **One clear action beat.** A short clip can show one change convincingly. Name
   it; don't stack "she runs, jumps, spins, and laughs."

**Model selection**
4. **Match engine to job.** Identity → Kling; continuity → Seedance; audio →
   Veo; optics → Cinema Studio. Fighting the wrong model wastes credits.
5. **Still first, motion second.** Nail the frame as an image, then animate. It's
   cheaper and gives the video model a strong anchor.
6. **Anchor recurring identity.** Reuse one canonical still as the i2v seed for
   every shot of a character/product (see `character-consistency.md`).

**Iteration discipline**
7. **Change one variable per re-roll.** If a shot's wrong, adjust the single
   thing that's off (light, or move, or lens) — not everything at once — so you
   learn what fixed it.
8. **Read the frame like a director.** Check composition, eyeline, negative
   space, and continuity against the previous shot before accepting a take.
9. **Budget your takes.** Decide up front how many re-rolls a shot is worth
   (hero shots more, filler less) and stop when it's good enough to cut.

## Photographic vocabulary bank

Pull from these instead of vague adjectives:

- **Lenses:** anamorphic prime, 24mm wide, 35mm, 50mm, 85mm portrait, macro,
  tilt-shift; T1.4–T2.8 for shallow DoF.
- **Light:** golden hour, blue hour, high-key, low-key, chiaroscuro, rim light,
  practical neon, motivated window light, soft directional, hard side light,
  volumetric god rays.
- **Texture/finish:** 16mm/35mm film grain, halation, bloom, chromatic
  aberration, gate weave, bokeh, lens flare, shot on film.
- **Palette:** teal-and-orange, desaturated, monochrome, pastel, high-contrast,
  warm tungsten, cold cyan.
- **Composition:** rule of thirds, centered symmetry, negative space, leading
  lines, foreground occlusion, deep focus, shallow focus.

## Image-vs-video prompting

- **Image prompt:** describe the *frozen frame* — composition, subject pose,
  light, lens, palette. No motion verbs.
- **Video (i2v) prompt:** describe *what changes* from that frame — the camera
  move (C) and the one action beat (A). Keep the subject/look consistent with the
  still so the model animates rather than reinvents.

## Model-specific prompt notes

- **Kling 3.0:** feed the canonical still; describe the move and one action.
  Storyboard mode holds identity across shots — describe each shot's beat.
- **Seedance 2.0:** think in modes — *reference* (seed from a still),
  *continuation* (extend a prior shot), *expand* (widen), *edit* (change one
  element). Great for multi-scene consistency.
- **Veo 3.1:** you can prompt dialogue and ambient sound; write the spoken line
  and the soundscape explicitly.
- **Cinema Studio:** think like a DP — set genre/style, then focal length,
  sensor, and up to ~3 stacked moves. Use for hero shots only.

When you write prompts for the user, present them per-shot, clearly labeled and
copy-paste ready, so they work whether generation runs via MCP or the user pastes
them into Higgsfield directly.
