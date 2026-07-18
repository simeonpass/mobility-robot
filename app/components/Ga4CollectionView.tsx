import {useEffect, useRef} from 'react';
import {toGa4Item, trackViewItemList} from '~/lib/analytics';
import {useConsent} from '~/components/ConsentBanner';

type CollectionProduct = {
  id: string;
  title: string;
  handle: string;
  priceAmount?: string;
};

export function Ga4CollectionView({
  listName,
  products,
  currencyCode = 'GBP',
}: {
  listName: string;
  products: CollectionProduct[];
  currencyCode?: string;
}) {
  const {analyticsAllowed} = useConsent();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsAllowed || products.length === 0) return;
    const key = `${listName}:${products.map((p) => p.id).join(',')}`;
    if (tracked.current === key) return;
    tracked.current = key;
    trackViewItemList(
      listName,
      products.map((product) =>
        toGa4Item({
          id: product.id,
          title: product.title,
          price: product.priceAmount,
        }),
      ),
      currencyCode,
    );
  }, [analyticsAllowed, currencyCode, listName, products]);

  return null;
}
