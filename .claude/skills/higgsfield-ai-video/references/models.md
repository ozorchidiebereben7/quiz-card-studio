# Model Selection Reference

Higgsfield is a single front-end over many image and video engines. Picking the
right engine per shot matters more than any prompt trick. Availability shifts
over time — treat this as decision logic, and confirm the live roster at runtime
(the platform UI or MCP listing) rather than assuming a model still exists.

## How to choose (decision logic first)

Ask three questions per shot:

1. **Still or motion?** Always generate a still first (cheaper to iterate), then
   animate it. So most shots use *both* an image model and a video model.
2. **Does identity have to hold?** If a character or product recurs, lock it with
   a character model / anchor still (see `character-consistency.md`) and animate
   with the model that best preserves a reference image.
3. **Is there dialogue or diegetic sound?** If lips must move to speech or the
   shot needs native audio, prefer the model with native audio.

## Image models (generate the seed frame)

| Model | Best for | Notes |
|-------|----------|-------|
| **Nano Banana Pro** | General photoreal + fast iteration | Strong all-rounder for stills; good prompt adherence and editing. |
| **GPT Image 2** | Photoreal, complex scenes, text in image | Great when the frame needs legible text or busy composition. |
| **Soul / Soul ID** | Character faces & consistency | Use to mint the canonical character still that seeds every shot. |
| **Flux 2** | Stylized, illustrative, graphic looks | Reach for this when the film is stylized rather than photoreal. |

## Video models (animate the still → shot)

| Model | Best for | Notes |
|-------|----------|-------|
| **Kling 3.0** | Image-to-video with the tightest identity/lighting hold; Multi-Shot Storyboard | Default for character shots. Feed it the canonical still as the i2v seed. |
| **Seedance 2.0** | Multi-scene narrative continuity across shots | Best when characters must stay consistent across many scenes; supports reference, continuation, expand, and edit modes. |
| **Veo 3.1** | Native audio / dialogue-driven shots, high physical realism | Use when lips must sync to speech or you want the model to generate sound. |
| **Cinema Studio** | Maximum optical control — focal length, sensor, stacked camera moves | Use for hero shots that need real lens behavior or up to ~3 stacked moves. |
| **Hailuo / others** | Situational alternates | Fallbacks when a primary is unavailable or a look calls for it. |

> Note on Sora: Higgsfield historically surfaced Sora 2. Sora's availability has
> changed over time; if it's not in the live roster, substitute Veo 3.1 (for
> audio/realism) or Kling 3.0 (for i2v control).

## Default recipes

- **Character-driven short film:** Soul/Nano Banana Pro still → Kling 3.0 i2v,
  with Seedance 2.0 for any multi-scene continuity stretch.
- **Dialogue scene:** any still → Veo 3.1 (native audio, lip movement).
- **Product / UGC ad:** Nano Banana Pro or GPT Image 2 still → Kling 3.0, with a
  crash-zoom or robo-arm hero shot in Cinema Studio.
- **Stylized music video:** Flux 2 stills → Kling 3.0 / Seedance 2.0, leaning on
  bold named camera moves.

## Cost discipline

Every generation costs credits. Iterate on the *still* (cheaper) until it's
right, then spend on the video. Batch video jobs and poll
`get_generation_status`. Always show the user an estimated shot count and get a
go-ahead before firing paid generations.
