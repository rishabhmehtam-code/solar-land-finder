'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SearchInput } from '@/components/SearchInput';
import { ParcelList } from '@/components/ParcelList';
import { FilterPanel } from '@/components/FilterPanel';
import { ExportOptions } from '@/components/ExportOptions';
import { TrendingUp, Check } from 'lucide-react';
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
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: '#ffffff' }}>
      {/* LEFT SIDEBAR - Search & Filters - Apple Style */}
      <div style={{ width: '340px', display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#ffffff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#000000', letterSpacing: '-0.5px' }}>Find Solar Sites</h2>
            <SearchInput onSearch={handleSearch} initialParams={searchParams} />
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#6f6f6f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#6f6f6f' }}>Capacity</span>
                <span style={{ fontWeight: '600', color: '#000000' }}>{searchParams.capacity} MWAC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#6f6f6f' }}>Land Ratio</span>
                <span style={{ fontWeight: '600', color: '#000000' }}>{searchParams.landPerMWAC} ac/MW</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ color: '#6f6f6f', fontWeight: '500' }}>Land Required</span>
                <span style={{ fontWeight: '700', color: '#0071e3', fontSize: '15px' }}>{totalLandRequired.toFixed(0)} acres</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#6f6f6f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferences</h3>
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #f5f5f5' }}>
            <ExportOptions parcels={filteredParcels} searchParams={searchParams} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '10px', fontSize: '13px', fontWeight: '500', color: '#555555' }}>
            {filteredParcels.length} <span style={{ marginLeft: '4px' }}>sites found</span>
          </div>
        </div>
      </div>

      {/* CENTER - MAP */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
        <MapComponent
          searchParams={searchParams}
          parcels={filteredParcels}
          selectedParcel={selectedParcel}
          onParcelSelect={setSelectedParcel}
          totalLandRequired={totalLandRequired}
        />
      </div>

      {/* RIGHT SIDEBAR - Selected Parcel Details */}
      <div style={{ width: '300px', backgroundColor: '#ffffff', borderLeft: '1px solid #f0f0f0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {selectedParcel ? (
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6f6f6f', marginBottom: '4px' }}>{selectedParcel.village}</div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#000000', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                {selectedParcel.plotNumber}
              </h3>
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                {selectedParcel.district}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f8f0', padding: '12px 14px', borderRadius: '10px' }}>
              <TrendingUp size={16} style={{ color: '#34c759' }} />
              <span style={{ fontWeight: '600', color: '#34c759', fontSize: '14px' }}>{selectedParcel.viabilityScore.toFixed(0)}% Viable Site</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px', backgroundColor: '#f5f5f5', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ color: '#999999', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Area</div>
                <div style={{ fontWeight: '700', color: '#000000', fontSize: '16px' }}>{selectedParcel.area.toFixed(1)}</div>
                <div style={{ color: '#999999', fontSize: '10px', marginTop: '2px' }}>acres</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#f5f5f5', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ color: '#999999', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Distance</div>
                <div style={{ fontWeight: '700', color: '#000000', fontSize: '16px' }}>{selectedParcel.distanceFromSubstation.toFixed(1)}</div>
                <div style={{ color: '#999999', fontSize: '10px', marginTop: '2px' }}>km</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#f5f5f5', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ color: '#999999', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Slope</div>
                <div style={{ fontWeight: '700', color: '#000000', fontSize: '16px' }}>{selectedParcel.slope.toFixed(1)}°</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: '#f5f5f5', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ color: '#999999', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Flood</div>
                <div style={{ fontWeight: '700', color: selectedParcel.floodRisk === 'low' ? '#34c759' : selectedParcel.floodRisk === 'medium' ? '#ff9500' : '#ff3b30', fontSize: '14px' }}>
                  {selectedParcel.floodRisk}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
              {selectedParcel.roadAccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: '#f0f8f0', borderRadius: '10px', fontSize: '13px', color: '#34c759', fontWeight: '600' }}>
                  <Check size={16} />
                  Road Access
                </div>
              )}
              {selectedParcel.clearTitle && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: '#f0f8f0', borderRadius: '10px', fontSize: '13px', color: '#34c759', fontWeight: '600' }}>
                  <Check size={16} />
                  Clear Title
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px 20px', textAlign: 'center', color: '#999999', fontSize: '14px', flexDirection: 'column' }}>
            <MapPin size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
            Click a site on the map
          </div>
        )}
      </div>

      {/* BOTTOM - Parcel List */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '130px', backgroundColor: '#ffffff', borderTop: '1px solid #f0f0f0', overflowY: 'auto', zIndex: 10 }}>
        <ParcelList
          parcels={filteredParcels}
          selectedParcel={selectedParcel}
          onParcelSelect={setSelectedParcel}
          loading={loading}
          totalLandRequired={totalLandRequired}
        />
      </div>
    </div>
  );
}
