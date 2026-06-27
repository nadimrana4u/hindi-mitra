const HEADERS_BASE = { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' };

const EXTRACT_PROMPT = `You are reading a handwritten Hindi answer sheet.
Scan the page(s) from TOP to BOTTOM, LEFT to RIGHT, line by line.
Transcribe EVERY Hindi word you can see — all of them, in order.
Write one word per line. If a word is unclear, write your best guess followed by a ? mark.
Do NOT skip any word. Do NOT write any commentary. Output ONLY the word list.`;

const ANALYZE_PROMPT = `You are an expert CBSE Hindi teacher marking a class 9–10 student's written work.
Below is a complete word-by-word transcription of the student's handwritten answer sheet.
Some words may have a ? mark meaning the handwriting was unclear.

TRANSCRIPTION:
{{TRANSCRIPTION}}

Your task:
1. Go through every word and identify spelling/matra mistakes (wrong word → correct word).
2. Group all mistakes into the categories below by type.
3. Count how many times each mistake type appears to set severity.
4. Output ONLY valid JSON — no markdown, no backticks, no prose outside the JSON.

Allowed tags (use EXACTLY these values):
- "matra_short_long"  → confusing छोटी इ/बड़ी ई or छोटा उ/बड़ा ऊ
- "matra_form"        → wrong matra shape or matra on wrong letter
- "anusvara"          → confusing अनुस्वार ं with चंद्रबिंदु ँ
- "sibilants"         → confusing श / ष / स
- "na_retroflex"      → confusing न with ण
- "conjuncts"         → wrong conjunct letters (क्ष त्र ज्ञ half-letters etc.)
- "spelling_general"  → any other spelling error

JSON schema:
{"summary":"<one warm Hindi sentence about the main pattern>","weak_areas":[{"tag":"<tag>","label":"<short Hindi label>","severity":<1-3 int, 3=most frequent>,"examples":["<wrong>→<correct>", ...up to 8 actual examples from the transcription],"note":"<one practical Hindi tip>"}],"strengths":["<short Hindi strength observed>"]}

Rules:
- List up to 5 weak_areas, most frequent first.
- examples must be actual words from the transcription above, not invented.
- severity 3 = appears 5+ times, 2 = 2–4 times, 1 = once.
- Output JSON only.`;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.Hindi_Mitra_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let parsed;
  try { parsed = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const callAPI = async (messages, maxTokens) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { ...HEADERS_BASE, 'x-api-key': apiKey },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        temperature: 0,
        messages,
      }),
    });
    return res.json();
  };

  try {
    // Step 1 — extract every word from the image/PDF
    const imageBlocks = parsed.content; // array of image/document content blocks
    const extractData = await callAPI([{ role: 'user', content: [...imageBlocks, { type: 'text', text: EXTRACT_PROMPT }] }], 2048);
    const transcription = (extractData.content || []).map(c => c.type === 'text' ? c.text : '').join('').trim();

    if (!transcription) {
      return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Could not read text from the uploaded file.' }) };
    }

    // Step 2 — analyse the transcription for mistakes
    const prompt = ANALYZE_PROMPT.replace('{{TRANSCRIPTION}}', transcription);
    const analyzeData = await callAPI([{ role: 'user', content: prompt }], 2048);
    const rawText = (analyzeData.content || []).map(c => c.type === 'text' ? c.text : '').join('').trim();
    const json = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(json) };

  } catch (err) {
    return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};
