import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  useEffect(() => {
    const fetchGame = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/games/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            navigate('/');
            return;
          }
          if (response.status === 404) {
            throw new Error('Game not found');
          }
          // Try to get error message from response
          let errorMessage = `Failed to fetch game details: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (_) {
            // If JSON parsing fails, use the default error message
          }
          throw new Error(errorMessage);
        }

        // Parse JSON response
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Invalid response from server. Please try again.');
        }

        setGame(data);
      } catch (err) {
        console.error('Error fetching game details:', err);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load game details.';
        if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
          errorMessage = 'Unable to connect to server. Please check if the server is running and accessible at ' + API_BASE_URL;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-letterboxd-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-letterboxd-red"></div>
          <p className="mt-4 text-letterboxd-text-secondary">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-letterboxd-dark">
        <header className="bg-letterboxd-card border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => navigate('/games')}
                className="text-2xl font-bold text-letterboxd-red hover:text-red-400"
              >
                LOOTBOX
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-letterboxd-text-secondary hover:text-letterboxd-red transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/games')}
              className="px-6 py-2 bg-letterboxd-red hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  // Sanitize HTML description
  const sanitizedDescription = game.description 
    ? DOMPurify.sanitize(game.description, { 
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href']
      })
    : 'No description available.';

  return (
    <div className="min-h-screen bg-letterboxd-dark">
      {/* Header */}
      <header className="bg-letterboxd-card border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/games')}
              className="text-2xl font-bold text-letterboxd-red hover:text-red-400 transition-colors"
            >
              LOOTBOX
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-letterboxd-text-secondary hover:text-letterboxd-red transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/games')}
          className="mb-6 text-letterboxd-text-secondary hover:text-letterboxd-red transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Games
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <img
                src={game.background_image || 'https://via.placeholder.com/600x800/1F2937/9CA3AF?text=No+Image'}
                alt={game.name}
                className="w-full rounded-lg shadow-2xl border border-gray-800"
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-letterboxd-text mb-4">{game.name}</h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 mb-6">
              {game.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-letterboxd-text-secondary">Rating:</span>
                  <span className="bg-letterboxd-red text-white px-3 py-1 rounded-md font-semibold">
                    {game.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}
              {game.released && (
                <div className="flex items-center gap-2">
                  <span className="text-letterboxd-text-secondary">Released:</span>
                  <span className="text-letterboxd-text">{new Date(game.released).toLocaleDateString()}</span>
                </div>
              )}
              {game.playtime && (
                <div className="flex items-center gap-2">
                  <span className="text-letterboxd-text-secondary">Playtime:</span>
                  <span className="text-letterboxd-text">{game.playtime} hours</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-letterboxd-text-secondary mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-letterboxd-card border border-gray-700 rounded-md text-letterboxd-text text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-letterboxd-text-secondary mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform) => (
                    <span
                      key={platform.platform.id}
                      className="px-3 py-1 bg-letterboxd-card border border-gray-700 rounded-md text-letterboxd-text text-sm"
                    >
                      {platform.platform.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {game.description && (
              <div className="mb-6">
                <h3 className="text-letterboxd-text-secondary mb-3">Description</h3>
                <div
                  className="text-letterboxd-text prose prose-invert prose-red max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                  style={{
                    color: '#ECF0F1',
                  }}
                />
              </div>
            )}

            {/* Additional Info */}
            {game.developers && game.developers.length > 0 && (
              <div className="mb-4">
                <span className="text-letterboxd-text-secondary">Developers: </span>
                <span className="text-letterboxd-text">
                  {game.developers.map(d => d.name).join(', ')}
                </span>
              </div>
            )}

            {game.publishers && game.publishers.length > 0 && (
              <div className="mb-4">
                <span className="text-letterboxd-text-secondary">Publishers: </span>
                <span className="text-letterboxd-text">
                  {game.publishers.map(p => p.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetail;
