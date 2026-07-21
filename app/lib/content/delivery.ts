import type {ContentSection} from '~/lib/content/warranty-returns';

export const DELIVERY_METHODS = [
  {
    id: 'pallet',
    title: 'Pallet delivery',
    summary:
      'Full-size powered wheelchairs are delivered on a pallet by a specialist freight carrier.',
    details: [
      'Typical for M4, M4 Pro, M4B, X12 and X12 Pro orders.',
      'Kerbside or nearest safe point delivery — the driver will not carry the chair upstairs.',
      'You will need clear access (path, doorway width) and someone available to accept delivery.',
      'The chair remains secured on the pallet until you are ready to unpack and inspect it.',
    ],
  },
  {
    id: 'courier',
    title: 'Courier delivery',
    summary:
      'Smaller items — accessories, batteries, chargers and spare parts — ship by parcel courier.',
    details: [
      'Usually dispatched within 1–2 working days when in stock.',
      'Standard parcel service with tracking emailed after dispatch.',
      'UK mainland: £10 shipping on orders under £100; free from £100.',
      'May be combined with a chair order or purchased separately.',
    ],
  },
  {
    id: 'engineer',
    title: 'Engineer delivery & setup',
    summary:
      'In selected UK mainland areas we can arrange an engineer to deliver, unpack and set up your chair.',
    details: [
      'Includes basic setup, safety checks and a handover of controls — subject to availability.',
      'Not available in all postcodes. Contact us with your delivery postcode before ordering.',
      'May incur an additional fee depending on location and model — we will confirm in writing.',
      'Engineer delivery must be booked in advance; it is not automatically included with pallet delivery.',
    ],
  },
] as const;

export const DELIVERY_STEPS = [
  {
    title: 'Order confirmed',
    description:
      'You receive an order confirmation by email. Pre-order items show an estimated dispatch window on the product page.',
  },
  {
    title: 'Dispatch & tracking',
    description:
      'When your order leaves our warehouse we email tracking details (courier or pallet carrier as applicable).',
  },
  {
    title: 'Delivery day',
    description:
      'The carrier will contact you where possible to arrange a delivery window. Someone aged 18+ must be present to sign.',
  },
  {
    title: 'Inspect on arrival',
    description:
      'Check the packaging and product before signing. Report visible damage within 48 hours — see our delivery terms below.',
  },
] as const;

export const DELIVERY_REGIONS = [
  {
    region: 'UK mainland',
    detail:
      'Free delivery on orders of £100 or more (all XSTO chairs qualify). Orders under £100: £10 UK mainland shipping. M4, M4B and M4 Pro typically 3–4 working days; other in-stock models 5–7 working days.',
  },
  {
    region: 'Scottish Highlands & islands',
    detail: 'Delivered by pallet or courier. Extended lead times may apply — contact us for a quote before ordering.',
  },
  {
    region: 'Northern Ireland',
    detail: 'Delivered subject to carrier availability. Contact us for timescales and any surcharges.',
  },
  {
    region: 'Republic of Ireland',
    detail: 'Available on request. Duties, customs and delivery charges quoted separately.',
  },
] as const;

export const DELIVERY_ON_ARRIVAL = [
  'Check the outer packaging for damage before signing — note any issues on the carrier’s paperwork.',
  'Photograph damage to packaging and product if visible.',
  'Report transit damage to sales@bentechmeduk.com within 48 hours with photos and your order number.',
  'Retain all packaging until you are satisfied the product is correct and undamaged.',
  'Do not register your warranty or use the chair outdoors until you are sure you are keeping it.',
] as const;

export const deliverySections: ContentSection[] = [
  {
    id: 'lead-times',
    title: 'Lead times',
    paragraphs: [
      'In-stock M4, M4B and M4 Pro typically deliver within 3–4 working days to UK mainland addresses. Other in-stock models usually arrive within 5–7 working days. Pre-order models — including EzGo2, X12 and X12 Pro — ship when built; estimated lead times are shown on each product page.',
      'Mixed orders follow the longest lead time. Accessories ordered with a chair usually ship with the chair unless we agree otherwise.',
    ],
  },
  {
    id: 'access',
    title: 'Access & site requirements',
    paragraphs: [
      'Pallet deliveries require suitable vehicle access. Narrow lanes, steep drives or blocks to the delivery point must be disclosed when ordering.',
      'Standard doorways and paths must accommodate the packed chair dimensions. If access is restricted, contact us before ordering — engineer delivery may be appropriate in some areas.',
    ],
  },
  {
    id: 'failed-delivery',
    title: 'Failed or refused delivery',
    paragraphs: [
      'If delivery cannot be completed due to failed access, nobody present to sign, or refusal at the door, redelivery or storage charges may apply.',
      'Refusing delivery without contacting us first may affect your statutory cancellation rights — please speak to us if you have concerns before the carrier arrives.',
    ],
  },
  {
    id: 'vat-preorder',
    title: 'VAT relief & pre-orders',
    paragraphs: [
      'VAT relief is applied at checkout when you declare eligibility. Pre-order deposits and balance payments are due as stated on the product page before dispatch.',
    ],
  },
];
