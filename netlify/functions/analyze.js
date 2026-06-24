exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Convert Anthropic-style content array → Gemini parts array
  const parts = (parsed.messages[0].content || []).map(item => {
    if (item.type === 'image' || item.type === 'document') {
      return { inline_data: { mime_type: item.source.media_type, data: item.source.data } };
    }
    return { text: item.text };
  });

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: 1000 },
      }),
    }
  );

  const geminiData = await upstream.json();

  // Convert Gemini response → Anthropic-style so the client needs no changes
  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: [{ type: 'text', text }] }),
  };
};
