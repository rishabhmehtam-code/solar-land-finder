export interface SearchParams {
  lat: number;
  lng: number;
  radius: number;
  capacity: number;
  landPerMWAC: number;
  location?: string;
}

export interface Parcel {
  id: string;
  plotNumber: string;
  village: string;
  district: string;
  lat: number;
  lng: number;
  area: number;
  distanceFromSubstation: number;
  slope: number;
  floodRisk: 'low' | 'medium' | 'high';
  roadAccess: boolean;
  clearTitle: boolean;
  ownership?: string;
  landCost?: number;
  viabilityScore: number;
  coordinates: {
    type: string;
    coordinates: [number, number][];
  };
}

export interface FilterState {
  maxSlope: number;
  floodZoneSafe: boolean;
  roadAccess: boolean;
  clearTitle: boolean;
}
