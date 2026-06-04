import React, { useState } from 'react';
import axios from 'axios';

interface SearchResult {
  title: string;
  snippet: string;
  source: string;
  url?: string;
  cid?: string;
  score?: number;
}

const AISearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiBackendUrl = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8001';
  const aiApiKey = import.meta.env.VITE_AI_BACKEND_API_KEY || 'testkey';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${aiBackendUrl}/search`, { query }, {
        headers: { 'X-API-Key': aiApiKey }
      });
      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </form>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {results.map((r, i) => <div key={i}>{r.title}</div>)}
    </div>
  );
};
export default AISearchBar;
