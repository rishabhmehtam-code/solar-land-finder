'use client';

import React from 'react';
import type { FilterState } from '@/types';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleToggle = (key: keyof FilterState) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const handleSliderChange = (key: keyof FilterState, value: number) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">
          Max Slope: <span className="text-blue-600">{filters.maxSlope}°</span>
        </label>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={filters.maxSlope}
          onChange={(e) => handleSliderChange('maxSlope', Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="floodZone"
          checked={filters.floodZoneSafe}
          onChange={() => handleToggle('floodZoneSafe')}
          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
        />
        <label htmlFor="floodZone" className="text-xs font-medium text-slate-700 cursor-pointer">
          Flood Zone Safe
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="roadAccess"
          checked={filters.roadAccess}
          onChange={() => handleToggle('roadAccess')}
          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
        />
        <label htmlFor="roadAccess" className="text-xs font-medium text-slate-700 cursor-pointer">
          Road Access Required
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="clearTitle"
          checked={filters.clearTitle}
          onChange={() => handleToggle('clearTitle')}
          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
        />
        <label htmlFor="clearTitle" className="text-xs font-medium text-slate-700 cursor-pointer">
          Clear Title Only
        </label>
      </div>
    </div>
  );
}
