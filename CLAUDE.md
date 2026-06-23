# Hindi Mitra — project context for Claude Code

## What this is
A single-file web app that helps a CBSE class 9–10 student fix specific Hindi
weaknesses: matras (vowel signs), the varnamala, and spelling. Built to be
practised ~10 minutes a day, personalised to one student's actual mistakes.

## Current state
- Everything lives in `index.html` (HTML + CSS + vanilla JS, no build step, no framework).
- Tabs: आज (daily personalised practice), जाँच (diagnose), सीखें (learn), प्रगति (progress).
- State persists via localStorage.
- Audio has been REMOVED for now (was browser speech; unreliable across devices).
- The जाँच scan feature calls the Anthropic vision API. It only works inside the
  Claude.ai artifact runtime today; as a real product it needs a backend that
  holds the API key (never ship the key in the client).

## Conventions / preferences
- Keep it a single self-contained file unless we deliberately decide to restructure.
- No build tooling unless we choose to add it.
- Bilingual UI: Hindi primary, small English helper text.
- Colour code: consonant = ink/black, matra = marigold/orange.

## Likely next steps (not yet done)
- Re-add audio as pre-recorded clips (device-independent).
- Restructure into a Vite project + Capacitor wrapper for Play Store / App Store.
- Add a backend (serverless function) for the scan analysis.
- Expand practice word banks to real CBSE 9–10 vocabulary.

## How to preview
Just open index.html in a browser. (No server needed.)
