'use client';

import React from 'react';
import { Check, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Parcel } from '@/types';

interface ParcelListProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onParcelSelect: (parcel: Parcel) => void;
  loading: boolean;
  totalLandRequired: number;
}

export function ParcelList({
  parcels,
  selectedParcel,
  onParcelSelect,
  loading,
  totalLandRequired,
}: ParcelListProps) {
  const sortedParcels = [...parcels].sort(
    (a, b) => b.viabilityScore - a.viabilityScore
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 mt-2">Searching parcels...</p>
        </div>
      </div>
    );
  }

  if (parcels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-600">
          <p className="text-sm">No parcels found. Try adjusting your search parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-3 p-4">
      {sortedParcels.slice(0, 10).map((parcel, index) => (
        <motion.div
          key={parcel.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onParcelSelect(parcel)}
          className={`flex-shrink-0 w-80 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            selectedParcel?.id === parcel.id
              ? 'bg-blue-50 border-blue-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-slate-900">{parcel.plotNumber}</p>
              <p className="text-xs text-slate-600">{parcel.village}, {parcel.district}</p>
            </div>
            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded text-xs font-semibold text-green-700">
              <TrendingUp className="w-3 h-3" />
              {parcel.viabilityScore}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="bg-slate-50 p-2 rounded">
              <span className="text-slate-600">Area</span>
              <p className="font-semibold text-slate-900">{parcel.area.toFixed(1)} acres</p>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="text-slate-600">Distance</span>
              <p className="font-semibold text-slate-900">{parcel.distanceFromSubstation.toFixed(1)} km</p>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="text-slate-600">Slope</span>
              <p className="font-semibold text-slate-900">{parcel.slope.toFixed(1)}°</p>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="text-slate-600">Flood Risk</span>
              <p className={`font-semibold ${
                parcel.floodRisk === 'low' ? 'text-green-600' : parcel.floodRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {parcel.floodRisk}
              </p>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            {parcel.roadAccess && (
              <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded">
                <Check className="w-3 h-3" />
                Road Access
              </div>
            )}
            {parcel.clearTitle && (
              <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded">
                <Check className="w-3 h-3" />
                Clear Title
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
