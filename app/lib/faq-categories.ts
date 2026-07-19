import type {ProductFAQ} from '~/lib/product-faqs';
import {
  ezgo2FAQs,
  generalFAQs,
  m4FAQs,
  m4bFAQs,
  m4ProFAQs,
  x12FAQs,
} from '~/lib/product-faqs';

export type FaqCategory = {
  id: string;
  title: string;
  items: ProductFAQ[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'product',
    title: 'Product',
    items: [...m4FAQs, ...m4bFAQs, ...m4ProFAQs, ...ezgo2FAQs, ...x12FAQs],
  },
  {
    id: 'ordering-delivery',
    title: 'Ordering & Delivery',
    items: [
      generalFAQs[2],
      {
        question: 'Do you deliver to Scottish Highlands and Northern Ireland?',
        answer:
          'Yes. We deliver across the UK and Ireland. Scottish Highlands, Northern Ireland and offshore islands may have extended lead times — contact us on 0208 050 4849 for a delivery estimate before ordering.',
      },
      {
        question: 'Can I book a demonstration before I buy?',
        answer:
          'Yes. Visit an authorised stockist or book a demo with Bentech Medical Ltd via our demo request form. Many stockists offer in-store demonstrations.',
      },
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty',
    items: [
      generalFAQs[1],
      {
        question: 'How do I register my warranty?',
        answer:
          'Complete the warranty registration form on our Warranty page with your name, email, order reference, serial number and purchase date. Registration helps us process claims faster.',
      },
      {
        question: 'Who handles warranty claims in the UK?',
        answer:
          'Bentech Medical Ltd, as the official UK distributor, manages all warranty claims directly with the manufacturer. Contact support@mobilityrobot.co.uk or call 0208 050 4849.',
      },
    ],
  },
  {
    id: 'vat-relief',
    title: 'VAT Relief',
    items: [
      generalFAQs[0],
      {
        question: 'What declaration do I need to provide?',
        answer:
          'During checkout, confirm you have a qualifying long-term illness or disability and provide your name, address and nature of condition. This HMRC declaration is stored with your order.',
      },
      {
        question: 'Can a charity or care home claim VAT relief?',
        answer:
          'VAT relief on mobility aids generally applies to eligible individuals. Charities and businesses should contact us for guidance on their specific circumstances.',
      },
    ],
  },
  {
    id: 'trade',
    title: 'Trade',
    items: [
      {
        question: 'Do you offer trade pricing?',
        answer:
          'Yes. Healthcare professionals, care providers and mobility retailers can request a trade quote via our quote request form. A team member will respond within one business day.',
      },
      {
        question: 'Can I become an authorised stockist?',
        answer:
          'Bentech Medical Ltd appoints authorised UK and Ireland stockists. Email support@mobilityrobot.co.uk with your company details and territory to discuss partnership.',
      },
    ],
  },
];

export function getAllFaqs(): ProductFAQ[] {
  return FAQ_CATEGORIES.flatMap((category) => category.items);
}
