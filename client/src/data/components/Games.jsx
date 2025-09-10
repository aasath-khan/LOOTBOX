import React, { useState, useEffect, useRef } from 'react';
import GameCard from './GameCard';
import '../styles/Games.css';

const Games = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [theme, setTheme] = useState('dark');
  const loaderRef = useRef(null);
  const requestControllerRef = useRef(null);
  const [reloadToken, setReloadToken] = useState(0);
  const apiKey = "469422fc872843afa314500f45c0b173";

  // Apply theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError('');
      try {
        // Abort any in-flight request and set a timeout
        if (requestControllerRef.current) {
          try { requestControllerRef.current.abort(); } catch (_) {}
        }
        const controller = new AbortController();
        requestControllerRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(
          `https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=20`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`RAWG API request failed (${response.status} ${response.statusText})`);
        }
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
          setHasMore(false);
          return;
        }

        const validGames = data.results.filter(g => g.background_image); // skip broken ones

        setGames(prev => [...prev, ...validGames]);
        setFilteredGames(prev => {
          const updated = [...prev, ...validGames];
          return searchTerm
            ? updated.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : updated;
        });
      } catch (error) {
        console.error('Error fetching games:', error);
        setError(error.message || 'Failed to load games.');
        setHasMore(false);
      } finally {
        setLoading(false);
        try { requestControllerRef.current = null; } catch (_) {}
      }
    };

    fetchGames();
  }, [page, reloadToken]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading, error]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredGames(
      games.filter(game => game.name.toLowerCase().includes(term))
    );
  };

  return (
    <div className="games-container min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Game Catalog</h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-4 py-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 transition-colors"
          >
            Toggle Theme
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search games..."
          className="w-full max-w-lg p-2 mb-6 bg-gray-800 text-gray-200 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <p className="text-center mt-6 text-red-400">{error}</p>
        )}

        {error && (
          <div className="text-center mt-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => {
                setGames([]);
                setFilteredGames([]);
                setHasMore(true);
                setError('');
                setPage(1);
                setReloadToken((v) => v + 1);
              }}
              className="px-4 py-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="games-grid">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {loading && (
          <p className="text-center mt-6 text-gray-400">Loading more games...</p>
        )}

        {!loading && !error && filteredGames.length === 0 && (
          <p className="text-center mt-6 text-gray-400">No games found.</p>
        )}

        {/* Loader for infinite scroll */}
        <div ref={loaderRef} className="h-10 mt-4" />

        <p className="text-center mt-8 text-sm text-gray-500">
          Data provided by{' '}
          <a href="https://rawg.io" target="_blank" rel="noreferrer" className="underline">
            RAWG
          </a>
        </p>
      </div>
    </div>
  );
};

export default Games;
