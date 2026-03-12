'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setGeneratedCode(''); // Clear the old website

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Stream the response directly into the state
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Use the previous state to safely append the new chunk of code
          setGeneratedCode((prevCode) => prevCode + chunk);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-ai-website.html';
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-8 flex flex-col gap-6 bg-gray-50 text-black">
      <header className="max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-2">AI Website Generator</h1>
        <p className="text-gray-600">Describe the website you want, and AI will build it instantly.</p>
      </header>

      <div className="max-w-4xl w-full mx-auto flex flex-col gap-4">
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
          placeholder="E.g., A dark-themed landing page for a coffee shop with a hero section and a pricing table..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors self-start"
        >
          {isLoading ? 'Brewing your code... (Streaming)' : 'Generate Website'}
        </button>
      </div>

      <div className="max-w-6xl w-full mx-auto mt-8 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          
          {generatedCode && !isLoading && (
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download HTML
            </button>
          )}
        </div>

        <div className="flex-grow border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white min-h-[500px] relative">
          {generatedCode ? (
            <iframe
              title="Generated Website Preview"
              srcDoc={generatedCode}
              className="w-full h-full border-none"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Your generated website will appear here
            </div>
          )}
        </div>
      </div>
    </main>
  );
}