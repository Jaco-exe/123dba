import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

// Initialize the Anthropic client
// It will automatically use the process.env.ANTHROPIC_API_KEY
const anthropic = new Anthropic();

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219', // You can change this to a faster model like haiku if preferred
      max_tokens: 4000,
      system: "You are an expert front-end developer. Generate a complete, single-file HTML document containing embedded CSS and JavaScript based on the user's request. Do NOT wrap the code in markdown blocks (like ```html). Return ONLY the raw HTML code, starting with <!DOCTYPE html>.",
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract the text content from Claude's response
    let generatedCode = '';
    if (response.content[0].type === 'text') {
      generatedCode = response.content[0].text;
    }

    // Fallback cleanup just in case Claude includes markdown formatting
    generatedCode = generatedCode.replace(/^```html\n?/, '').replace(/\n?```$/, '');

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error('Error generating website:', error);
    return NextResponse.json({ error: 'Failed to generate website' }, { status: 500 });
  }
}