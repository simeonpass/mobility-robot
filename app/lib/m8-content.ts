import type {ProductContent} from '~/lib/product-content';
import {M8_FULL_VIDEO_URL, HOMEPAGE_HERO_POSTER_URL} from '~/lib/homepage-data';

/** Manufacturer reference: en.xsto.com/innovative-mobility-details/m8-pro-mobility-robot.
 * UK pricing and 12-week lead time confirmed by Bentech, September 2026.
 */
export function m8Content(pro: boolean): ProductContent {
  const name = pro ? 'M8 Pro' : 'M8';
  return {
    displayName: `XSTO ${name}`,
    tagline: pro
      ? 'Four-wheel freedom. Powered comfort.'
      : 'A new way to explore the everyday.',
    overview: `The XSTO ${name} brings together four-wheel drive, front and rear self-balancing and powered seat elevation. ${pro ? 'Powered backrest reclining and a powered leg rest let you adjust your position with ease.' : 'A manually reclining backrest and manual leg rest offer a simpler seating configuration.'} Our UK team can help you check suitability before you pre-order.`,
    highlights: [
      'Four motors · four-wheel drive',
      'Front and rear self-balancing',
      'Powered seat elevation: 450–730 mm',
      pro ? 'Powered recline and leg rest' : 'Manual reclining backrest',
    ],
    features: [
      {
        title: 'Confidence beyond the everyday',
        description:
          'Four-wheel drive and a self-balancing chassis are designed for varied outdoor surfaces. Always follow the operating limits and get advice for your usual routes.',
        highlights: [
          'Four independent drive motors',
          'Front omnidirectional wheels',
          '12-inch rear off-road tyres',
          'Manufacturer-rated 100 mm obstacle clearance',
        ],
      },
      {
        title: 'Find your level',
        description:
          'Raise or lower the seat electrically for different activities and eye-level conversation.',
        highlights: [
          '450–730 mm seat elevation',
          '150 kg combined user and luggage capacity',
          'Adjustable armrests',
          'Left- or right-side controller position',
        ],
      },
      {
        title: pro ? 'Comfort at the touch of a button' : 'Comfort, your way',
        description: pro
          ? 'The Pro adds powered backrest reclining from 90–135° and a powered leg rest.'
          : 'The standard M8 offers manual backrest reclining from 90–125° and a manual leg rest.',
        highlights: pro
          ? [
              'Powered 90–135° reclining',
              'Powered leg rest',
              'One-touch relaxation mode',
            ]
          : [
              'Manual 90–125° reclining',
              'Manual leg rest',
              'Same four-wheel-drive platform',
            ],
      },
      {
        title: 'Plan a longer day out',
        description:
          'The manufacturer quotes up to 54 km with an optional battery configuration. Range varies with terrain, user weight, speed and battery setup; confirm your chosen configuration with us.',
        highlights: [
          'Removable battery system',
          'Joystick, Bluetooth remote and app control',
          'Headlights, brake lights and indicators',
        ],
      },
    ],
    specs: [
      {label: 'Drive', value: 'Four-wheel drive / four motors'},
      {label: 'Max user + luggage capacity', value: '150', unit: 'kg'},
      {
        label: 'Weight without batteries',
        value: pro ? '72.6' : '68.6',
        unit: 'kg',
      },
      {label: 'Range with optional battery', value: 'Up to 54', unit: 'km'},
      {label: 'Minimum turning radius', value: '725', unit: 'mm'},
      {
        label: 'Manufacturer-rated obstacle clearance',
        value: '100',
        unit: 'mm',
      },
      {label: 'Manufacturer-rated max slope', value: '15°'},
      {label: 'Seat elevation', value: '450–730', unit: 'mm'},
      {
        label: 'Backrest recline',
        value: pro ? '90–135° · powered' : '90–125° · manual',
      },
      {label: 'Leg rest', value: pro ? 'Powered' : 'Manual'},
      {label: 'Water resistance', value: 'IPX4'},
    ],
    dimensions: [
      {
        label: 'Folded (L × W × H)',
        value: pro ? '1129 × 610 × 730 mm' : '1063 × 610 × 730 mm',
      },
      {
        label: 'Unfolded (L × W × H)',
        value: pro ? '1235 × 610 × 1287 mm' : '1085 × 610 × 1287 mm',
      },
    ],
    inBox: [
      `XSTO ${name} mobility robot`,
      'Our team will confirm the battery configuration and included equipment before dispatch. Photography may show optional accessories.',
    ],
    deliveryWarranty:
      'Pre-order with a 10% deposit. Estimated delivery: 12 weeks from pre-order. The remaining 90% is payable before dispatch. We will confirm delivery arrangements with you. Contact Bentech Medical for the applicable UK warranty terms and product configuration before ordering.',
    faqs: [
      {
        question: 'What is the difference between M8 and M8 Pro?',
        answer:
          'Both use four-wheel drive, self-balancing and powered seat elevation. The M8 has a manual 90–125° reclining backrest and manual leg rest. M8 Pro adds powered 90–135° reclining and a powered leg rest.',
      },
      {
        question: `How much is the ${name} pre-order deposit?`,
        answer: pro
          ? 'The full price is £8,000 + VAT (£9,600 including VAT). Pay a 10% deposit of £800 + VAT (£960 including VAT), with £7,200 + VAT remaining before dispatch.'
          : 'The full price is £7,000 + VAT (£8,400 including VAT). Pay a 10% deposit of £700 + VAT (£840 including VAT), with £6,300 + VAT remaining before dispatch.',
      },
      {
        question: 'When will my chair arrive?',
        answer:
          'Estimated delivery is 12 weeks from pre-order. This is an estimate, not a guaranteed delivery date. Our UK team will keep you informed.',
      },
      {
        question: 'Is the 54 km range included as standard?',
        answer:
          'The manufacturer quotes up to 54 km with an optional battery configuration. Please confirm the battery setup included in your order. Actual range depends on terrain, load, speed and conditions.',
      },
      {
        question: 'Can it climb stairs?',
        answer:
          'The M8 is not advertised as a stair-climbing chair. For suitable stairs, explore the X12 series and speak to our team about assessment and training.',
      },
      {
        question: 'Can I claim VAT relief?',
        answer:
          'Eligible customers may qualify after completing a VAT-relief declaration. Eligibility is not automatic; see our VAT-relief guidance or ask our team.',
      },
    ],
    videos: [
      {
        title: 'Discover the XSTO M8 Series',
        embedUrl: M8_FULL_VIDEO_URL,
        poster: HOMEPAGE_HERO_POSTER_URL,
      },
    ],
  };
}
