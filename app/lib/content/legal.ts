import type {ContentSection} from '~/lib/content/warranty-returns';

export const privacySections: ContentSection[] = [
  {
    id: 'controller',
    title: '1. Data controller',
    paragraphs: [
      'Bentech Medical Ltd is the data controller for personal data collected through mobilityrobot.co.uk. Registered address: Unit 2 Old Forge Road, Wimborne, Dorset BH21 7RR, United Kingdom.',
      'Contact: sales@bentchmeduk.com · 0208 050 4849',
    ],
  },
  {
    id: 'data-we-collect',
    title: '2. Data we collect',
    paragraphs: [
      'We collect information you provide when placing orders, creating a customer account, registering warranties, submitting contact, demo or return request forms, subscribing to our newsletter, or claiming VAT relief.',
      'This may include your name, delivery address, email, phone number, order and payment details (processed by Shopify), VAT declaration information, return reasons, and correspondence with our team.',
      'We also collect technical data such as IP address, browser type and pages visited via analytics cookies where you have consented.',
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How we use your data',
    paragraphs: [
      'We use your personal data to process orders, arrange delivery and engineer setup, manage warranty and return requests, respond to enquiries, comply with HMRC VAT relief requirements, improve our website, and send marketing communications where you have opted in.',
    ],
    listItems: [
      'Contract performance (order fulfilment, delivery and support)',
      'Legal obligation (tax, VAT and accounting records)',
      'Legitimate interests (fraud prevention, service improvement and dispute handling)',
      'Consent (newsletter and non-essential cookies)',
    ],
  },
  {
    id: 'sharing',
    title: '4. Sharing your data',
    paragraphs: [
      'We share data with Shopify (our e-commerce platform), payment processors, pallet and parcel couriers, engineer partners, and authorised warranty service partners only as necessary to fulfil your order, deliver products, or process a return or warranty claim.',
      'We do not sell your personal data to third parties.',
    ],
  },
  {
    id: 'retention',
    title: '5. Data retention',
    paragraphs: [
      'Order, VAT relief and accounting records are retained for seven years to meet HMRC requirements. Return and warranty records are retained for the duration of the claim and any applicable limitation period. Marketing preferences are kept until you unsubscribe. General enquiry records are retained for up to three years unless a longer period is required for legal claims.',
    ],
  },
  {
    id: 'your-rights',
    title: '6. Your rights',
    paragraphs: [
      'Under UK GDPR you have the right to access, rectify, erase, restrict processing, object, and data portability where applicable. You may withdraw consent and lodge a complaint with the Information Commissioner\'s Office (ico.org.uk).',
      'To exercise your rights, email sales@bentchmeduk.com with sufficient detail for us to identify your records.',
    ],
  },
  {
    id: 'cookies',
    title: '7. Cookies',
    paragraphs: [
      'We use essential cookies for cart, checkout and customer account functionality. Analytics and marketing cookies are used only with your consent. You can manage preferences through your browser settings or our cookie notice where shown.',
    ],
  },
  {
    id: 'security',
    title: '8. Security',
    paragraphs: [
      'Checkout and customer account authentication are handled by Shopify using industry-standard encryption. We take reasonable technical and organisational measures to protect personal data within our control.',
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. The latest version will always be published on this page. Material changes will be reflected in the effective date below.',
    ],
  },
];

export const termsSections: ContentSection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    paragraphs: [
      'These terms govern your use of mobilityrobot.co.uk and purchases from Bentech Medical Ltd, the official UK distributor of XSTO powered wheelchairs. By using this website or placing an order you agree to these terms.',
      'Bentech Medical Ltd trades as Mobility Robot. XSTO is a trademark of its manufacturer. We are not affiliated with XSTO Robot Technology Co., Ltd.',
    ],
  },
  {
    id: 'products',
    title: '2. Products & pricing',
    paragraphs: [
      'Product descriptions, specifications and images are provided for guidance. Prices include VAT unless HMRC VAT relief is applied at checkout. We reserve the right to correct pricing errors before accepting an order.',
      'Pre-order products require a deposit or full payment as stated on the product page. Estimated delivery dates are indicative and not guaranteed.',
    ],
  },
  {
    id: 'orders',
    title: '3. Orders & payment',
    paragraphs: [
      'Orders are subject to acceptance and availability. Payment is processed securely via Shopify checkout. Risk in the products passes to you on delivery. Title passes once payment is received in full.',
      'You are responsible for providing accurate delivery details and ensuring suitable access for pallet or engineer delivery.',
    ],
  },
  {
    id: 'delivery',
    title: '4. Delivery',
    paragraphs: [
      'Delivery methods, lead times and regional coverage are described on our Delivery page. Free UK mainland delivery applies to in-stock products unless stated otherwise on the product page.',
      'Delivery times are estimates only. You must inspect goods on delivery and report transit damage within 48 hours with photographs.',
      'Engineer delivery and setup is available in selected areas only, by prior arrangement and may incur additional charges.',
    ],
  },
  {
    id: 'returns',
    title: '5. Returns & cancellation',
    paragraphs: [
      'Your statutory rights under the Consumer Contracts Regulations 2013 are not affected. Our Returns Policy describes the 14-day cancellation period, condition requirements, £250 collection fee for large mobility items, and how to submit a return request through your account or by email.',
    ],
  },
  {
    id: 'vat-relief',
    title: '6. VAT relief',
    paragraphs: [
      'VAT relief is available to eligible individuals under HMRC rules. You must provide a truthful declaration. Bentech Medical Ltd may request supporting information and will report suspected fraud to HMRC.',
    ],
  },
  {
    id: 'warranty',
    title: '7. Warranty',
    paragraphs: [
      'Manufacturer warranty terms apply as described on our Warranty page. Warranty does not cover damage from misuse, unauthorised modification, or normal wear. Nothing in these terms affects your statutory consumer rights under UK law.',
    ],
  },
  {
    id: 'liability',
    title: '8. Limitation of liability',
    paragraphs: [
      'We are not liable for indirect or consequential loss. Our total liability for any claim relating to a product or service is limited to the purchase price of that product, except where liability cannot be excluded by law.',
    ],
  },
  {
    id: 'governing-law',
    title: '9. Governing law',
    paragraphs: [
      'These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales.',
    ],
  },
];
