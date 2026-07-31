# The n8n Automation Handbook

A complete beginner-to-enterprise textbook on n8n automation, written Feynman-style:
every term explained before it is used, every concept taught with a story, a real-life
analogy, and diagrams. Delivered as one professionally formatted PDF per Part/Chapter.

## Structure
- `src/`   — chapter source in Markdown (Mermaid diagrams + GitHub-style callouts)
- `pdf/`   — generated PDFs (one per chapter)
- `build/` — the build pipeline (marked.js + mermaid.js → Chromium print-to-PDF)

## Build
```bash
cd build
node build.mjs ../src/<chapter>.md ../pdf/<chapter>.pdf "Title" "Part label"
# or build everything:
bash build-all.sh
```

## Progress
- [x] Front Matter (cover, preface, how-to-read, master TOC)
- [x] Part 1 — Computer Fundamentals
- [x] Part 2 — Automation Fundamentals
- [x] Part 3 — n8n Fundamentals
- [x] Part 4 — JSON
- [x] Part 5 — APIs
- [x] Part 6 — Authentication
- [ ] Part 7 — Webhooks & Real-Time
- [ ] Part 8 — The HTTP Request Node
- [ ] Part 9 — Every Important n8n Node
- [ ] Part 10 — JavaScript for n8n
- [ ] Part 11 — AI Automation
- [ ] Part 12 — Enterprise Automation
- [ ] Part 13 — Ten Real Projects
