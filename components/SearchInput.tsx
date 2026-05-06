'use client';

import React, { useState } from 'react';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import type { SearchParams } from '@/types';

interface SearchInputProps {
  onSearch: (params: SearchParams) => void;
  initialParams: SearchParams;
}

export function SearchInput({ onSearch, initialParams }: SearchInputProps) {
  const [location, setLocation] = useState(initialParams.location || 'Mumbai');
  const [radius, setRadius] = useState(initialParams.radius);
  const [capacity, setCapacity] = useState(initialParams.capacity);
  const [landPerMWAC, setLandPerMWAC] = useState(initialParams.landPerMWAC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)},Maharashtra,India&format=json`
      );
      const geoData = await geoResponse.json();

      if (geoData.length > 0) {
        const { lat, lon } = geoData[0];
        onSearch({
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          radius,
          capacity,
          landPerMWAC,
          location,
        });
      } else {
        setError(`Location "${location}" not found. Try another search.`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLocationSearch} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Substation or Location
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Pune, Nagpur..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">
          Search Radius: <span className="text-blue-600 font-semibold">{radius} km</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">
          Plant Capacity (MWAC)
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="10"
            max="500"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <input
            type="number"
            min="10"
            max="500"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(Math.max(10, Math.min(500, Number(e.target.value))))}
            className="w-16 px-2 py-1 border border-slate-300 rounded text-sm font-semibold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">
          Land per MWAC: <span className="text-blue-600 font-semibold">{landPerMWAC.toFixed(2)} acres</span>
        </label>
        <input
          type="range"
          min="2.25"
          max="4.5"
          step="0.25"
          value={landPerMWAC}
          onChange={(e) => setLandPerMWAC(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <MapPin className="w-4 h-4" />
        {loading ? 'Searching...' : 'Search Parcels'}
      </button>
    </form>
  );
}
