import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';
import '../styles/Games.css';

const Games = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const apiKey = '469422fc872843afa314500f45c0b173';

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.rawg.io/api/games?key=${apiKey}&page=${page}&page_size=20`
        );
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        const newGames = data.results.map(game => ({
          ...game,
          background_image: game.background_image || 'https://via.placeholder.com/300x400?text=No+Image',
        }));
        setGames(prev => [...prev, ...newGames]);
        setFilteredGames(prev => [...prev, ...newGames]);
      } catch (error) {
        console.error('Error fetching games:', error);
        setGames(prev => [
          ...prev,
          { id: `error-${prev.length}`, name: 'Error Loading', background_image: 'https://via.placeholder.com/300x400?text=API+Error' },
        ]);
        setFilteredGames(prev => [
          ...prev,
          { id: `error-${prev.length}`, name: 'Error Loading', background_image: 'https://via.placeholder.com/300x400?text=API+Error' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [page]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredGames(
      games.filter(game => game.name.toLowerCase().includes(term))
    );
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
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

        <div className="games-grid">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {loading && (
          <p className="text-center mt-6 text-gray-400">Loading...</p>
        )}

        {!loading && filteredGames.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Load More
            </button>
          </div>
        )}

        {!loading && filteredGames.length === 0 && (
          <p className="text-center mt-6 text-gray-400">No games found.</p>
        )}

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