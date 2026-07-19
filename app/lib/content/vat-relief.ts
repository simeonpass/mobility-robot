import type {ContentSection} from '~/lib/content/warranty-returns';

export const VAT_RELIEF_STEPS = [
  {
    title: 'Choose your wheelchair',
    description:
      'Browse the XSTO range and open any powered wheelchair product page.',
  },
  {
    title: 'Declare eligibility',
    description:
      'On the product page or in your cart, confirm you qualify and complete the short HMRC declaration.',
  },
  {
    title: 'Shop at the VAT-free price',
    description:
      'We remove the exact VAT amount automatically at checkout — no discount code and no separate registration wait.',
  },
] as const;

export const VAT_RELIEF_ELIGIBLE_PRODUCTS = [
  {name: 'XSTO M4', path: '/products/xsto-m4'},
  {name: 'XSTO M4 Pro', path: '/products/xsto-m4-pro'},
  {name: 'XSTO M4B', path: '/products/xsto-m4b'},
  {name: 'XSTO X12', path: '/products/xsto-x12'},
  {name: 'XSTO X12 Pro', path: '/products/xsto-x12-pro'},
] as const;

export const vatReliefSections: ContentSection[] = [
  {
    id: 'who-qualifies',
    title: 'Who qualifies',
    paragraphs: [
      'Under HMRC Notice 701/7, VAT relief can apply when an eligible mobility aid is supplied to a chronically sick or disabled person for their personal or domestic use.',
      'In practice, this means you (or the person you are buying for, where the rules allow) have a long-term illness or disability that affects mobility, and the wheelchair is for personal use — not for business resale.',
    ],
    listItems: [
      'You must be chronically sick or disabled as understood by HMRC',
      'The goods must be for personal or domestic use',
      'You must make a truthful declaration when you claim relief',
      'Charities, care homes and businesses should contact us — rules can differ',
    ],
  },
  {
    id: 'how-it-works',
    title: 'How claiming works',
    paragraphs: [
      'You no longer need to register a VAT-exempt account and wait for approval before you shop. Eligibility is declared when you buy.',
      'On an eligible product, open the HMRC VAT relief panel, confirm you qualify, and enter your name, email, address and nature of condition. The same declaration can be completed or edited from the cart.',
      'Your declaration is stored with the order line and registered against your email as tax-exempt. At Shopify checkout you pay the ex-VAT catalog price (for example, £3,329.17 ex VAT instead of £3,995 inc. VAT) — use the same email, and sign in if you have an account.',
    ],
  },
  {
    id: 'what-you-need',
    title: 'What you need to declare',
    paragraphs: [
      'You will be asked for the details HMRC expects on a customer declaration. Keep them accurate — a false declaration is an offence.',
    ],
    listItems: [
      'Full name',
      'Email address',
      'Address',
      'Nature of your condition (for example, long-term mobility impairment)',
      'Confirmation that you are eligible under HMRC Notice 701/7 and that the goods are for personal use',
    ],
  },
  {
    id: 'products',
    title: 'Which products qualify',
    paragraphs: [
      'VAT relief on this storefront is available on XSTO powered wheelchairs. Accessories sold separately are not claimed through the same relief toggle.',
      'Product pages show the ex-VAT (VAT relief) price as the main figure, with the including-VAT catalog price underneath. Complete a declaration to pay the ex-VAT amount at checkout.',
    ],
  },
  {
    id: 'important',
    title: 'Important information',
    paragraphs: [
      'Bentech Medical Ltd may request supporting information and will report suspected fraud to HMRC. Order and VAT relief records are retained to meet HMRC requirements.',
      'This page summarises how VAT relief works on mobilityrobot.co.uk. It is not personal tax advice. If you are unsure whether you qualify, contact us before ordering or check the latest HMRC guidance on VAT relief for disabled people.',
    ],
  },
];
