'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SearchInput } from '@/components/SearchInput';
import { MapComponent } from '@/components/MapComponent';
import { ParcelList } from '@/components/ParcelList';
import { FilterPanel } from '@/components/FilterPanel';
import { ExportOptions } from '@/components/ExportOptions';
import { motion } from 'framer-motion';
import type { SearchParams, Parcel } from '@/types';

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
    <div className="flex-1 flex overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Search Location</h2>
            <SearchInput onSearch={handleSearch} initialParams={searchParams} />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Project Parameters</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Capacity (MWAC):</span>
                <span className="font-semibold text-slate-900">{searchParams.capacity} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Land per MWAC:</span>
                <span className="font-semibold text-slate-900">{searchParams.landPerMWAC} acres</span>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total Land Needed:</span>
                  <span className="font-bold text-blue-600">{totalLandRequired.toFixed(1)} acres</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Filters</h2>
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Export</h2>
            <ExportOptions parcels={filteredParcels} searchParams={searchParams} />
          </div>

          <div className="text-xs text-slate-600 bg-slate-100 rounded p-2">
            Found <span className="font-semibold">{filteredParcels.length}</span> viable parcels
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 bg-slate-100"
        >
          <MapComponent
            searchParams={searchParams}
            parcels={filteredParcels}
            selectedParcel={selectedParcel}
            onParcelSelect={setSelectedParcel}
            totalLandRequired={totalLandRequired}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-48 bg-white border-t border-slate-200 overflow-y-auto"
        >
          <ParcelList
            parcels={filteredParcels}
            selectedParcel={selectedParcel}
            onParcelSelect={setSelectedParcel}
            loading={loading}
            totalLandRequired={totalLandRequired}
          />
        </motion.div>
      </div>
    </div>
  );
}
