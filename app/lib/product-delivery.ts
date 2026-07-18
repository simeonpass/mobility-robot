export type DeliveryStatus = 'in_stock' | 'preorder' | 'sold_out';

export type DeliveryInfo = {
  status: DeliveryStatus;
  headline: string;
  detail: string;
  etaLabel: string;
};

export function getPreorderDeliveryDate(from = new Date()): string {
  const deliveryDate = new Date(from);
  deliveryDate.setDate(deliveryDate.getDate() + 12 * 7);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(deliveryDate);
}

export function getDeliveryInfo({
  availableForSale,
  quantityAvailable,
}: {
  availableForSale: boolean;
  quantityAvailable?: number | null;
}): DeliveryInfo {
  if (!availableForSale) {
    return {
      status: 'sold_out',
      headline: 'Currently unavailable',
      detail: 'This model is out of stock.',
      etaLabel: 'Contact us for availability',
    };
  }

  const inStock =
    availableForSale && (quantityAvailable == null || quantityAvailable > 0);

  if (inStock) {
    return {
      status: 'in_stock',
      headline: 'In stock',
      detail: 'Free UK mainland delivery',
      etaLabel: 'Delivers in 5–7 working days',
    };
  }

  return {
    status: 'preorder',
    headline: 'Available to pre-order',
    detail: 'Reserve your place in the build queue',
    etaLabel: `Estimated delivery ${getPreorderDeliveryDate()}`,
  };
}

/** @deprecated Use getDeliveryInfo for structured UI */
export function getDeliveryEstimate({
  availableForSale,
  quantityAvailable,
}: {
  availableForSale: boolean;
  quantityAvailable?: number | null;
}): string {
  const info = getDeliveryInfo({availableForSale, quantityAvailable});
  if (info.status === 'sold_out') {
    return `${info.headline}. ${info.detail}`;
  }
  return `${info.headline}. ${info.etaLabel}.`;
}
