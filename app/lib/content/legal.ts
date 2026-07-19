import type {ContentSection} from '~/lib/content/warranty-returns';

export const privacySections: ContentSection[] = [
  {
    id: 'controller',
    title: '1. Data controller',
    paragraphs: [
      'Bentech Medical Ltd (Company registration details available on request) is the data controller for personal data collected through mobilityrobot.co.uk. Registered address: Unit 2 Old Forge Road, Wimborne, Dorset BH21 7RR, United Kingdom.',
      'Contact: support@mobilityrobot.co.uk · 0208 050 4849',
    ],
  },
  {
    id: 'data-we-collect',
    title: '2. Data we collect',
    paragraphs: [
      'We collect information you provide when placing orders, registering warranties, submitting contact or demo forms, subscribing to our newsletter, or claiming VAT relief. This may include your name, address, email, phone number, order details, VAT declaration information, and correspondence.',
      'We also collect technical data such as IP address, browser type and pages visited via analytics cookies where you have consented.',
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How we use your data',
    paragraphs: [
      'We use your personal data to process orders, deliver products, manage warranty claims, respond to enquiries, comply with HMRC VAT relief requirements, improve our website, and send marketing communications where you have opted in.',
    ],
    listItems: [
      'Contract performance (order fulfilment and support)',
      'Legal obligation (tax and VAT records)',
      'Legitimate interests (fraud prevention and service improvement)',
      'Consent (newsletter and non-essential cookies)',
    ],
  },
  {
    id: 'sharing',
    title: '4. Sharing your data',
    paragraphs: [
      'We share data with Shopify (our e-commerce platform), payment processors, delivery couriers, and authorised service partners only as necessary to fulfil your order or warranty claim. We do not sell your personal data.',
    ],
  },
  {
    id: 'retention',
    title: '5. Data retention',
    paragraphs: [
      'Order and VAT relief records are retained for seven years to meet HMRC requirements. Marketing preferences are kept until you unsubscribe. Enquiry records are retained for up to three years unless a longer period is required for legal claims.',
    ],
  },
  {
    id: 'your-rights',
    title: '6. Your rights',
    paragraphs: [
      'Under UK GDPR you have the right to access, rectify, erase, restrict processing, object, and data portability. You may also withdraw consent and lodge a complaint with the Information Commissioner\'s Office (ico.org.uk).',
      'To exercise your rights, email support@mobilityrobot.co.uk.',
    ],
  },
  {
    id: 'cookies',
    title: '7. Cookies',
    paragraphs: [
      'We use essential cookies for cart and checkout functionality. Analytics and marketing cookies are used only with your consent. You can manage preferences through your browser settings.',
    ],
  },
  {
    id: 'changes',
    title: '8. Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. The latest version will always be published on this page with an updated effective date.',
    ],
  },
];

export const termsSections: ContentSection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    paragraphs: [
      'These terms govern your use of mobilityrobot.co.uk and purchases from Bentech Medical Ltd, the official UK distributor of XSTO powered wheelchairs. By using this website or placing an order you agree to these terms.',
    ],
  },
  {
    id: 'products',
    title: '2. Products & pricing',
    paragraphs: [
      'Product descriptions, specifications and images are provided for guidance. Prices include VAT unless VAT relief is applied at checkout. We reserve the right to correct pricing errors before accepting an order.',
      'Pre-order products require a deposit as stated on the product page. Estimated delivery dates are indicative and not guaranteed.',
    ],
  },
  {
    id: 'orders',
    title: '3. Orders & payment',
    paragraphs: [
      'Orders are subject to acceptance and availability. Payment is processed securely via Shopify checkout. Risk passes to you on delivery. Title passes once payment is received in full.',
    ],
  },
  {
    id: 'delivery',
    title: '4. Delivery',
    paragraphs: [
      'Free UK mainland delivery applies to in-stock products unless stated otherwise. Delivery times are estimates. You must inspect goods on delivery and report damage within 48 hours.',
    ],
  },
  {
    id: 'vat-relief',
    title: '5. VAT relief',
    paragraphs: [
      'VAT relief is available to eligible individuals under HMRC rules. You must provide a truthful declaration. Bentech Medical Ltd may request supporting information and will report suspected fraud to HMRC.',
    ],
  },
  {
    id: 'warranty',
    title: '6. Warranty',
    paragraphs: [
      'Manufacturer warranty terms apply as described on our Warranty page. Nothing in these terms affects your statutory consumer rights under UK law.',
    ],
  },
  {
    id: 'liability',
    title: '7. Limitation of liability',
    paragraphs: [
      'We are not liable for indirect or consequential loss. Our total liability for any claim relating to a product or service is limited to the purchase price of that product, except where liability cannot be excluded by law.',
    ],
  },
  {
    id: 'governing-law',
    title: '8. Governing law',
    paragraphs: [
      'These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales.',
    ],
  },
];
