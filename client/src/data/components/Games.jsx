import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from './GameCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const Games = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const requestControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        // Abort any in-flight request
        if (requestControllerRef.current) {
          try { 
            requestControllerRef.current.abort(); 
          } catch (_) {}
        }
        
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const controller = new AbortController();
        requestControllerRef.current = controller;
        
        // Set timeout for the request
        timeoutRef.current = setTimeout(() => {
          controller.abort();
        }, 15000);

        // Build URL with search parameter if provided
        const searchParam = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : '';
        const response = await fetch(
          `${API_BASE_URL}/api/games?page=${page}&page_size=20${searchParam}`,
          {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Parse response first (whether success or error)
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, throw a generic error
          if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
          throw new Error('Invalid response from server');
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            navigate('/');
            return;
          }
          
          // Extract error message from server response
          let errorMessage = data.message || `API request failed (${response.status} ${response.statusText})`;
          
          // Include detailed error in development mode if available
          if (data.error && import.meta.env.DEV) {
            errorMessage += `: ${data.error}`;
          }
          
          throw new Error(errorMessage);
        }

        if (!data.results || data.results.length === 0) {
          setHasMore(false);
          if (page === 1) {
            setGames([]);
          }
          return;
        }

        const validGames = data.results.filter(g => g.background_image);

        if (page === 1) {
          // Reset games on first page (includes search results)
          setGames(validGames);
        } else if (!searchTerm.trim()) {
          // Append games for pagination (only when not searching)
          setGames(prev => [...prev, ...validGames]);
        }

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching games:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load games.';
        if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
          errorMessage = 'Unable to connect to server. Please check if the server is running and accessible at ' + API_BASE_URL;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setHasMore(false);
      } finally {
        setLoading(false);
        requestControllerRef.current = null;
      }
    };

    // Debounce search requests - wait 500ms after user stops typing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchGames();
    }, searchTerm ? 500 : 0); // Immediate fetch if no search, debounce if searching

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (requestControllerRef.current) {
        try {
          requestControllerRef.current.abort();
        } catch (_) {}
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [page, searchTerm, navigate]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm && page !== 1) {
      setPage(1);
      setHasMore(true);
    }
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll observer (only when not searching)
  useEffect(() => {
    if (searchTerm.trim()) return; // Disable infinite scroll when searching

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading, error, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = () => {
    setGames([]);
    setHasMore(true);
    setError('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="bg-[#2a2a2a] border-b border-[#3a3a3a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 
                className="text-2xl font-bold text-[#ff6b6b] cursor-pointer hover:text-[#ff8787] transition-colors" 
                onClick={() => window.location.href = '/games'}
              >
                LOOTBOX
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search games..."
            className="w-full max-w-xl px-4 py-2.5 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300 mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-[#ff6b6b] hover:bg-[#ff8787] text-white rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Games Grid - More compact with smaller gap */}
        {games.length > 0 && (
          <div className="grid grid-cols-5 gap-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && games.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b6b]"></div>
            <p className="mt-4 text-gray-400">Loading games...</p>
          </div>
        )}

        {/* Loading More */}
        {loading && games.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff6b6b]"></div>
            <p className="mt-2 text-gray-400">Loading more games...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && games.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games found for "{searchTerm}"</p>
          </div>
        )}

        {!loading && !error && games.length === 0 && !searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games found.</p>
          </div>
        )}

        {/* Loader for infinite scroll */}
        {!searchTerm.trim() && <div ref={loaderRef} className="h-10 mt-4" />}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[#3a3a3a] text-center">
          <p className="text-gray-400 text-sm">
            Data provided by{' '}
            <a 
              href="https://rawg.io" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#ff6b6b] hover:text-[#ff8787] underline"
            >
              RAWG
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Games;
