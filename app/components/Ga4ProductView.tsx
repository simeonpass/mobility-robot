import {useEffect, useRef} from 'react';
import {toGa4Item, trackViewItem} from '~/lib/analytics';
import {useConsent} from '~/components/ConsentBanner';

type Ga4ProductViewProps = {
  id: string;
  title: string;
  price: string;
  currencyCode: string;
  vendor?: string;
};

export function Ga4ProductView({
  id,
  title,
  price,
  currencyCode,
  vendor,
}: Ga4ProductViewProps) {
  const {analyticsAllowed} = useConsent();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsAllowed) return;
    const key = `${id}:${price}`;
    if (tracked.current === key) return;
    tracked.current = key;
    trackViewItem(
      toGa4Item({id, title, price, vendor}),
      currencyCode,
    );
  }, [analyticsAllowed, currencyCode, id, price, title, vendor]);

  return null;
}
