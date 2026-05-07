'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SearchInput } from '@/components/SearchInput';
import { ParcelList } from '@/components/ParcelList';
import { FilterPanel } from '@/components/FilterPanel';
import { ExportOptions } from '@/components/ExportOptions';
import { TrendingUp, Check, MapPin, Zap, Mountain } from 'lucide-react';
import type { SearchParams, Parcel } from '@/types';

const MapComponent = dynamic(
  () => import('@/components/MapComponent').then(mod => ({ default: mod.MapComponent })),
  { ssr: false }
);

export default function Dashboard() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    lat: 19.0760,
    lng: 72.8777,
    radius: 50,
    capacity: 50,
    landPerMWAC: 3.0,
  });

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    maxSlope: 5,
    floodZoneSafe: true,
    roadAccess: true,
    clearTitle: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSearch = useCallback(async (params: SearchParams) => {
    setSearchParams(params);
    setLoading(true);

    try {
      const response = await fetch('/api/parcels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        setParcels(data.parcels || []);
      }
    } catch (error) {
      console.error('Error searching parcels:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch(searchParams);
  }, []);

  const filteredParcels = parcels.filter((parcel) => {
    if (filters.maxSlope && parcel.slope && parcel.slope > filters.maxSlope) return false;
    if (filters.floodZoneSafe && parcel.floodRisk === 'high') return false;
    if (filters.roadAccess && !parcel.roadAccess) return false;
    if (filters.clearTitle && !parcel.clearTitle) return false;
    return true;
  });

  const totalLandRequired = searchParams.capacity * searchParams.landPerMWAC;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: '#0f1419' }}>
      {/* ANIMATED SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? '380px' : '0px',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: sidebarOpen ? '0 20px 40px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div style={{ padding: '40px 28px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100vh', overflowY: 'auto' }}>
          {/* HEADER */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="white" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', letterSpacing: '0.3px' }}>SOLAR FINDER</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#000000', lineHeight: '1.2', letterSpacing: '-1px', marginBottom: '8px' }}>
              Find Your Solar Site
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Discover optimal land for solar farms</p>
          </div>

          {/* SEARCH SECTION */}
          <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <SearchInput onSearch={handleSearch} initialParams={searchParams} />
          </div>

          {/* LIVE STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(251, 191, 36, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>Capacity</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#1f2937' }}>{searchParams.capacity}</div>
              <div style={{ fontSize: '11px', color: '#a16207', marginTop: '2px' }}>MWAC</div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: '#d1fae5',
                border: '1px solid #a7f3d0',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '11px', color: '#065f46', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>Land Needed</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#1f2937' }}>{totalLandRequired.toFixed(0)}</div>
              <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>ACRES</div>
            </div>
          </div>

          {/* FILTERS SECTION */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>Smart Filters</h3>
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* EXPORT SECTION */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>Export Results</h3>
            <ExportOptions parcels={filteredParcels} searchParams={searchParams} />
          </div>

          {/* RESULTS BADGE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%)',
              fontSize: '13px',
              fontWeight: '700',
              color: '#4f46e5',
              border: '1px solid #c7d2fe',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            {filteredParcels.length} sites ready
          </div>
        </div>
      </div>

      {/* MAP AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#0f1419' }}>
        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '20px',
            left: sidebarOpen ? '400px' : '20px',
            zIndex: 20,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            color: '#1f2937',
            fontSize: '20px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
          }}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>

        <MapComponent
          searchParams={searchParams}
          parcels={filteredParcels}
          selectedParcel={selectedParcel}
          onParcelSelect={setSelectedParcel}
          totalLandRequired={totalLandRequired}
        />
      </div>

      {/* RIGHT PANEL - PARCEL DETAILS */}
      <div
        style={{
          width: selectedParcel ? '360px' : '0px',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e5e7eb',
          overflowY: 'auto',
          boxShadow: selectedParcel ? '-20px 0 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* STICKY HEADER */}
        {selectedParcel && (
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
            zIndex: 10,
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Selected Site</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>{selectedParcel.plotNumber}</div>
            </div>
            <button
              onClick={() => setSelectedParcel(null)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#e5e7eb',
                cursor: 'pointer',
                fontSize: '18px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
            >
              ✕
            </button>
          </div>
        )}

        {selectedParcel && (
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
            {/* HEADER */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MapPin size={14} style={{ color: '#f97316' }} />
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{selectedParcel.village}</span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#000000', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {selectedParcel.plotNumber}
              </h2>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>{selectedParcel.district}</p>
            </div>

            {/* VIABILITY SCORE */}
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)`,
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={20} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Viability Score</div>
                  <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '800' }}>{selectedParcel.viabilityScore.toFixed(0)}%</div>
                </div>
              </div>
              <div style={{ fontSize: '24px' }}>✨</div>
            </div>

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Area', value: selectedParcel.area.toFixed(1), unit: 'acres', icon: '📍' },
                { label: 'Distance', value: selectedParcel.distanceFromSubstation.toFixed(1), unit: 'km', icon: '⚡' },
                { label: 'Slope', value: selectedParcel.slope.toFixed(1), unit: '°', icon: '🏔️' },
                {
                  label: 'Flood Risk',
                  value: selectedParcel.floodRisk,
                  unit: '',
                  icon: selectedParcel.floodRisk === 'low' ? '✓' : '!',
                  color: selectedParcel.floodRisk === 'low' ? '#10b981' : selectedParcel.floodRisk === 'medium' ? '#f59e0b' : '#ef4444',
                },
              ].map((metric, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #f3f4f6',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{metric.icon}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '6px' }}>{metric.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: metric.color || '#1f2937' }}>
                    {metric.value}
                  </div>
                  {metric.unit && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{metric.unit}</div>}
                </div>
              ))}
            </div>

            {/* AMENITIES */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Amenities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedParcel.roadAccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #dbeafe' }}>
                    <Check size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>Road Access</span>
                  </div>
                )}
                {selectedParcel.clearTitle && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #dbeafe' }}>
                    <Check size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>Clear Title</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PARCEL LIST & EXPORT */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '160px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* EXPORT BUTTONS HEADER */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '8px', backgroundColor: '#f9fafb' }}>
          <ExportOptions parcels={filteredParcels} searchParams={searchParams} />
        </div>

        {/* PARCEL LIST */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
          <ParcelList
            parcels={filteredParcels}
            selectedParcel={selectedParcel}
            onParcelSelect={setSelectedParcel}
            loading={loading}
            totalLandRequired={totalLandRequired}
          />
        </div>
      </div>

      {/* GLOBAL STYLES */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
