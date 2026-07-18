import rawDealers from '~/data/dealers.json';

export type Dealer = {
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  lat: number;
  lng: number;
  hours: string;
  is_authorized: boolean;
  offers_demo: boolean;
  regions?: string[];
};

const REGION_OVERRIDES: Record<string, string[]> = {
  'TravelMobility Ltd.': ['North West', 'North Wales', 'West Yorkshire'],
};

export const DEALERS: Dealer[] = (rawDealers as Dealer[]).map((dealer) => ({
  ...dealer,
  regions: REGION_OVERRIDES[dealer.name],
}));

export function getDirectionsUrl(dealer: Dealer): string {
  const query = encodeURIComponent(
    `${dealer.address}, ${dealer.city}, ${dealer.postcode}`,
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}
