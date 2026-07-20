export type ContentSection = {
  id: string;
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

export const warrantySections: ContentSection[] = [
  {
    id: 'overview',
    title: 'Warranty overview',
    paragraphs: [
      'All XSTO powered wheelchairs sold in the UK through Bentech Medical Ltd include the manufacturer warranty below. Bentech Medical Ltd, as the official UK distributor, manages warranty registration and claims on your behalf.',
    ],
  },
  {
    id: 'frame',
    title: '5-year frame warranty',
    paragraphs: [
      'The main frame and base seat structure are covered for five years from the date of purchase against defects in materials and workmanship under normal domestic use.',
    ],
    listItems: [
      'Covers structural frame components and base seat assembly',
      'Does not cover damage from misuse, accidents or unauthorised modifications',
      'Proof of purchase required for all claims',
    ],
  },
  {
    id: 'electrical',
    title: '1-year electrical & mechanical warranty',
    paragraphs: [
      'Electrical and mechanical components — including motors, controllers, joysticks, sensors and wiring — are covered for one year from purchase.',
    ],
    listItems: [
      'Covers manufacturing defects under normal use',
      'Excludes wear items such as tyres unless defective on arrival',
      'Repairs or replacements at Bentech Medical Ltd discretion',
    ],
  },
  {
    id: 'battery',
    title: '1-year battery warranty',
    paragraphs: [
      'The supplied battery is covered for one year against manufacturing defects. Battery capacity naturally reduces over time and is not covered beyond the stated warranty period.',
    ],
  },
  {
    id: 'claims',
    title: 'Making a claim',
    paragraphs: [
      'Contact sales@bentchmeduk.com or call 0208 050 4849 with your order number, serial number and a description of the issue. Photos or video help us assess claims quickly. Do not attempt repairs that may void your warranty.',
    ],
  },
];

export const returnsSections: ContentSection[] = [
  {
    id: 'statutory',
    title: '14-day statutory returns',
    paragraphs: [
      'Under the Consumer Contracts Regulations 2013, you have 14 days from delivery to cancel your order and return most goods purchased online, provided the item is unused and in resalable condition.',
    ],
  },
  {
    id: 'conditions',
    title: 'Condition requirements',
    paragraphs: [
      'Returned mobility products must be unused, in original packaging where possible, and free from damage beyond reasonable inspection. We may deduct from your refund if the product shows signs of use beyond checking fit and function.',
    ],
    listItems: [
      'Notify us in writing within 14 days of delivery',
      'Do not use the product outdoors or register it before deciding to return',
      'Include all accessories, manuals and original packaging',
    ],
  },
  {
    id: 'collection-fee',
    title: '£250 collection fee',
    paragraphs: [
      'Due to the size and weight of powered wheelchairs, a £250 collection fee applies to returns of large mobility items. This covers specialist courier collection and inspection. The fee is deducted from your refund unless the return is due to our error or a manufacturing defect.',
    ],
  },
  {
    id: 'exclusions',
    title: 'Exclusions',
    paragraphs: [
      'The following are excluded from our standard returns policy:',
    ],
    listItems: [
      'Bespoke or custom-configured products built to your specification',
      'Hygiene-related items where seals have been broken',
      'Products damaged through misuse, neglect or unauthorised modification',
      'Pre-order deposits once manufacturing has commenced (subject to separate terms)',
    ],
  },
  {
    id: 'online-returns',
    title: 'Request a return online',
    paragraphs: [
      'Signed-in customers can submit a return request from their order history. Sign in, open the order, and choose Request a return. We review each request against this policy and confirm next steps by email — including specialist collection for large items where applicable.',
      'Shopify does not provide a built-in self-serve returns flow for custom Hydrogen storefronts. We use a return request system: your submission creates a case for our team, who process the return in Shopify Admin and arrange collection.',
      'If you checked out as a guest, email sales@bentchmeduk.com with your order number and reason for return.',
    ],
  },
  {
    id: 'process',
    title: 'What happens next',
    paragraphs: [
      'Once your return is approved we arrange collection (pallet or courier as appropriate). Refunds are processed within 14 days of receiving and inspecting the returned item. The £250 collection fee applies to large mobility returns unless the return is due to our error or a manufacturing defect.',
    ],
    listItems: [
      'Submit your return request online or by email within 14 days of delivery',
      'Wait for written confirmation before arranging your own courier',
      'Keep the product unused and in resalable condition until collection',
      'Include accessories, manuals and packaging where possible',
    ],
  },
];
