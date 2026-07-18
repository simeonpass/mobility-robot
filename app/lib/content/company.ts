import {COMPANY} from '~/lib/site-navigation';

export const ABOUT_VALUE_PROPS = [
  {
    title: 'Clinical Quality',
    description:
      'XSTO wheelchairs meet rigorous engineering standards with self-balancing technology, comprehensive safety systems and CE-certified components.',
  },
  {
    title: 'UK Support',
    description:
      'Bentech Medical Ltd provides free UK-based phone and email support, warranty management and after-sales service — no overseas returns required.',
  },
  {
    title: 'Expert Fitting',
    description:
      'Our authorised stockists and in-house team help you choose the right model, configure accessories and arrange demonstrations across the UK and Ireland.',
  },
] as const;

export const DISTRIBUTOR_DISCLAIMER =
  'This site is operated by Bentech Medical Ltd, the Official UK Distributor of XSTO. XSTO is a trademark of its manufacturer. Bentech Medical Ltd is not affiliated with XSTO Robot Technology Co., Ltd.';

export const ABOUT_INTRO = [
  `${COMPANY.name} is the official UK and Ireland distributor of XSTO powered wheelchairs — foldable, portable mobility robots designed for modern independent living.`,
  'From our base in Wimborne, Dorset, we supply the full XSTO range including the M4, M4 Pro, M4B, EzGo2, X12 and X12 Pro, with free UK delivery, VAT relief eligibility and comprehensive warranty support.',
  'We work with a network of authorised stockists across the UK and Ireland, offering demonstrations, expert advice and local after-sales service.',
];

export const CONTACT_INFO = {
  email: COMPANY.email,
  phone: COMPANY.phone,
  phoneHref: COMPANY.phoneHref,
  address: `${COMPANY.address}, ${COMPANY.city}, ${COMPANY.postcode}`,
  hours: 'Monday–Friday, 9:00am–5:30pm (UK time)',
  mapEmbed:
    'https://www.openstreetmap.org/export/embed.html?bbox=-1.995%2C50.795%2C-1.970%2C50.810&layer=mapnik&marker=50.802%2C-1.983',
};
