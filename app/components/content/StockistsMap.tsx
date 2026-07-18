import {useEffect, useRef} from 'react';
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
      }).setView([54.5, -3.5], 6);

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
    }

    void initMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = markersRef.current;
    if (!map || !layerGroup) return;

    void import('leaflet').then((L) => {
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
  }, [dealers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedDealerId) {
      const dealer = dealers.find((entry) => entry.name === selectedDealerId);
      if (dealer) {
        map.setView([dealer.lat, dealer.lng], 10, {animate: true});
        return;
      }
    }

    if (searchOrigin) {
      map.setView([searchOrigin.lat, searchOrigin.lng], 8, {animate: true});
    }
  }, [dealers, searchOrigin, selectedDealerId]);

  return (
    <div
      aria-label="UK dealer map"
      className="relative z-0 h-[320px] min-h-[320px] overflow-hidden rounded-xl border border-border bg-secondary md:h-[520px] md:min-h-[520px]"
      ref={containerRef}
      role="img"
    />
  );
}
