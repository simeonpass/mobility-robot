import x12Hero from "@/assets/x12-hero.webp";
import x12HeroStudio from "@/assets/x12-hero-studio.png";
import x12HeroStairs from "@/assets/x12-hero-stairs.webp";
import x12Banner from "@/assets/x12-banner.webp";
import x12Feature1 from "@/assets/x12-feature-1.webp";
import x12Mode1 from "@/assets/x12-mode-1.webp";
import x12Mode2 from "@/assets/x12-mode-2.webp";
import x12Mode3 from "@/assets/x12-mode-3.webp";
import x12Control1 from "@/assets/x12-control-1.webp";
// Lifestyle images
import x12Lifestyle1 from "@/assets/x12-lifestyle-1.jpg";
import x12Lifestyle2 from "@/assets/x12-lifestyle-2.jpg";
import x12Lifestyle3 from "@/assets/x12-lifestyle-3.jpg";
import x12Lifestyle4 from "@/assets/x12-lifestyle-4.jpg";
import x12Lifestyle5 from "@/assets/x12-lifestyle-5.jpg";
import x12Stairs from "@/assets/x12-stairs.jpg";
import x12Terrain from "@/assets/x12-terrain.jpg";
import x12Recline from "@/assets/x12-recline.jpg";
import x12Outdoor from "@/assets/x12-outdoor.jpg";
// Product studio images
import x12WheeledMode from "@/assets/x12-wheeled-mode.png";
import x12CaterpillarSide from "@/assets/x12-caterpillar-side.png";
import x12TrackMode from "@/assets/x12-track-mode.png";
import x12StairTop from "@/assets/x12-stair-top.png";
import x12StairDescend from "@/assets/x12-stair-descend.png";
import x12QuadrupedRear from "@/assets/x12-quadruped-rear.png";
import x12StairClimb from "@/assets/x12-stair-climb.png";
import x12StairAngle from "@/assets/x12-stair-angle.png";
import x12SideView from "@/assets/x12-side-view.png";
import x12ClimbView from "@/assets/x12-climb-view.png";
import x12FoldedView from "@/assets/x12-folded-view.png";
import x12RearView from "@/assets/x12-rear-view.png";
import type { ProductData, ProductSpec, ProductDimension, ProductFeature, ProductReview, LifestyleSection } from "./productData";

// YouTube Video IDs (used on homepage / video section)
// Updated to the latest XSTO X12 / X12 Pro marketing videos from xsto.com
export const X12_YOUTUBE_ID = "ihXdzLuNz2s";
export const X12_PRO_YOUTUBE_ID = "4KFMBL5jX20";
export const X12_VIDEO_URL = `https://www.youtube.com/embed/${X12_YOUTUBE_ID}`;
export const X12_PRO_VIDEO_URL = `https://www.youtube.com/embed/${X12_PRO_YOUTUBE_ID}`;

// Self-hosted R2 MP4 for product page gallery
export const X12_R2_VIDEO = "https://pub-b6593f4aaa3143c4b018c61c953c56f7.r2.dev/xsto_x12__the_next-gen_ai-powered_all-terrain_mobility_robot_v1%20(1080p).mp4";

export const x12Specs: ProductSpec[] = [
  { label: "Max Load Capacity", value: "136 kg", unit: "(300 lbs)" },
  { label: "Top Speed", value: "0–12 km/h", unit: "(7.5 mph)" },
  { label: "Range", value: "35 km", unit: "(22 miles)" },
  { label: "Max Stair Slope", value: "40°" },
  { label: "Weight (no battery)", value: "115 kg", unit: "(254 lbs)" },
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

export const x12Dimensions: ProductDimension[] = [
  { label: "Lifting Range (Seat Height)", value: "490–762 mm (19.3\"–30\")" },
  { label: "Seat Width", value: "390–440 mm (15.4\"–17.3\")" },
  { label: "Seat Depth", value: "380–435 mm (15\"–17.1\")" },
  { label: "Tilt Angle", value: "-8° to 40°" },
  { label: "Recline Angle", value: "90°–121°" },
  { label: "Legrest Adjustment", value: "Manual" },
  { label: "Folded Dimensions", value: "1185 × 685 × 617 mm" },
  { label: "Unfolded Dimensions", value: "1210 × 685 × 1550 mm" },
  { label: "Compatible Step Height", value: "< 200 mm" },
  { label: "Compatible Step Incline", value: "< 35°" },
  { label: "Stair Platform (L-shape)", value: "1400 × 1400 mm" },
  { label: "Stair Platform (U-shape)", value: "1400 × 2000 mm" },
  { label: "Ditch Crossing (Wheeled)", value: "< 180 mm" },
  { label: "Ditch Crossing (Tracked)", value: "< 300 mm" },
];

export const x12Features: ProductFeature[] = [
  {
    title: "AI-Powered Automation",
    description: "Automatically detects terrain changes and switches driving modes in real time. Intelligently adjusts power output to adapt to different surfaces for a smooth, comfortable ride.",
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
    title: "Intelligent Drift Correction",
    description: "Detects track tilt or abnormal operation and actively corrects the path for optimal safety and comfort — even on challenging off-camber terrain.",
    icon: "Settings",
  },
  {
    title: "LiDAR Hazard Protection",
    description: "Precision LiDAR scanning detects obstacles, prevents high-speed collisions, warns of drop-offs, and proactively alerts to potential risks before they become dangers.",
    icon: "Shield",
  },
  {
    title: "Posture-Adjusting Comfort",
    description: "Dynamic rocking-chair motion alleviates fatigue from prolonged sitting, helps prevent pressure sores, and provides extra comfort during outdoor leisure time.",
    icon: "Battery",
  },
];

export const x12Reviews: ProductReview[] = [
  {
    name: "Michael R.",
    date: "January 2026",
    rating: 5,
    title: "Truly revolutionary mobility",
    content: "The X12 changed everything for me. I can now navigate the stairs in my split-level home without any assistance. The AI control is incredible—it just handles everything automatically.",
  },
  {
    name: "Sarah T.",
    date: "January 2026",
    rating: 5,
    title: "Worth every penny",
    content: "After trying multiple mobility solutions, the X12 is in a league of its own. The all-terrain capability means I can go anywhere—parks, trails, even rocky paths. Life-changing!",
  },
];

// X12 Lifestyle sections
const x12LifestyleSections: LifestyleSection[] = [
  {
    title: "Every Path Is a Smooth One",
    description: "Stairs, ramps, and uneven terrain are no longer obstacles. The X12's wheeled quadruped chassis combined with a dual-track crawler system and 14 power systems handles complex indoor and outdoor terrain as easily as walking on flat ground.",
    image: { src: x12Stairs, alt: "XSTO X12 Climbing Stairs", caption: "Effortless Stair Climbing up to 40°" },
    imagePosition: 'right',
    highlights: ["40° stair climbing", "14 integrated power systems", "Automatic step detection"],
  },
  {
    title: "Conquer Terrain, Boundless Freedom",
    description: "From nature trails to city streets, the X12 crosses ditches up to 300 mm wide, clears 220 mm rear obstacles, and handles forward slopes up to 15° in wheeled mode or 40° on tracks. No path is off-limits.",
    image: { src: x12Lifestyle5, alt: "XSTO X12 Boardwalk Lifestyle", caption: "Explore Nature with Confidence" },
    imagePosition: 'left',
    highlights: ["300 mm ditch crossing", "220 mm obstacle clearance", "22-mile range"],
  },
  {
    title: "Three Modes, Any Environment",
    description: "Track Crawling Mode powers through extreme trenches with dual motors. Wheel-Track Composite Mode handles stairs and steep slopes. Wheeled Quadruped Mode adapts to flat ground, grassland, and gravel with four-wheel independent suspension.",
    image: { src: x12Control1, alt: "XSTO X12 Control System", caption: "Intelligent Mode Switching" },
    imagePosition: 'right',
    highlights: ["Track Crawling Mode", "Wheel-Track Composite Mode", "Wheeled Quadruped Mode"],
  },
  {
    title: "Balanced & Stable on Every Surface",
    description: "The industry-first stabilisation system uses gyroscopes and a proprietary spatial safety algorithm to automatically compensate seat posture and maintain balance across slopes, steps, and rugged terrain — keeping you level no matter what's underfoot.",
    image: { src: x12Recline, alt: "XSTO X12 Self-Balancing", caption: "Dynamic Balance on All Terrain" },
    imagePosition: 'left',
    highlights: ["Gyroscopic stabilisation", "Auto seat posture compensation", "Dynamic balance on all terrain"],
  },
  {
    title: "Go Further, Stay Comfortable",
    description: "The dynamic posture-adjusting system works like a rocking chair to alleviate fatigue from prolonged sitting and helps prevent pressure sores. With a 35 km range and IPX5 weather resistance, you can explore all day in comfort.",
    image: { src: x12Terrain, alt: "XSTO X12 Off-Road", caption: "All-Day Comfort & Range" },
    imagePosition: 'right',
    highlights: ["Anti-fatigue posture adjustment", "35 km range per charge", "IPX5 weather resistant"],
  },
];

export const x12Product: ProductData = {
  id: "e7a8b9c0-1234-5678-9abc-def012345678",
  slug: "xsto-x12",
  name: "XSTO X12",
  tagline: "Embodied Mobile Robot — The First AI-Powered All-Terrain Mobility Robot",
  description: "The XSTO X12 redefines personal mobility. A wheeled quadruped chassis with dual-track crawler system and 14 integrated power systems conquers stairs up to 40°, crosses 300 mm ditches, and clears 220 mm obstacles — while AI-powered automation switches modes, adjusts power, and corrects drift in real time. Industry-first gyroscopic self-balancing keeps you level on any terrain.",
  price: 15995,
  // Curated product images only (videos live in the Videos tab)
  images: [
    { src: x12HeroStudio, alt: "XSTO X12 Stair Climbing Studio Shot", caption: "Conquer Any Staircase" },
    { src: "/xsto/x12/85ff56-x12-banner-B4qAUs3q.webp", alt: "XSTO X12 official banner", caption: "XSTO X12 — Official" },
    { src: "/xsto/x12/0e1c1e-x12-ChbT7hu4.webp", alt: "XSTO X12 product hero", caption: "Product Hero" },
    { src: "/xsto/x12/73d248-x12-360-DguNi-F-.png", alt: "XSTO X12 360 view", caption: "360° View" },
    { src: "/xsto/x12/99777d-x12-pro-ai-DVV18xPh.webp", alt: "XSTO X12 AI features", caption: "AI Automation" },
    { src: "/xsto/x12/113ae3-x12-pro-danger-CSLg-YLF.webp", alt: "XSTO X12 LiDAR safety", caption: "LiDAR Safety" },
    { src: "/xsto/x12/3df30f-x12-pro-sence-BW9zi7Sl.webp", alt: "XSTO X12 lifestyle scene", caption: "Real-World Use" },
    { src: "/xsto/x12/5cc3e9-x12-pro-sence_2-peLWHN-K.webp", alt: "XSTO X12 lifestyle scene", caption: "Real-World Use" },
    { src: x12WheeledMode, alt: "XSTO X12 Wheeled Mode", caption: "Wheeled Mode Configuration" },
    { src: x12CaterpillarSide, alt: "XSTO X12 Caterpillar Mode", caption: "Caterpillar Track System" },
    { src: x12StairClimb, alt: "XSTO X12 Stair Climbing", caption: "Automatic Stair Climbing" },
    { src: x12FoldedView, alt: "XSTO X12 Folded", caption: "Compact Folded Position" },
  ],
  videos: [
    { src: X12_VIDEO_URL, alt: "XSTO X12 official product video", caption: "Watch the X12 in Action", type: 'video' as const, thumbnail: x12HeroStudio },
  ],
  lifestyleSections: x12LifestyleSections,
  specs: x12Specs,
  dimensions: x12Dimensions,
  features: x12Features,
  reviews: x12Reviews,
  highlights: [
    "AI-powered automatic mode switching",
    "Climbs stairs up to 40° incline",
    "360° gyroscopic self-balancing",
    "35 km range on dual batteries",
    "Three terrain modes for any surface",
    "LiDAR obstacle detection & hazard alerts",
    "300 mm ditch crossing capability",
    "IPX5 water resistant",
  ],
  inBox: [
    "XSTO X12 All-Terrain Mobility Robot",
    "2× 25.2V 25.6Ah Lithium Battery Packs",
    "Battery Charger",
    "Joystick Controller",
    
    "Wireless Key",
    "User Manual",
    "Tool Kit",
  ],
  warrantyMonths: 60,
};
