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

      // 1. Create a reader to catch the chunks of text coming from the server
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedCode = '';

      // 2. Keep reading chunks until Claude is completely finished
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          // Decode the chunk and add it to our ongoing code string
          const chunk = decoder.decode(value, { stream: true });
          streamedCode += chunk;
          
          // Update the state so the code is saved
          setGeneratedCode(streamedCode);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server.');
    } finally {
      setIsLoading(false); // Only turn off the loading screen when Claude is 100% done
    }
  };