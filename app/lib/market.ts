export type StoreCountry = 'GB' | 'BG';

export function storeCountry(value: unknown): StoreCountry | null {
  if (typeof value !== 'string') return null;
  const country = value.toUpperCase();
  return country === 'GB' || country === 'BG' ? country : null;
}

export function requestCountry(url: URL, savedCountry?: unknown): StoreCountry {
  return (
    storeCountry(url.searchParams.get('country')) ??
    (url.pathname.startsWith('/feeds/') ? null : storeCountry(savedCountry)) ??
    'GB'
  );
}

export function marketProductUrl(link: string, country: StoreCountry): string {
  const url = new URL(link);
  url.searchParams.set('country', country);
  url.searchParams.set('currency', country === 'BG' ? 'EUR' : 'GBP');
  return url.toString();
}
