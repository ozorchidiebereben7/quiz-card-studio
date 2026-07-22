# Full Production Pipeline Reference

This covers the stages around generation: script, audio, assembly, Shorts, and
packaging — the parts that turn raw clips into a channel-quality video. This is
how faceless-channel operators run a repeatable, high-output workflow.

## Concept

Before writing, lock:

- **Premise** in one sentence (the "what if" or the promise to the viewer).
- **Audience & platform:** YouTube long-form (16:9), Shorts/TikTok/Reels (9:16),
  or both (shoot 16:9, cut verticals later — or frame safe for both).
- **Duration & pacing target:** Shorts 20–60s; long-form 3–10 min.
- **Tone/genre:** thriller, awe/documentary, comedy, luxury, horror, etc. This
  drives model, palette, and camera choices downstream.

## Script & narration

Retention is won in the **first 3 seconds**. Structure:

1. **Hook (0–3s):** a bold claim, a question, a striking image, or a pattern
   interrupt. No slow logo intros.
2. **Setup (3–15s):** the stakes — why keep watching.
3. **Body:** deliver in tight beats; every sentence earns the next. Use open
   loops ("but that's not the strange part…") to pull viewers forward.
4. **Payoff / CTA:** resolve the loop; end on a line that invites the next video
   or a follow.

Writing notes:
- Write for the ear — short sentences, active voice, concrete nouns.
- One idea per shot; the script and shot list should map roughly 1:1 in beats.
- For faceless channels, keep a consistent narrator persona across episodes.

## Voice / narration audio

- **Custom voice preset:** create one consistent channel voice (in Higgsfield's
  Audio → Voice Presets, record/upload a sample) so every episode sounds like the
  same host. Consistency builds a brand.
- Alternatively use a chosen TTS voice — but keep it identical across episodes.
- Generate the voiceover early: the VO timing is what you edit picture against.

## Music & SFX

- **Music bed:** pick one track whose energy matches the genre; duck it under
  narration (music sits ~ -18 to -12 dB below voice).
- **SFX:** whooshes on whip-pan/crash-zoom transitions, impacts on reveals, room
  tone for realism. SFX sell the camera moves.
- Hit key beats (hook, reveals, payoff) with music swells or drops.

## Assembly & finish

1. **Cut picture to the VO.** Lay the narration, then place each shot to its
   beat. Trim generously — AI clips are best in their strong middle second or
   two.
2. **Transitions:** prefer hard cuts on the beat; use whip-pan/crash-zoom moves
   (generated into the shots) as motivated transitions rather than canned
   dissolves.
3. **Captions:** burn in animated captions for Shorts/social (most watch muted).
   Keep them high-contrast, 2–4 words per line, synced to the VO.
4. **Color & finish:** a light grade to unify shots to the Style Bible, plus a
   consistent grain/finish pass so mixed generations feel like one film.
5. **QC:** watch end-to-end for identity drift, continuity, audio levels, and
   caption sync before export.

## Shorts from long-form

After the long video is cut, mine it for verticals: pull 20–60s self-contained
moments (each with its own mini-hook), reframe to 9:16, re-caption, and schedule.
One long video can seed a week of Shorts. Higgsfield's Shorts Studio can automate
cutting/captioning; otherwise do it in the edit.

## Packaging (titles & thumbnails)

Click-through decides whether the work is seen.

- **Titles:** 3 options — curiosity gap, benefit/stakes, and bold claim
  variants. Front-load the intriguing word.
- **Thumbnails:** generate 3 with an image model (GPT Image 2 handles in-image
  text well). One clear subject, high contrast, a readable 2–4 word overlay, an
  emotional face or striking object. Test that it reads at small size.
- Keep a recognizable thumbnail style across episodes for channel identity.

## Cadence (for channels)

Consistency compounds: e.g., two long videos a week plus daily Shorts at fixed
times. Batch production — write several scripts, then generate, then edit — so
the pipeline stays full without per-video cold starts.

## Asset ledger (keep this per project)

Track, in a simple table: shot #, script beat, character anchor used, still
seed/path, chosen model, camera preset, status (drafted / generated / accepted),
and re-roll count. This keeps a multi-shot film consistent and reproducible, and
makes re-cuts painless.
