import {COMPANY} from '~/lib/site-navigation';

export const ABOUT_VALUE_PROPS = [
  {
    title: 'Clinical-grade engineering',
    description:
      'XSTO chairs combine self-balancing technology, comprehensive safety systems and CE-certified components built for everyday independence.',
  },
  {
    title: 'UK-based support',
    description:
      'Phone and email support from Wimborne, Dorset — warranty, parts and after-sales handled in the UK, not sent overseas.',
  },
  {
    title: 'Try before you buy',
    description:
      'Book a demo in Dorset or London, or visit an authorised stockist for fitting advice, accessories and local aftercare.',
  },
] as const;

export const ABOUT_FACTS = [
  {
    label: 'Distributor',
    value: 'Official UK & Ireland partner for XSTO',
  },
  {
    label: 'Based in',
    value: `${COMPANY.city}`,
  },
  {
    label: 'Coverage',
    value: 'Nationwide delivery & stockist network',
  },
  {
    label: 'Support hours',
    value: 'Mon–Fri, 9:00am–5:30pm',
  },
] as const;

export const DISTRIBUTOR_DISCLAIMER =
  'This site is operated by Bentech Medical Ltd, the Official UK Distributor of XSTO. XSTO is a trademark of its manufacturer. Bentech Medical Ltd is not affiliated with XSTO Robot Technology Co., Ltd.';

export const ABOUT_INTRO = [
  `${COMPANY.name} runs Mobility Robot — the official UK and Ireland storefront for XSTO powered wheelchairs. Foldable, portable mobility robots designed for modern independent living.`,
  'From our base in Wimborne, Dorset, we supply the full XSTO range — EzGo2, M4, M4B, M4 Pro, X12 and X12 Pro — with free UK delivery, VAT relief for eligible customers, and manufacturer warranty managed locally.',
  'Alongside online ordering we work with authorised stockists across the UK and Ireland, so you can see a chair in person, arrange a demonstration, and get expert advice close to home.',
] as const;

/** @deprecated Import from `~/lib/content/contact` */
export {CONTACT_INFO} from '~/lib/content/contact';
