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
  const [capacity, setCapacity] = useState(initialParams.capacity.toString());
  const [landPerMWAC, setLandPerMWAC] = useState(initialParams.landPerMWAC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if input is coordinates (lat,lon format)
      const coordMatch = location.match(/^([\d.-]+)\s*,\s*([\d.-]+)$/);
      let lat, lon;

      if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lon = parseFloat(coordMatch[2]);
        if (isNaN(lat) || isNaN(lon)) {
          setError('Invalid coordinates format. Use: lat, lon');
          setLoading(false);
          return;
        }
      } else {
        // Search by location name
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)},Maharashtra,India&format=json`
        );
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
          setError(`Location "${location}" not found. Try another search or use coordinates (lat, lon).`);
          setLoading(false);
          return;
        }
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }

      const capacityNum = parseInt(capacity) || 50;
      onSearch({
        lat,
        lng: lon,
        radius,
        capacity: capacityNum,
        landPerMWAC,
        location,
      });
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLocationSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
          Substation or Location
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Pune or 18.52, 73.85"
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '8px 12px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            <Search size={16} />
          </button>
        </div>
        {error && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '12px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
          Search Radius: <span style={{ color: '#2563eb', fontWeight: '600' }}>{radius} km</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width: '100%', height: '6px', borderRadius: '4px', appearance: 'none', cursor: 'pointer', accentColor: '#2563eb' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
          Plant Capacity (MWAC)
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="range"
            min="10"
            max="500"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={{ flex: 1, height: '6px', borderRadius: '4px', appearance: 'none', cursor: 'pointer', accentColor: '#2563eb' }}
          />
          <input
            type="number"
            min="10"
            max="500"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={{ width: '60px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#2563eb', textAlign: 'center' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
          Land per MWAC: <span style={{ color: '#2563eb', fontWeight: '600' }}>{landPerMWAC.toFixed(2)} acres</span>
        </label>
        <input
          type="range"
          min="2.25"
          max="4.5"
          step="0.25"
          value={landPerMWAC}
          onChange={(e) => setLandPerMWAC(Number(e.target.value))}
          style={{ width: '100%', height: '6px', borderRadius: '4px', appearance: 'none', cursor: 'pointer', accentColor: '#2563eb' }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '10px 16px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.2s' }}
      >
        {loading ? 'Searching...' : 'Search Parcels'}
      </button>
    </form>
  );
}
