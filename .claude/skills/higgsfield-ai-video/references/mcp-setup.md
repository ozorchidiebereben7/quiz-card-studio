# Higgsfield MCP Setup Reference

Higgsfield generation runs through its official hosted MCP server: one auth, many
image and video models, no per-provider API keys. Use this reference to get the
user connected before running paid generations.

## Install (Claude Code)

Register the hosted MCP server:

```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

Then authenticate:

1. Run `/mcp` in Claude Code.
2. Select `higgsfield` and complete the OAuth sign-in in the browser.
3. Restart Claude Code if the tools don't appear immediately.

Optional companion skills published by Higgsfield can be added via their skills
distribution (e.g. an `npx skills add` flow) — but this skill already encodes the
workflow, so the MCP connection is the only hard requirement.

> This is a non-interactive/remote session note: OAuth can't be completed here.
> If the tools aren't connected, tell the user to run the steps above in an
> interactive Claude Code session (or connect the Higgsfield connector in their
> claude.ai settings), then return.

## Tools the server exposes

The core surface (names may evolve — confirm against the live tool list):

| Tool | Purpose |
|------|---------|
| `generate_image` | Text-to-image / image editing across the image models. |
| `generate_video` | Text-to-video and image-to-video across the video models. |
| `create_character` | Register a canonical character for consistent recall. |
| `list_characters` | List registered characters to reuse as anchors. |
| `get_generation_status` | Poll an async generation job to completion. |

## Working with the tools

- **Confirm connection first.** If these tools aren't present, don't claim you
  can generate — deliver scripts/shot lists/prompts instead and wait for the
  connection.
- **Respect cost.** Each `generate_*` call spends the user's credits. Present the
  plan and estimated shot count, get explicit approval, then generate.
- **Async by default.** Video jobs take minutes. Fire the job, then poll
  `get_generation_status`; batch multiple shots so you're not idling on one.
- **Anchor characters via `create_character` / `list_characters`** so recurring
  identity is recalled by reference rather than re-described from scratch each
  time (pairs with `character-consistency.md`).
- **Track outputs** (returned URLs/IDs) in the asset ledger so shots can be
  reassembled and re-cut.

## If the MCP is unavailable

Everything up to generation is still deliverable without the server:
concept, script, shot list, Style Bible, Character Anchor Blocks, and fully
written per-shot MCSLA prompts the user can paste into Higgsfield directly. Hand
those over as a complete package; wire up generation once connected.
