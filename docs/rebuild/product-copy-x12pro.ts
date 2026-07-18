import x12Hero from "@/assets/x12-hero.webp";
import x12ProHero from "@/assets/x12-pro-hero.webp";
import x12HeroStudio from "@/assets/x12-hero-studio.png";
import x12HeroStairs from "@/assets/x12-hero-stairs.webp";
import x12Feature1 from "@/assets/x12-feature-1.webp";
import x12Mode1 from "@/assets/x12-mode-1.webp";
import x12Mode2 from "@/assets/x12-mode-2.webp";
import x12Mode3 from "@/assets/x12-mode-3.webp";
import x12Control1 from "@/assets/x12-control-1.webp";
import x12Lifestyle1 from "@/assets/x12-lifestyle-1.jpg";
import x12Lifestyle5 from "@/assets/x12-lifestyle-5.jpg";
import x12Stairs from "@/assets/x12-stairs.jpg";
import x12Terrain from "@/assets/x12-terrain.jpg";
import x12Recline from "@/assets/x12-recline.jpg";
import x12WheeledMode from "@/assets/x12-wheeled-mode.png";
import x12CaterpillarSide from "@/assets/x12-caterpillar-side.png";
import x12TrackMode from "@/assets/x12-track-mode.png";
import x12StairClimb from "@/assets/x12-stair-climb.png";
import x12SideView from "@/assets/x12-side-view.png";
import x12FoldedView from "@/assets/x12-folded-view.png";
import x12RearView from "@/assets/x12-rear-view.png";
import type { ProductData, ProductSpec, ProductDimension, ProductFeature, ProductReview, LifestyleSection } from "./productData";
import { X12_R2_VIDEO, X12_PRO_VIDEO_URL } from "./x12ProductData";

export const x12ProSpecs: ProductSpec[] = [
  { label: "Max Load Capacity", value: "136 kg", unit: "(300 lbs)" },
  { label: "Top Speed", value: "0–12 km/h", unit: "(7.5 mph)" },
  { label: "Range", value: "35 km", unit: "(22 miles)" },
  { label: "Max Stair Slope", value: "40°" },
  { label: "Weight (no battery)", value: "116 kg", unit: "(256 lbs)" },
  { label: "Battery", value: "25.2V", unit: "25.6Ah × 2" },
  { label: "Charge Time", value: "6.5 hrs", unit: "× 2 batteries" },
  { label: "Stair Speed (Up)", value: "25 steps/min" },
  { label: "Stair Speed (Down)", value: "30 steps/min" },
  { label: "Climbing Ability", value: "Wheeled 15°", unit: "/ Tracked 40°" },
  { label: "Forward Obstacle", value: "100 mm" },
  { label: "Rear Obstacle", value: "220 mm" },
  { label: "Max Pit Width", value: "300 mm", unit: "(tracked)" },
  { label: "Protection", value: "IPX5", unit: "Water Resistant" },
];

export const x12ProDimensions: ProductDimension[] = [
  { label: "Lifting Range (Seat Height)", value: "490–762 mm (19.3\"–30\")" },
  { label: "Seat Width", value: "390–440 mm (15.4\"–17.3\")" },
  { label: "Seat Depth", value: "380–435 mm (15\"–17.1\")" },
  { label: "Tilt Angle", value: "-8° to 40°" },
  { label: "Recline Angle", value: "90°–121°" },
  { label: "Legrest Adjustment", value: "Electric (Pro exclusive)" },
  { label: "Folded Dimensions", value: "1185 × 685 × 617 mm" },
  { label: "Unfolded Dimensions", value: "1210 × 685 × 1550 mm" },
  { label: "Compatible Step Height", value: "< 200 mm" },
  { label: "Compatible Step Incline", value: "< 35°" },
  { label: "Stair Platform (L-shape)", value: "1400 × 1400 mm" },
  { label: "Stair Platform (U-shape)", value: "1400 × 2000 mm" },
  { label: "Ditch Crossing (Wheeled)", value: "< 180 mm" },
  { label: "Ditch Crossing (Tracked)", value: "< 300 mm" },
];

export const x12ProFeatures: ProductFeature[] = [
  {
    title: "AI-Powered Automation",
    description: "Automatically detects terrain changes and switches driving modes in real time. Intelligently adjusts power output and corrects drift for a smooth, safe ride on any surface.",
    icon: "Brain",
  },
  {
    title: "Three Terrain Modes",
    description: "Track Crawling Mode for extreme trenches, Wheel-Track Composite Mode for stairs and steps, and Wheeled Quadruped Mode for flat ground with four-wheel independent suspension.",
    icon: "Mountain",
  },
  {
    title: "360° Self-Balancing",
    description: "Industry-first gyroscopic stabilisation system with proprietary spatial safety algorithm. Automatic seat posture compensation on slopes, steps, and rugged roads.",
    icon: "Scale",
  },
  {
    title: "Dual Battery System",
    description: "Twin 25.2V 25.6Ah lithium batteries provide 35 km range and redundancy for all-day adventures. 6.5-hour charge time per battery — standard on both X12 models.",
    icon: "Battery",
  },
  {
    title: "Electric Legrest",
    description: "Fully electric legrest adjustment for effortless comfort changes on the go. Combined with 121° recline and dynamic posture adjustment for all-day comfort.",
    icon: "Settings",
  },
  {
    title: "LiDAR Hazard Protection",
    description: "Precision LiDAR scanning detects obstacles, prevents high-speed collisions, warns of drop-offs, and proactively alerts to potential risks before they become dangers.",
    icon: "Shield",
  },
];

export const x12ProReviews: ProductReview[] = [
  {
    name: "David K.",
    date: "February 2026",
    rating: 5,
    title: "The Pro upgrade is worth it",
    content: "The dual battery system gives me confidence to go on longer outings without worrying about range. The electric legrest is a game changer for comfort.",
  },
  {
    name: "Sarah T.",
    date: "January 2026",
    rating: 5,
    title: "Worth every penny",
    content: "After trying multiple mobility solutions, the X12 is in a league of its own. The all-terrain capability means I can go anywhere—parks, trails, even rocky paths. Life-changing!",
  },
];

const x12ProLifestyleSections: LifestyleSection[] = [
  {
    title: "Every Path Is a Smooth One",
    description: "Stairs, ramps, and uneven terrain are no longer obstacles. The X12 Pro's wheeled quadruped chassis with dual-track crawler system and 14 power systems handles complex terrain as easily as walking on flat ground.",
    image: { src: x12Stairs, alt: "XSTO X12 Pro Climbing Stairs", caption: "Effortless Stair Climbing up to 40°" },
    imagePosition: 'right',
    highlights: ["40° stair climbing", "14 integrated power systems", "Automatic step detection"],
  },
  {
    title: "Conquer Terrain, Boundless Freedom",
    description: "The X12 Pro crosses ditches up to 300 mm wide, clears 220 mm rear obstacles, and handles slopes up to 40° on tracks. With dual batteries for extended range, no path is off-limits.",
    image: { src: x12Lifestyle5, alt: "XSTO X12 Pro Boardwalk Lifestyle", caption: "Explore Nature with Confidence" },
    imagePosition: 'left',
    highlights: ["300 mm ditch crossing", "Dual battery extended range", "220 mm obstacle clearance"],
  },
  {
    title: "Three Modes, Any Environment",
    description: "Track Crawling Mode powers through extreme trenches. Wheel-Track Composite Mode handles stairs and steep slopes. Wheeled Quadruped Mode adapts to flat ground with four-wheel independent suspension and enhanced AI drift correction.",
    image: { src: x12Control1, alt: "XSTO X12 Pro Control System", caption: "Intelligent Mode Switching" },
    imagePosition: 'right',
    highlights: ["Track Crawling Mode", "Wheel-Track Composite Mode", "Wheeled Quadruped Mode"],
  },
  {
    title: "Pro Comfort & Electric Adjustment",
    description: "The X12 Pro features electric legrest adjustment and a reclining seat with 121° tilt. The dynamic posture-adjusting system works like a rocking chair to alleviate fatigue and prevent pressure sores — all controllable at the touch of a button.",
    image: { src: x12Recline, alt: "XSTO X12 Pro Reclining", caption: "Electric Comfort Adjustment" },
    imagePosition: 'left',
    highlights: ["Electric legrest (Pro exclusive)", "121° recline", "Anti-fatigue posture adjustment"],
  },
  {
    title: "Go Further, Stay Protected",
    description: "Precision LiDAR scanning prevents collisions, warns of drop-offs, and alerts to obstacles before they become dangers. Combined with gyroscopic self-balancing and IPX5 weather resistance, you can explore with complete confidence.",
    image: { src: x12Terrain, alt: "XSTO X12 Pro Off-Road", caption: "All-Terrain Safety & Capability" },
    imagePosition: 'right',
    highlights: ["LiDAR hazard detection", "Anti-collision protection", "IPX5 weather resistant"],
  },
];

export const x12ProProduct: ProductData = {
  id: "f8b9c0d1-2345-6789-abcd-ef0123456789",
  slug: "xsto-x12-pro",
  name: "XSTO X12 Pro",
  tagline: "Embodied Mobile Robot — Pro Edition with Electric Legrest & Enhanced Comfort",
  description: "The XSTO X12 Pro takes the revolutionary X12 platform further with electric legrest adjustment and enhanced comfort features. The same 14-power-system chassis conquers stairs up to 40°, crosses 300 mm ditches, and navigates any terrain — with Pro-exclusive comfort upgrades for all-day use.",
  price: 17995,
  // Curated product images only (videos live in the Videos tab)
  images: [
    { src: x12ProHero, alt: "XSTO X12 Pro Studio Shot", caption: "X12 Pro — All-Terrain AI Robot" },
    { src: "/xsto/x12-pro/067c8b-x12-pro-banner-DKIU7zS8.webp", alt: "XSTO X12 Pro official banner", caption: "XSTO X12 Pro — Official" },
    { src: "/xsto/x12-pro/84e0c5-x12-pro-360-2tyJiQVc.png", alt: "XSTO X12 Pro 360 view", caption: "360° View" },
    { src: "/xsto/x12-pro/5d720c-x12-pro-sell-pointer-CjWMqIDq.webp", alt: "XSTO X12 Pro key features", caption: "Key Features" },
    { src: "/xsto/x12-pro/99777d-x12-pro-ai-DVV18xPh.webp", alt: "XSTO X12 Pro AI features", caption: "AI Automation" },
    { src: "/xsto/x12-pro/113ae3-x12-pro-danger-CSLg-YLF.webp", alt: "XSTO X12 Pro LiDAR safety", caption: "LiDAR Safety" },
    { src: "/xsto/x12-pro/8f89b8-x12-pro-just-BKUHigc4.webp", alt: "XSTO X12 Pro adjustment", caption: "Posture Adjustment" },
    { src: "/xsto/x12-pro/3df30f-x12-pro-sence-BW9zi7Sl.webp", alt: "XSTO X12 Pro lifestyle", caption: "Real-World Use" },
    { src: x12WheeledMode, alt: "XSTO X12 Pro Wheeled Mode", caption: "Wheeled Mode" },
    { src: x12CaterpillarSide, alt: "XSTO X12 Pro Caterpillar Mode", caption: "Caterpillar Track System" },
    { src: x12StairClimb, alt: "XSTO X12 Pro Stair Climbing", caption: "Automatic Stair Climbing" },
    { src: x12FoldedView, alt: "XSTO X12 Pro Folded", caption: "Compact Folded Position" },
  ],
  videos: [
    { src: X12_PRO_VIDEO_URL, alt: "XSTO X12 Pro official product video", caption: "Watch the X12 Pro in Action", type: 'video' as const, thumbnail: x12ProHero },
  ],
  lifestyleSections: x12ProLifestyleSections,
  specs: x12ProSpecs,
  dimensions: x12ProDimensions,
  features: x12ProFeatures,
  reviews: x12ProReviews,
  highlights: [
    "AI-powered automatic mode switching",
    "Climbs stairs up to 40° incline",
    "Dual battery system — 35 km range",
    "Electric legrest adjustment (Pro exclusive)",
    "Three terrain modes for any surface",
    "LiDAR obstacle detection & hazard alerts",
    "300 mm ditch crossing capability",
    "IPX5 water resistant",
  ],
  inBox: [
    "XSTO X12 Pro All-Terrain Mobility Robot",
    "2× 25.2V 25.6Ah Lithium Battery Packs",
    "Battery Charger",
    "Joystick Controller",
    
    "Wireless Key",
    "User Manual",
    "Tool Kit",
  ],
  warrantyMonths: 60,
};
