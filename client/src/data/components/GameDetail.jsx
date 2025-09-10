import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/GameDetail.css';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiKey = '469422fc872843afa314500f45c0b173';

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
        if (!response.ok) throw new Error('Game not found');
        const data = await response.json();
        setGame(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  if (loading) return <div className="games-container">Loading game...</div>;
  if (!game) return <div className="games-container">Game not found.</div>;

  return (
    <div className="games-container">
      <h1 className="games-title">{game.name}</h1>
      <img
        src={game.background_image || 'https://via.placeholder.com/600x300'}
        alt={game.name}
        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
      />
      <p><strong>Release Date :</strong> {game.released}</p>
      <p><strong>Rating:</strong> {game.rating} / 5</p>
      <p><strong>Genre:</strong> {game.genres.map(g => g.name).join(', ')}</p>
      <p><strong>Platforms:</strong> {game.platforms.map(p => p.platform.name).join(', ')}</p>
      <div dangerouslySetInnerHTML={{ __html: game.description }} />
    </div>
  );
};

export default GameDetail;
