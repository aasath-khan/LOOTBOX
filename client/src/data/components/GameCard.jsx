import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Platform icon mapping for smaller icons
const getPlatformIcon = (platformName) => {
  const name = platformName?.toLowerCase() || '';
  if (name.includes('playstation')) return 'PS';
  if (name.includes('xbox')) return 'XB';
  if (name.includes('nintendo') || name.includes('switch')) return 'NS';
  if (name.includes('pc') || name.includes('windows')) return 'PC';
  if (name.includes('ios') || name.includes('iphone') || name.includes('ipad')) return 'iOS';
  if (name.includes('android')) return 'AN';
  if (name.includes('mac')) return 'MAC';
  if (name.includes('linux')) return 'LNX';
  if (name.includes('web')) return 'WEB';
  return 'PC';
};

const GameCard = ({ game }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!game.background_image) {
      setImageLoaded(true);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = game.background_image;
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageLoaded(true);
      setImageError(true);
    };
  }, [game.background_image]);

  const imageSrc = imageError || !game.background_image
    ? 'https://via.placeholder.com/200x270/1F2937/9CA3AF?text=No+Image'
    : game.background_image;

  // Get platforms for display
  const platforms = game.parent_platforms || game.platforms || [];
  const platformNames = platforms.map(p => p?.platform?.name || p?.name).filter(Boolean).slice(0, 3);
  
  // Get rating display
  const rating = game.rating ? game.rating.toFixed(1) : null;

  return (
    <Link
      to={`/games/${game.id}`}
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-[#2a2a2a] rounded overflow-hidden border border-transparent hover:border-[#4a4a4a] transition-all duration-200 cursor-pointer">
        {/* Image Container - Smaller aspect ratio */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
          <img
            src={imageSrc}
            alt={game.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onError={() => setImageError(true)}
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
              <div className="animate-pulse text-gray-500 text-[10px]">Loading...</div>
            </div>
          )}

          {/* Play Button Overlay on Hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200">
              <div className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Platform Icons - Top Left */}
          {platformNames.length > 0 && (
            <div className="absolute top-1.5 left-1.5 flex gap-0.5 flex-wrap max-w-[70%]">
              {platformNames.map((platformName, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-medium bg-black/80 backdrop-blur-sm rounded px-1 py-0.5 text-white"
                  title={platformName}
                >
                  {getPlatformIcon(platformName)}
                </span>
              ))}
            </div>
          )}

          {/* Rating Badge - Bottom Right */}
          {rating && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm rounded px-1.5 py-0.5">
              <span className="text-[10px] font-semibold text-white">★ {rating}</span>
            </div>
          )}
        </div>

        {/* Card Info - Compact */}
        <div className="p-2 bg-[#2a2a2a]">
          {/* Title */}
          <h3 className="text-xs font-medium text-white leading-tight line-clamp-2 mb-1 group-hover:text-[#ff6b6b] transition-colors">
            {game.name}
          </h3>
          
          {/* Platforms Row - Compact */}
          {platformNames.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {platformNames.slice(0, 2).map((platformName, idx) => (
                <span
                  key={idx}
                  className="text-[9px] text-gray-400 uppercase"
                >
                  {platformName.length > 6 ? platformName.substring(0, 6) : platformName}
                  {idx < Math.min(2, platformNames.length) - 1 && <span className="mx-0.5">•</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
