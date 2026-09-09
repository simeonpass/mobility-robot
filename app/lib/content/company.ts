import {COMPANY} from '~/lib/site-navigation';

export const ABOUT_VALUE_PROPS = [
  {
    title: 'Real advice. From real people.',
    description:
      'Talk through your daily routine with Bentech Medical, the official UK distributor of XSTO. We will help you understand the differences between models.',
  },
  {
    title: 'Try the technology for yourself.',
    description:
      'A demonstration helps you assess seating, controls, transfers and the way the chair handles. Ask our team about a demonstration or a stockist near you.',
  },
  {
    title: 'Support beyond the purchase.',
    description:
      'Speak to our UK team for warranty questions, compatible accessories and aftercare, with phone and email support from Wimborne, Dorset.',
  },
] as const;

export const ABOUT_FACTS = [
  {label: 'Our store', value: 'Mobility Robot'},
  {label: 'Our company', value: COMPANY.name},
  {label: 'Our role', value: 'Official UK distributor of XSTO'},
  {label: 'Based in', value: COMPANY.city},
] as const;

export const DISTRIBUTOR_DISCLAIMER =
  'Mobility Robot is the online store and trading name of Bentech Medical Limited, the official UK distributor of XSTO. XSTO manufactures the products. Bentech Medical Limited is an independent UK company providing sales, demonstrations and aftercare.';

export const ABOUT_INTRO = [
  'Mobility Robot is the online store of Bentech Medical Limited, the official UK distributor of XSTO products. Bentech Medical previously sold the range through a different website; Mobility Robot is now our customer-facing store.',
  'We help customers explore the range, compare options and understand what the technology can offer. XSTO manufactures the products. Our role is to support UK enquiries, sales, delivery, warranty questions and aftercare.',
  'Whether you are interested in everyday self-levelling or the X12’s stair-climbing capability, we believe the conversation should start with your own needs.',
] as const;

/** @deprecated Import from `~/lib/content/contact` */
export {CONTACT_INFO} from '~/lib/content/contact';
