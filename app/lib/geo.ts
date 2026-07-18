import type {Dealer} from '~/lib/dealers';

export type GeoPoint = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export type RankedDealer = Dealer & {distanceKm: number};

export function sortDealersByDistance(
  dealers: Dealer[],
  origin: GeoPoint,
): RankedDealer[] {
  return dealers
    .map((dealer) => ({
      ...dealer,
      distanceKm: haversineDistanceKm(origin, {lat: dealer.lat, lng: dealer.lng}),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function geocodePostcode(
  query: string,
): Promise<GeoPoint | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toUpperCase().replace(/\s+/g, ' ');

  // Try structured UK/IE postcode lookup first, then free-text fallback.
  const attempts = [
    new URL('https://nominatim.openstreetmap.org/search'),
    new URL('https://nominatim.openstreetmap.org/search'),
  ];

  attempts[0].searchParams.set('format', 'json');
  attempts[0].searchParams.set('postalcode', normalized);
  attempts[0].searchParams.set('countrycodes', 'gb,ie');
  attempts[0].searchParams.set('limit', '1');

  attempts[1].searchParams.set('format', 'json');
  attempts[1].searchParams.set('countrycodes', 'gb,ie');
  attempts[1].searchParams.set('limit', '1');
  attempts[1].searchParams.set('q', normalized);

  for (const url of attempts) {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'XSTO UK Hydrogen Storefront (support@xsto.co.uk)',
      },
    });

    if (!response.ok) continue;

    const results = (await response.json()) as NominatimResult[];
    const first = results[0];
    if (!first) continue;

    return {
      lat: Number(first.lat),
      lng: Number(first.lon),
    };
  }

  return null;
}
