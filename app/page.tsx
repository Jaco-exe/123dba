'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setGeneratedCode('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (data.code) {
        setGeneratedCode(data.code);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
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
          {isLoading ? 'Generating... (This may take a minute)' : 'Generate Website'}
        </button>
      </div>

      <div className="max-w-6xl w-full mx-auto mt-8 flex-grow flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div className="flex-grow border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white min-h-[500px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
              <p className="text-lg font-medium animate-pulse">Brewing your code...</p>
            </div>
          )}
          {generatedCode ? (
            <iframe
              title="Generated Website Preview"
              srcDoc={generatedCode}
              className="w-full h-full border-none"
              sandbox="allow-scripts" // Allows JS to run inside the iframe safely
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