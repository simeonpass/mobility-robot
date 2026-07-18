import {useEffect} from 'react';
import {useLocation} from 'react-router';
import {useConsent} from '~/components/ConsentBanner';

function shouldHideChat(pathname: string): boolean {
  if (pathname.startsWith('/account')) return true;
  if (pathname.startsWith('/checkout')) return true;
  return false;
}

export function ShopChat({shopId}: {shopId?: string | null}) {
  const location = useLocation();
  const {consent} = useConsent();

  const marketingAllowed =
    consent.choice === 'granted' && consent.preferences.marketing;

  useEffect(() => {
    if (!shopId || !marketingAllowed) return;
    if (shouldHideChat(location.pathname)) return;
    if (document.getElementById('shop-chat-script')) return;

    const script = document.createElement('script');
    script.id = 'shop-chat-script';
    script.async = true;
    script.src = 'https://cdn.shopify.com/shopifycloud/shop-js/client.js';
    script.setAttribute('data-shop-id', shopId);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [location.pathname, marketingAllowed, shopId]);

  return null;
}
