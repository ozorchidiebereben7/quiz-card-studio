# Character & Style Consistency Reference

The tell of amateur AI video is a character whose face, outfit, and vibe drift
shot to shot. Professionals separate **identity** from **motion**: lock identity
once, then reuse it everywhere. This is the Soul ID / Character Anchor approach.

## The core rule

**Generate one canonical still per recurring subject, then use that exact image
as the image-to-video seed for every shot.** Identity, lighting, and palette
carry through because the video model is animating a fixed frame, not inventing a
new person each time.

## Character Anchor Block workflow

1. **Write a Character Anchor Block** — a fixed paragraph describing the character
   in unchanging detail: age, build, face, hair, wardrobe, distinguishing marks,
   and default lighting. Reuse this text verbatim in every prompt. Example:

   > *Anchor — "Mara":* mid-30s woman, lean athletic build, sharp jawline, dark
   > close-cropped hair, faint scar over left brow, olive-green tactical jacket,
   > matte silver ring, cool neutral key light. Anamorphic 40mm, shallow DoF.

2. **Mint the canonical still.** Use a character-strong image model (Soul / Soul
   ID, or Nano Banana Pro) to generate a clean, well-lit front-and-3⁄4 still of
   the character from the Anchor Block. If the platform supports registering a
   character (`create_character` in the MCP), register it so it can be recalled
   by reference. Track the resulting character ID / still path in your asset
   ledger.

3. **Seed every shot from the anchor.** For each shot, pass the canonical still
   (or registered character) as the i2v reference, and keep the Anchor Block text
   in the prompt. Only the camera move and action beat change per shot.

4. **Two-tool refinement.** If a shot drifts, refine rather than re-roll from
   scratch: regenerate the *still* from the anchor to fix identity, then
   re-animate. Kling 3.0 holds identity best on animation; Seedance 2.0 holds it
   across a multi-scene sequence.

## Multi-character scenes

- Keep a separate Anchor Block and canonical still per character.
- When two anchored characters share a frame, describe their spatial relationship
  and eyelines explicitly ("Mara stands camera-left facing right; Dev sits
  camera-right, looking up at her").
- Seedance 2.0's reference mode is strongest for holding several characters
  consistent across scenes.

## Style consistency (the film's "look")

Identity isn't only faces — the whole film needs one look. Lock a **Style Bible**
and repeat it in every prompt's **L** layer:

- **Palette:** e.g. teal-and-orange, or desaturated cold.
- **Lens language:** e.g. anamorphic, consistent focal lengths per shot size.
- **Light:** key direction and quality that recurs.
- **Grain/finish:** e.g. 35mm grain + halation on every shot.
- **Era/world:** time period, tech level, location logic.

Applying the same Style Bible text across shots is what makes disparate
generations feel like one film. Keep it in your asset ledger next to the
character anchors.

## Continuity checklist (run before accepting a take)

- Same face, hair, wardrobe, and props as the anchor?
- Lighting direction consistent with adjacent shots?
- Palette and grain match the Style Bible?
- Eyelines and screen direction continuous with the previous shot?
- Scale/lens appropriate to the shot size in the list?

A failed check means refine from the anchor — never let drift into the final cut.
