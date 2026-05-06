'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SearchParams, Parcel } from '@/types';

interface MapComponentProps {
  searchParams: SearchParams;
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onParcelSelect: (parcel: Parcel) => void;
  totalLandRequired: number;
}

export function MapComponent({
  searchParams,
  parcels,
  selectedParcel,
  onParcelSelect,
  totalLandRequired,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([searchParams.lat, searchParams.lng], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    mapRef.current.setView([searchParams.lat, searchParams.lng], 10);

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (circleRef.current) {
      circleRef.current.remove();
    }

    circleRef.current = L.circle([searchParams.lat, searchParams.lng], {
      color: '#3b82f6',
      fill: true,
      fillColor: '#dbeafe',
      fillOpacity: 0.1,
      weight: 2,
      radius: searchParams.radius * 1000,
    }).addTo(mapRef.current);

    L.circleMarker([searchParams.lat, searchParams.lng], {
      color: '#dc2626',
      fill: true,
      fillColor: '#ef4444',
      fillOpacity: 1,
      radius: 8,
      weight: 2,
    })
      .addTo(mapRef.current)
      .bindPopup('Substation<br />Search Center');

    parcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;
      const markerColor = isSelected ? '#2563eb' : '#f59e0b';

      const marker = L.circleMarker([parcel.lat, parcel.lng], {
        color: markerColor,
        fill: true,
        fillColor: markerColor,
        fillOpacity: 0.8,
        radius: isSelected ? 10 : 6,
        weight: 2,
      }).addTo(mapRef.current!);

      marker.on('click', () => onParcelSelect(parcel));

      marker.bindPopup(
        `<div class="text-sm">
          <p class="font-semibold">${parcel.plotNumber}</p>
          <p class="text-xs text-slate-600">${parcel.village}, ${parcel.district}</p>
          <p class="text-xs">Area: ${parcel.area.toFixed(1)} acres</p>
          <p class="text-xs">Distance: ${parcel.distanceFromSubstation.toFixed(1)} km</p>
        </div>`
      );

      markersRef.current.push(marker);
    });
  }, [searchParams, parcels, selectedParcel, onParcelSelect]);

  return (
    <div id="map" className="w-full h-full" />
  );
}
