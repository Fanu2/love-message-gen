'use client';
import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [tone, setTone] = useState('');
  const [model, setModel] = useState('mistral');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateMessage = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tone, model }),
      });

      const data = await res.json();
      if (data.message) setMessage(data.message);
      else setMessage('Failed to generate message.');
    } catch (err) {
      setMessage('Error occurred.');
    }
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Love Message Generator 💌</h1>

      <input
        type="text"
        placeholder="Name"
        className="border p-2 w-full mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Tone (e.g., romantic, playful)"
        className="border p-2 w-full mb-3"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-3"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      >
        <option value="mistral">Mistral</option>
        <option value="gemini">Gemini</option>
      </select>

      <button
        className="bg-pink-600 text-white px-4 py-2 rounded w-full"
        onClick={generateMessage}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Message'}
      </button>

      {message && (
        <div className="mt-4 p-4 bg-pink-100 text-pink-900 rounded shadow">
          {message}
        </div>
      )}
    </main>
  );
}
