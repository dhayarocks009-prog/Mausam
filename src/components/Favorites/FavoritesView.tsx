'use client';

import React, { useState } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { Star, Trash2, Edit3, ArrowUp, ArrowDown, MapPin, Check, Plus } from 'lucide-react';
import { FavoriteLocation } from '@/types/weather';

export const FavoritesView: React.FC = () => {
  const {
    favorites,
    location,
    fetchWeatherForLocation,
    removeFavorite,
    renameFavorite,
    reorderFavorites,
    setIsSearchOpen,
    setActiveTab,
  } = useWeather();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const handleSelectLocation = (fav: FavoriteLocation) => {
    fetchWeatherForLocation(fav, false);
    setActiveTab('home');
  };

  const handleStartRename = (fav: FavoriteLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(fav.id);
    setEditName(fav.customName || fav.city);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      renameFavorite(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const nextFavs = [...favorites];
    const temp = nextFavs[index - 1];
    nextFavs[index - 1] = nextFavs[index];
    nextFavs[index] = temp;
    reorderFavorites(nextFavs);
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === favorites.length - 1) return;
    const nextFavs = [...favorites];
    const temp = nextFavs[index + 1];
    nextFavs[index + 1] = nextFavs[index];
    nextFavs[index] = temp;
    reorderFavorites(nextFavs);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(id);
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={22} color="#f59e0b" fill="#f59e0b" />
            <span>Saved Favorite Locations</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Switch instantly between your personalized cities
          </p>
        </div>

        <button
          className="layer-chip-btn active"
          onClick={() => setIsSearchOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} />
          <span>Add City</span>
        </button>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Star size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>No favorite cities saved yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
            Click the star icon on any city or search to add favorites.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {favorites.map((fav, idx) => {
            const isCurrent =
              Math.abs(fav.latitude - location.latitude) < 0.05 &&
              Math.abs(fav.longitude - location.longitude) < 0.05;

            return (
              <div
                key={fav.id}
                className="favorite-card"
                onClick={() => handleSelectLocation(fav)}
                style={{
                  borderColor: isCurrent ? 'var(--accent-cyan)' : undefined,
                  background: isCurrent ? 'rgba(0, 210, 255, 0.08)' : undefined,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-sm)',
                      background: isCurrent ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                      color: isCurrent ? '#050b17' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MapPin size={20} />
                  </div>

                  <div>
                    {editingId === fav.id ? (
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="search-input"
                          style={{ padding: '4px 8px', fontSize: '0.9rem', width: 160 }}
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleSaveRename(fav.id, e)}
                          className="header-icon-btn"
                          style={{ width: 32, height: 32 }}
                        >
                          <Check size={16} color="var(--accent-emerald)" />
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                        {fav.customName || fav.city}
                        {fav.customName && fav.customName !== fav.city && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                            ({fav.city})
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {fav.state ? `${fav.state}, ` : ''}{fav.country}
                      {isCurrent && (
                        <span style={{ marginLeft: 8, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          • Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Move Up, Move Down, Rename, Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="header-icon-btn"
                    onClick={(e) => handleMoveUp(idx, e)}
                    disabled={idx === 0}
                    style={{ width: 32, height: 32, opacity: idx === 0 ? 0.3 : 1 }}
                    title="Move up"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>

                  <button
                    className="header-icon-btn"
                    onClick={(e) => handleMoveDown(idx, e)}
                    disabled={idx === favorites.length - 1}
                    style={{ width: 32, height: 32, opacity: idx === favorites.length - 1 ? 0.3 : 1 }}
                    title="Move down"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>

                  <button
                    className="header-icon-btn"
                    onClick={(e) => handleStartRename(fav, e)}
                    style={{ width: 32, height: 32 }}
                    title="Rename location"
                    aria-label="Rename location"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    className="header-icon-btn"
                    onClick={(e) => handleDelete(fav.id, e)}
                    style={{ width: 32, height: 32, color: 'var(--alert-critical)' }}
                    title="Delete favorite"
                    aria-label="Delete favorite"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
