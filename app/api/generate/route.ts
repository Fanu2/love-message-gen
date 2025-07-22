export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, tone, model } = body;
    if (
      !name ||
      !tone ||
      !model ||
      typeof name !== 'string' ||
      typeof tone !== 'string' ||
      typeof model !== 'string'
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid name/tone/model in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs (basic)
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '');
    const sanitizedTone = tone.replace(/[^a-zA-Z0-9\s]/g, '');

    const prompt = `Write a ${sanitizedTone} message to someone named ${sanitizedName}. Keep it under 3 sentences. Use poetic and romantic language.`;

    if (model === 'mistral') {
      const apiKey = process.env.MISTRAL_API_KEY;
      if (!apiKey) {
        throw new Error('Mistral API key is not configured');
      }

      const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || 'mistral-small',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
        }),
      });

      if (!mistralRes.ok) {
        throw new Error(`Mistral API error: ${mistralRes.status} ${mistralRes.statusText}`);
      }

      const data = await mistralRes.json();
      const message = data.choices?.[0]?.message?.content?.trim() || 'Could not generate message.';

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Mistral API');
      }

      return new Response(JSON.stringify({ message }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (model === 'gemini') {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error('Gemini API key is not configured');
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1/generateMessage?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: { text: prompt },
          }),
        }
      );

      if (!geminiRes.ok) {
        throw new Error(`Gemini API error: ${geminiRes.status} ${geminiRes.statusText}`);
      }

      const data = await geminiRes.json();
      const message = data?.candidates?.[0]?.content?.text?.trim();

      if (!message) {
        throw new Error('Invalid response from Gemini API');
      }

      return new Response(JSON.stringify({ message }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported model selected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
