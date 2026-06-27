# हिंदी मित्र · Hindi Mitra

A single-file web app that helps CBSE class 9–10 students fix common Hindi spelling and matra mistakes — 10 minutes a day, personalised to the student's own errors.

## Features

- **आज (Today)** — 12-question daily practice session weighted toward the student's weak areas. Tracks streak, time, and accuracy.
- **जाँच (Diagnose)** — Upload a handwritten answer sheet (JPG/PNG/PDF); Claude vision API reads it and identifies recurring matra and spelling mistakes, then rebuilds the practice session around them. Manual selection available when no scan is at hand.
- **सीखें (Learn)** — Interactive matra explorer, full varnamala (स्वर + व्यंजन), and barahkhadi for any consonant.
- **प्रगति (Progress)** — Per-skill accuracy bars, streak counter, and badges.

## Practice word banks (CBSE class 9–10 vocabulary)

| Category | Words | Tests |
|---|---|---|
| छोटी इ / बड़ी ई · छोटा उ / बड़ा ऊ | 93 | Short vs long vowel matras |
| अनुस्वार ं / चंद्रबिंदु ँ | 42 | anusvara vs chandrabindu |
| श / ष / स | 24 | Sibilant confusion |
| न / ण | 26 | Dental vs retroflex na |
| संयुक्त अक्षर (क्ष त्र ज्ञ …) | 25 | Conjuncts & half-letters |

Vocabulary is drawn from Kshitij and Kritika chapters (दो बैलों की कथा, Kabir, ग्राम श्री, etc.) and common essay/cross-subject terms.

## How to run

No build step — just open `index.html` in a browser.

```
open index.html
```

Progress is saved to `localStorage`. The scan feature (जाँच) calls the Anthropic API and requires an API key injected at runtime; it works out of the box inside a Claude.ai artifact. For standalone deployment, add a serverless backend that proxies the request and holds the key.

## Tech

- Vanilla HTML + CSS + JS, single file, no dependencies
- Fonts: Tiro Devanagari Hindi, Mukta, Bricolage Grotesque, Inter (Google Fonts)
- State: `localStorage`
- Scan analysis: Anthropic Messages API (`claude-sonnet-4-6`, vision)

## Roadmap

- Pre-recorded audio clips (device-independent pronunciation)
- Vite + Capacitor build for Play Store / App Store
- Serverless backend for scan analysis
- Expand word banks to class 10 vocabulary
