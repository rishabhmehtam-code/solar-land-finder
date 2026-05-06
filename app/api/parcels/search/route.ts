import { NextRequest, NextResponse } from 'next/server';
import type { Parcel, SearchParams } from '@/types';

const MOCK_VILLAGES = [
  { name: 'Daund', lat: 19.0173, lng: 72.9842 },
  { name: 'Jejuri', lat: 19.0950, lng: 72.7733 },
  { name: 'Hadapsar', lat: 19.0176, lng: 73.0456 },
  { name: 'Koregaon', lat: 18.8567, lng: 73.1456 },
  { name: 'Mahabaleshwar', lat: 17.9256, lng: 73.6667 },
  { name: 'Panchgani', lat: 17.8878, lng: 73.7456 },
  { name: 'Karad', lat: 17.3046, lng: 73.5656 },
  { name: 'Walwa', lat: 17.2512, lng: 74.0567 },
];

const generateMockParcels = (
  searchLat: number,
  searchLng: number,
  radiusKm: number,
  count: number = 15
): Parcel[] => {
  const parcels: Parcel[] = [];

  MOCK_VILLAGES.forEach((village) => {
    const distance = haversineDistance(searchLat, searchLng, village.lat, village.lng);
    if (distance <= radiusKm) {
      const parcelCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < parcelCount; i++) {
        const offset = 0.01 * (Math.random() - 0.5);
        const lat = village.lat + offset;
        const lng = village.lng + offset;

        parcels.push({
          id: `parcel-${parcels.length + 1}`,
          plotNumber: `S${String(Math.floor(Math.random() * 9000) + 1000)}`,
          village: village.name,
          district: 'Pune',
          lat,
          lng,
          area: Math.random() * 30 + 10,
          distanceFromSubstation: haversineDistance(searchLat, searchLng, lat, lng),
          slope: Math.random() * 8,
          floodRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          roadAccess: Math.random() > 0.3,
          clearTitle: Math.random() > 0.4,
          ownership: Math.random() > 0.5 ? 'Government' : 'Private',
          landCost: Math.random() * 300000 + 100000,
          viabilityScore: Math.random() * 30 + 60,
          coordinates: {
            type: 'Polygon',
            coordinates: [[
              [lng - 0.002, lat - 0.002],
              [lng + 0.002, lat - 0.002],
              [lng + 0.002, lat + 0.002],
              [lng - 0.002, lat + 0.002],
            ]],
          },
        });
      }
    }
  });

  return parcels
    .sort((a, b) => b.viabilityScore - a.viabilityScore)
    .slice(0, count);
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json();

    if (!body.lat || !body.lng || !body.radius) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lng, radius' },
        { status: 400 }
      );
    }

    const parcels = generateMockParcels(body.lat, body.lng, body.radius, 20);

    const scoredParcels = parcels.map((parcel) => {
      let score = 70;
      score += Math.max(0, 15 - parcel.distanceFromSubstation);
      score += Math.max(0, 10 - parcel.slope);
      if (parcel.floodRisk === 'low') score += 5;
      else if (parcel.floodRisk === 'medium') score -= 5;
      else score -= 15;
      if (parcel.roadAccess) score += 5;
      if (parcel.clearTitle) score += 5;

      return {
        ...parcel,
        viabilityScore: Math.min(100, Math.max(0, score)),
      };
    });

    return NextResponse.json({
      success: true,
      parcels: scoredParcels,
      count: scoredParcels.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search parcels' },
      { status: 500 }
    );
  }
}
