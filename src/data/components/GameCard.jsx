import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GameCard.css';

const GameCard = ({ game }) => {
  const imgRef = useRef(null);
  const [liked, setLiked] = useState(() =>
    JSON.parse(localStorage.getItem(`liked-${game.id}`) || 'false')
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!game.background_image) {
      setImageLoaded(true);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = game.background_image;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      setImageLoaded(true);
      console.error('Image load failed for:', game.background_image);
    };
  }, [game.background_image]);

  const handleImgLoad = () => {
    setImageLoaded(true);
  };

  const toggleLike = (e) => {
    e.preventDefault();
    setLiked((prev) => {
      localStorage.setItem(`liked-${game.id}`, JSON.stringify(!prev));
      return !prev;
    });
  };

  // Use a static or theme-based accent color
  const accentColor = '#2d3748'; // Subtle gray, adjustable via theme if needed

  return (
    <Link
      to={`/games/${game.id}`}
      className="game-card block overflow-hidden rounded-lg border border-gray-800 hover:border-blue-500 transition-all duration-200"
      style={{ boxShadow: `0 4px 20px ${accentColor}`, opacity: imageLoaded ? 1 : 0.5 }}
    >
      <img
        src={game.background_image || 'https://via.placeholder.com/300x400?text=No+Image'}
        ref={imgRef}
        alt={game.name}
        crossOrigin="anonymous"
        loading="lazy"
        onLoad={handleImgLoad}
         onError={(e) => {
    e.target.onerror = null; // prevent infinite loop if placeholder fails
    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
    console.error('Image error:', game.background_image);
  }}
        className="w-full h-64 object-cover"
      />
      <div className="p-4 bg-gray-800">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-medium text-gray-100 truncate">{game.name}</h2>
          <button
            onClick={toggleLike}
            className={`text-sm ${liked ? 'text-blue-400' : 'text-gray-400'} hover:text-blue-300 transition-colors`}
          >
            Favorite
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {(game.genres || []).slice(0, 2).map((genre) => (
            <span
              key={genre.id}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
            >
              {genre.name}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-400">Rating: {game.rating || 'N/A'} / 5</p>
        <p className="text-sm text-gray-400">Released: {game.released || 'N/A'}</p>
      </div>
    </Link>
  );
};

export default GameCard;