export type BuyerGuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  links?: Array<{label: string; to: string}>;
};

export type BuyerGuide = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  summary: string;
  sections: BuyerGuideSection[];
};

/** Editorial buying guidance. Specifications remain on the product pages. */
export const BUYER_GUIDES: BuyerGuide[] = [
  {
    slug: 'self-levelling-wheelchairs',
    title: 'Self-levelling wheelchairs, explained.',
    metaTitle: 'Self-Levelling Wheelchairs: A Buyer’s Guide',
    description:
      'Understand self-levelling wheelchair technology, explore the XSTO range and learn what to check during a personal demonstration.',
    category: 'Understanding the technology',
    summary:
      'What the technology does, what it does not do, and what to try during a demonstration.',
    sections: [
      {
        id: 'what-is-self-levelling',
        title: 'What is a self-levelling wheelchair?',
        paragraphs: [
          'A self-levelling powered wheelchair uses sensors and controlled movement to adjust its chassis or seating as the ground angle changes. In the XSTO range, this technology is intended to help keep the rider more level within the model’s operating limits.',
          'It is useful to separate this feature from electric seat lifting. Levelling responds to the ground; seat lifting changes your seating height. A chair can offer both, but they serve different purposes.',
        ],
      },
      {
        id: 'models-to-compare',
        title: 'Which XSTO models should you compare?',
        paragraphs: [
          'The M4 and M4B are the starting point for everyday self-levelling mobility. The M4B adds a different front wheel design and a folding footrest. The M4 Pro offers more seating adjustment. The X12 adds a separate stair-climbing capability.',
          'Look at the complete chair as well as the levelling system. Seat height, user capacity, dimensions and controls all affect which model is practical for your day.',
        ],
        links: [{label: 'Compare the four XSTO models', to: '/compare'}],
      },
      {
        id: 'operating-limits',
        title: 'What the feature does not tell you',
        paragraphs: [
          'Self-levelling does not mean a chair can travel safely over any surface or climb any obstacle. Check its permitted gradients, dimensions, user capacity and manual. A maximum slope figure does not describe every real-world route.',
          'Self-levelling and stair climbing are different capabilities. The M4, M4B and M4 Pro are not stair-climbing chairs. If stairs are part of your requirements, discuss the X12 and the suitability of the particular staircase with the team.',
        ],
        links: [
          {
            label: 'Read the stair-climbing buyer guide',
            to: '/guides/stair-climbing-wheelchairs',
          },
        ],
      },
      {
        id: 'your-demonstration',
        title: 'Make the demonstration about your day',
        paragraphs: [
          'Bring a short list of the places you use regularly and the things you want to make easier. A personal demonstration is an opportunity to explore the details that a product video cannot answer for you.',
        ],
        bullets: [
          'Try the controls and the response to stopping and turning.',
          'Check the seat, backrest and footrest with your usual footwear and cushion requirements.',
          'Measure the doors, lifts and storage spaces you use.',
          'Discuss the surfaces and gradients along your usual routes.',
          'Check how you would transport the chair and whether its component weights are manageable.',
        ],
      },
      {
        id: 'choose-the-whole-chair',
        title: 'Choose around the whole chair',
        paragraphs: [
          'The most impressive feature is only part of the decision. Seating, transfers, transport and dependable aftercare all matter. Use the model comparison to shortlist, then talk through your requirements with the UK team.',
        ],
        links: [{label: 'Request your demonstration', to: '/demo'}],
      },
    ],
  },
  {
    slug: 'stair-climbing-wheelchairs',
    title: 'Stair-climbing wheelchairs. Start with the right questions.',
    metaTitle: 'Stair-Climbing Wheelchairs: Buyer’s Guide',
    description:
      'Explore XSTO X12 stair-climbing wheelchair suitability, staircase assessment, training, transport and what to ask before buying.',
    category: 'Planning your next move',
    summary:
      'The questions to ask about stairs, training and your everyday routes.',
    sections: [
      {
        id: 'what-is-stair-climbing',
        title: 'What is a stair-climbing wheelchair?',
        paragraphs: [
          'A stair-climbing wheelchair is designed to negotiate suitable stairs using a specialised mechanism and control system. It is a distinct capability: a powered wheelchair that handles slopes is not necessarily able to climb stairs.',
          'Within this range, the XSTO X12 is the stair-climbing model. The M4, M4B and M4 Pro are not stair climbers.',
        ],
        links: [
          {
            label: 'Explore the XSTO X12',
            to: '/products/x12-all-terrain-mobility-robot',
          },
        ],
      },
      {
        id: 'your-staircase',
        title: 'Start with the staircase you need to use',
        paragraphs: [
          'A published stair-angle figure alone is not enough to confirm a particular staircase is usable. Step height and depth, width, landings, edges, surface condition and the approach all need consideration.',
          'Share the staircase details before making a purchase decision. Ask the team how suitability will be assessed and which operating limits apply to your chosen configuration.',
        ],
        bullets: [
          'Provide clear photographs and measurements of the staircase.',
          'Discuss space at the top and bottom, turns and landings.',
          'Ask how suitability will be assessed and what training is required.',
          'Confirm the operating procedure and whether assistance is required for your circumstances.',
        ],
      },
      {
        id: 'beyond-the-stairs',
        title: 'Think beyond the stairs',
        paragraphs: [
          'Most days involve much more than climbing. Consider the chair’s size and weight, access through doors, seating, charging, storage and transport. The X12 is substantially heavier than the M4-series chairs, so confirm the exact configuration and your loading arrangements before purchasing.',
          'Measure the places where the chair will be stored and transported. Discuss who will load it, which equipment will be used and whether the available space and weight limits are suitable.',
        ],
        links: [
          {label: 'Compare published weights and dimensions', to: '/compare'},
        ],
      },
      {
        id: 'x12-editions',
        title: 'X12 or X12 Pro?',
        paragraphs: [
          'The range offers the X12 with a standard leg rest and the X12 Pro with an electric elevating leg rest. Both editions are selected from the X12 product page.',
          'Ask the team to explain your chosen configuration and any optional accessories shown in photographs. Check the complete specification and price for the edition you intend to order.',
        ],
        links: [
          {
            label: 'View X12 editions and current prices',
            to: '/products/x12-all-terrain-mobility-robot',
          },
        ],
      },
      {
        id: 'assessment-and-training',
        title: 'Book an assessment and demonstration',
        paragraphs: [
          'A video is a useful introduction, but it cannot establish whether a chair suits you or your staircase. Talk to the team about assessment, training and a demonstration. Follow the current product manual and the operating limits explained during handover.',
        ],
        links: [
          {label: 'Discuss an X12 demonstration', to: '/demo'},
          {label: 'Watch the range in action', to: '/videos'},
        ],
      },
    ],
  },
  {
    slug: 'choosing-an-xsto-wheelchair',
    title: 'Which XSTO is right for you?',
    metaTitle: 'Which XSTO Wheelchair Should I Choose?',
    description:
      'Choose between XSTO M4, M4B, M4 Pro and X12 with a practical guide to everyday use, seating, transport, demonstrations and pricing.',
    category: 'Find your fit',
    summary:
      'A practical way to compare the M4, M4B, M4 Pro and X12 around your own life.',
    sections: [
      {
        id: 'everyday-priorities',
        title: 'Start with your everyday priorities',
        paragraphs: [
          'Write down the things you want your next wheelchair to make easier. They might include getting around at home, going out, sitting at different heights, finding a comfortable position or negotiating a particular route.',
          'Then consider practical limits: the space in your home, vehicle access, charging arrangements and who will lift or load the chair. These details help narrow your choice.',
        ],
      },
      {
        id: 'm4',
        title: 'M4: everyday self-levelling',
        paragraphs: [
          'The XSTO M4 combines self-levelling control with electric seat lifting and a modular design. Compare the folded dimensions and component weights with your transport needs.',
          'During a demonstration, try the seat-height adjustment and the controls you will use most often. Ask to see how folding and disassembly work in practice.',
        ],
        links: [
          {label: 'Explore the XSTO M4', to: '/products/buy-robot-wheelchair'},
        ],
      },
      {
        id: 'm4b',
        title: 'M4B: a practical variation on the M4',
        paragraphs: [
          'The XSTO M4B builds on the M4 with revised front wheels and a folding footrest. If you are choosing between these two models, try their controls, handling and transfer setup side by side.',
          'Look at the dimensions and total weight as well as the shared technology. Small differences can matter when you are moving through a particular doorway or loading a vehicle.',
        ],
        links: [{label: 'Explore the XSTO M4B', to: '/products/xsto-m4b-1'}],
      },
      {
        id: 'm4-pro',
        title: 'M4 Pro: more seating adjustment',
        paragraphs: [
          'The M4 Pro offers backrest recline, seat tilt and a different seat-height range. It also has a longer advertised range than the M4. Ask for a seating demonstration and confirm the battery configuration behind the range figure.',
          'Try the adjustments you would use during a typical day and discuss your existing seating requirements with the team.',
        ],
        links: [
          {label: 'Explore the XSTO M4 Pro', to: '/products/xsto-m4-pro'},
        ],
      },
      {
        id: 'x12',
        title: 'X12: when stair capability matters',
        paragraphs: [
          'The X12 adds stair-climbing technology and is a substantially heavier chair. If stairs are central to your decision, start with a suitability assessment. If they are not, compare how an M4-series model matches your everyday requirements.',
        ],
        links: [
          {
            label: 'Explore the XSTO X12',
            to: '/products/x12-all-terrain-mobility-robot',
          },
          {
            label: 'Read the stair-climbing guide',
            to: '/guides/stair-climbing-wheelchairs',
          },
        ],
      },
      {
        id: 'cost-and-support',
        title: 'Compare the full cost and support',
        paragraphs: [
          'Check the current chair price, accessories, delivery arrangements and warranty coverage. VAT-relief prices apply only to eligible customers and qualifying purchases; the VAT guide explains the distinction.',
          'The comparison table brings published figures together. A personal demonstration is the next step towards a decision based on your own requirements.',
        ],
        links: [
          {label: 'Compare the models', to: '/compare'},
          {label: 'Understand VAT relief', to: '/vat-relief'},
          {label: 'Explore delivery and aftercare', to: '/support'},
        ],
      },
    ],
  },
];

export function getBuyerGuide(slug: string | undefined) {
  return BUYER_GUIDES.find((guide) => guide.slug === slug);
}
