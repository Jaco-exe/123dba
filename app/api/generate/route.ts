import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// We keep this just to be safe, but the stream will bypass the hard crash
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    // 1. Ask Claude to generate the response as a continuous stream
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 20000,
      system: "You are an expert front-end developer. Generate a complete, single-file HTML document containing embedded CSS and JavaScript. You MUST finish the entire HTML document and close the final </html> tag. Keep styles and scripts efficient. Do NOT wrap the code in markdown blocks. Return ONLY the raw HTML code, starting with <!DOCTYPE html>.",
      messages: [{ role: 'user', content: prompt }],
      stream: true, // 🔥 This is the magic switch
    });

    // 2. Create a readable stream to pipe the text chunks to the frontend
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            // Send each piece of code to the frontend as soon as it's generated
            controller.enqueue(chunk.delta.text);
          }
        }
        controller.close();
      },
    });

    // 3. Return the stream directly instead of waiting for a JSON package
    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error generating website:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate website' }), { status: 500 });
  }
}