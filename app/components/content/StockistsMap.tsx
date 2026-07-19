import {useEffect, useRef, useState} from 'react';
import type {Dealer} from '~/lib/dealers';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type StockistsMapProps = {
  dealers: Dealer[];
  selectedDealerId?: string | null;
  onSelectDealer?: (dealer: Dealer) => void;
  searchOrigin?: {lat: number; lng: number} | null;
};

/** Soft pan limit: British Isles + nearby seas (includes NI, Scotland, ROI). */
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [48.8, -12.5],
  [61.5, 3.5],
];

/** Initial UK-focused view before markers fit (England/Scotland/Wales/NI + Dublin). */
const UK_FOCUS_BOUNDS: [[number, number], [number, number]] = [
  [50.5, -7.5],
  [56.3, 1.6],
];

function dealersBounds(
  dealers: Dealer[],
): [[number, number], [number, number]] | null {
  if (dealers.length === 0) return null;

  let minLat = dealers[0].lat;
  let maxLat = dealers[0].lat;
  let minLng = dealers[0].lng;
  let maxLng = dealers[0].lng;

  for (const dealer of dealers) {
    minLat = Math.min(minLat, dealer.lat);
    maxLat = Math.max(maxLat, dealer.lat);
    minLng = Math.min(minLng, dealer.lng);
    maxLng = Math.max(maxLng, dealer.lng);
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

export function StockistsMap({
  dealers,
  selectedDealerId,
  onSelectDealer,
  searchOrigin,
}: StockistsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectDealer);
  onSelectRef.current = onSelectDealer;
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = await import('leaflet');

      if (cancelled || !containerRef.current) return;

      // Vite breaks Leaflet's default icon paths — set them explicitly.
      const DefaultIcon = L.Icon.Default as typeof L.Icon.Default & {
        prototype: {_getIconUrl?: unknown};
      };
      delete DefaultIcon.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
      });

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        minZoom: 5,
        maxBounds: MAX_BOUNDS,
        maxBoundsViscosity: 0.65,
      }).fitBounds(UK_FOCUS_BOUNDS, {padding: [16, 16], maxZoom: 7});

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      const syncSize = () => {
        map.invalidateSize({animate: false});
      };

      syncSize();
      requestAnimationFrame(syncSize);

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(syncSize);
        resizeObserver.observe(containerRef.current);
      }

      if (!cancelled) setMapReady(true);
    }

    void initMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = markersRef.current;
    if (!mapReady || !map || !layerGroup) return;

    void import('leaflet').then((L) => {
      if (!mapRef.current || !markersRef.current) return;

      layerGroup.clearLayers();

      dealers.forEach((dealer) => {
        const marker = L.marker([dealer.lat, dealer.lng]);
        marker.bindPopup(
          `<strong>${dealer.name}</strong><br>${dealer.city}<br>${dealer.postcode}`,
        );
        marker.on('click', () => onSelectRef.current?.(dealer));
        layerGroup.addLayer(marker);
      });
    });
  }, [dealers, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    if (selectedDealerId) {
      const dealer = dealers.find((entry) => entry.name === selectedDealerId);
      if (dealer) {
        map.setView([dealer.lat, dealer.lng], 10, {animate: true});
        return;
      }
    }

    if (searchOrigin) {
      map.setView([searchOrigin.lat, searchOrigin.lng], 8, {animate: true});
      return;
    }

    const bounds = dealersBounds(dealers);
    if (bounds) {
      map.fitBounds(bounds, {padding: [28, 28], maxZoom: 8, animate: false});
    }
  }, [dealers, mapReady, searchOrigin, selectedDealerId]);

  return (
    <div
      aria-label="UK dealer map"
      className="relative z-0 h-full min-h-[280px] w-full overflow-hidden rounded-xl border border-border bg-secondary"
      role="region"
    >
      <div className="h-full w-full" ref={containerRef} />
    </div>
  );
}
