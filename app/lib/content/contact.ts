import {COMPANY} from '~/lib/site-navigation';

export const CONTACT_INFO = {
  email: COMPANY.email,
  phone: COMPANY.phone,
  phoneHref: COMPANY.phoneHref,
  address: `${COMPANY.address}, ${COMPANY.city}, ${COMPANY.postcode}`,
  hours: 'Monday–Friday, 9:00am–5:30pm (UK time)',
  responseTime: 'We aim to reply within one business day',
  mapEmbed:
    'https://www.openstreetmap.org/export/embed.html?bbox=-1.995%2C50.795%2C-1.970%2C50.810&layer=mapnik&marker=50.802%2C-1.983',
  mapLink:
    'https://www.openstreetmap.org/?mlat=50.802&mlon=-1.983#map=16/50.802/-1.983',
} as const;

export const CONTACT_TOPICS = [
  'Product advice',
  'Order or delivery',
  'VAT relief',
  'Warranty or parts',
  'Demo booking',
  'Trade or stockist',
  'Something else',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_HELP_LINKS = [
  {
    title: 'Book a demo',
    description: 'Try an XSTO chair in Dorset or London before you buy.',
    url: '/demo',
  },
  {
    title: 'Find a stockist',
    description: 'Authorised partners across the UK and Ireland.',
    url: '/stockists',
  },
  {
    title: 'Warranty support',
    description: 'Register your chair or start a warranty enquiry.',
    url: '/warranty',
  },
  {
    title: 'Request a quote',
    description: 'Trade, bulk or care-provider pricing.',
    url: '/quote',
  },
] as const;

export const CONTACT_FAQS = [
  {
    question: 'How quickly will you reply?',
    answer:
      'We aim to respond to phone, email and form enquiries within one business day during Monday–Friday, 9:00am–5:30pm (UK time). Urgent order or warranty issues are prioritised.',
  },
  {
    question: 'Should I call, email or use the form?',
    answer:
      'Use the form for a written record (include your order reference if you have one). Call for time-sensitive delivery or warranty questions. Email works well for documents, photos or serial numbers.',
  },
  {
    question: 'Can I visit your Wimborne office?',
    answer:
      'Yes — by appointment. Book a demo or contact us first so we can arrange the right chair and a suitable time. We are at Unit 2 Old Forge Road, Wimborne, Dorset BH21 7RR.',
  },
  {
    question: 'Who do I contact about VAT relief?',
    answer:
      'Declare eligibility on the product page or in your cart — VAT is removed at checkout. For eligibility questions, see our VAT relief page or mention VAT relief in your message and we will guide you.',
  },
  {
    question: 'How do I track an order or request a return?',
    answer:
      'Signed-in customers can view orders under Account. For tracking help, returns or damage in transit, contact us with your order reference — or start from our returns policy page.',
  },
] as const;
